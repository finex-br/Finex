import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly dataSource: DataSource) {}

  private async getUserId(req: any): Promise<string> {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
    }
    return userId;
  }

  @Get()
  async listMyCompanies(@Request() req: any) {
    const userId = await this.getUserId(req);

    // Check if user is system admin
    const userRows = await this.dataSource.query(
      `SELECT role FROM users WHERE id = $1`,
      [userId],
    );
    const isAdmin = userRows?.[0]?.role === 'ADMIN';

    // If admin, return ALL companies in the system
    if (isAdmin) {
      const allCompanies = await this.dataSource.query(
        `SELECT id, name, created_at
         FROM companies
         ORDER BY name ASC`,
      );

      return {
        success: true,
        companies: (allCompanies || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          role: 'ADMIN',
        })),
        total: (allCompanies || []).length,
      };
    }

    const rows = await this.dataSource.query(
      `SELECT cm.company_id, c.name as company_name, cm.role as member_role
       FROM company_members cm
       JOIN companies c ON c.id = cm.company_id
       WHERE cm.user_id = $1 AND cm.is_active = true
       ORDER BY cm.created_at ASC`,
      [userId],
    );

    return {
      success: true,
      companies: (rows || []).map((r: any) => ({
        id: r.company_id,
        name: r.company_name,
        role: r.member_role,
      })),
      total: (rows || []).length,
    };
  }

  @Get('me')
  async getMyCompany(
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const userId = await this.getUserId(req);

    const rows = await this.dataSource.query(
      `SELECT cm.company_id, c.name as company_name, cm.role as member_role
       FROM company_members cm
       JOIN companies c ON c.id = cm.company_id
       WHERE cm.user_id = $1 AND cm.is_active = true
       ORDER BY cm.created_at ASC`,
      [userId],
    );

    if (!rows || rows.length === 0) {
      return { success: true, company: null };
    }

    if (xCompanyId) {
      const selected = rows.find((r: any) => String(r.company_id) === String(xCompanyId));
      if (!selected) {
        throw new HttpException(
          'User is not a member of the requested company',
          HttpStatus.FORBIDDEN,
        );
      }

      return {
        success: true,
        company: {
          id: selected.company_id,
          name: selected.company_name,
          role: selected.member_role,
        },
      };
    }

    if (rows.length > 1) {
      throw new HttpException(
        'Multiple companies found for user. Please send X-Company-Id to select one, or call GET /companies to list them.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      company: {
        id: rows[0].company_id,
        name: rows[0].company_name,
        role: rows[0].member_role,
      },
    };
  }

  @Post()
  async createCompany(@Body() body: any, @Request() req: any) {
    const userId = await this.getUserId(req);

    const name = String(body?.name || '').trim();
    if (!name) {
      throw new HttpException('Company name is required', HttpStatus.BAD_REQUEST);
    }

    // If user already has an active company, don't create another silently.
    const existing = await this.dataSource.query(
      'SELECT company_id FROM company_members WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId],
    );

    if (existing && existing.length > 0) {
      throw new HttpException(
        'User is already associated with a company',
        HttpStatus.CONFLICT,
      );
    }

    const created = await this.dataSource.transaction(async (manager) => {
      const companyRows = await manager.query(
        `INSERT INTO companies (name)
         VALUES ($1)
         RETURNING id, name, created_at`,
        [name],
      );

      const companyId = companyRows[0].id;

      await manager.query(
        `INSERT INTO company_members (user_id, company_id, role, is_active)
         VALUES ($1, $2, $3, true)`,
        [userId, companyId, 'OWNER'],
      );

      return {
        companyId,
        companyName: companyRows[0].name,
      };
    });

    return {
      success: true,
      message: 'Company created and user associated successfully',
      company: {
        id: created.companyId,
        name: created.companyName,
        role: 'OWNER',
      },
    };
  }
}
