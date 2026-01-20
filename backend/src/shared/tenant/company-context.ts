import { HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type SystemRole = 'ADMIN' | 'USER' | string;

export interface CompanyContext {
  userId: string;
  isSystemAdmin: boolean;
  companyId?: string;
}

export interface ResolveCompanyContextOptions {
  /**
   * If true and the user is a system ADMIN, require an explicit X-Company-Id.
   * Useful for user-like endpoints where an admin must choose tenant context.
   */
  requireCompanyIdForAdmin?: boolean;

  /**
   * If true and the user is a system ADMIN, allow omitting X-Company-Id and return companyId as undefined.
   * Useful for admin list endpoints that span all companies.
   */
  allowAllCompaniesForAdmin?: boolean;
}

function getUserIdFromRequest(req: any): string {
  const userId = req.user?.sub || req.user?.userId || req.user?.id;
  if (!userId) {
    throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
  }
  return userId;
}

function isSystemAdmin(req: any): boolean {
  const role: SystemRole = String(req.user?.role || '').toUpperCase();
  return role === 'ADMIN';
}

export async function resolveCompanyContext(
  dataSource: DataSource,
  req: any,
  requestedCompanyId?: string,
  options: ResolveCompanyContextOptions = {},
): Promise<CompanyContext> {
  const userId = getUserIdFromRequest(req);
  const admin = isSystemAdmin(req);

  const normalizedRequested = String(requestedCompanyId || '').trim();

  if (admin) {
    if (normalizedRequested) {
      return { userId, isSystemAdmin: true, companyId: normalizedRequested };
    }

    if (options.allowAllCompaniesForAdmin) {
      return { userId, isSystemAdmin: true };
    }

    if (options.requireCompanyIdForAdmin) {
      throw new HttpException(
        'X-Company-Id header is required for ADMIN requests',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { userId, isSystemAdmin: true };
  }

  // Non-admin: must operate within a company the user is a member of.
  if (normalizedRequested) {
    const membership = await dataSource.query(
      'SELECT company_id FROM company_members WHERE user_id = $1 AND company_id = $2 AND is_active = true LIMIT 1',
      [userId, normalizedRequested],
    );

    if (!membership || membership.length === 0) {
      throw new HttpException(
        'User is not associated with the selected company',
        HttpStatus.FORBIDDEN,
      );
    }

    return { userId, isSystemAdmin: false, companyId: membership[0].company_id };
  }

  // If the user has exactly one active membership, use it.
  // If multiple, require explicit selection to avoid ambiguous tenant context.
  const memberships: Array<{ company_id: string }> = await dataSource.query(
    'SELECT company_id FROM company_members WHERE user_id = $1 AND is_active = true ORDER BY created_at ASC',
    [userId],
  );

  if (!memberships || memberships.length === 0) {
    throw new HttpException(
      'User is not associated with any company. Create a company first and associate your user.',
      HttpStatus.FORBIDDEN,
    );
  }

  if (memberships.length > 1) {
    throw new HttpException(
      'Multiple companies found for user. Please send X-Company-Id to select one.',
      HttpStatus.BAD_REQUEST,
    );
  }

  return { userId, isSystemAdmin: false, companyId: memberships[0].company_id };
}
