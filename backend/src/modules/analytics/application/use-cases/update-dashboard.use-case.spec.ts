import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UpdateDashboardUseCase } from './update-dashboard.use-case';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';
import { Dashboard } from '../../domain/entities/dashboard';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('UpdateDashboardUseCase', () => {
    let useCase: UpdateDashboardUseCase;
    let mockDashboardRepo: jest.Mocked<IDashboardRepository>;

    const COMPANY_ID = 'company-123';
    const DASHBOARD_ID = 'dashboard-456';

    const createMockDashboard = (overrides?: { embedHtml?: string }): Dashboard => {
        const result = Dashboard.create(
            {
                companyId: COMPANY_ID,
                name: 'Test Dashboard',
                description: 'Test description',
                isDefault: false,
                embedHtml: overrides?.embedHtml,
                createdBy: 'user-789',
            },
            new UniqueEntityID(DASHBOARD_ID),
        );
        return result.getValue();
    };

    beforeEach(() => {
        mockDashboardRepo = {
            save: jest.fn(),
            findById: jest.fn(),
            findByCompanyId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as jest.Mocked<IDashboardRepository>;

        useCase = new UpdateDashboardUseCase(mockDashboardRepo);
    });

    it('should update dashboard with valid embedHtml', async () => {
        const dashboard = createMockDashboard();
        mockDashboardRepo.findById.mockResolvedValue(dashboard);
        mockDashboardRepo.update.mockResolvedValue();

        const embedHtml = '<html><body><h1>My Report</h1></body></html>';

        const result = await useCase.execute({
            dashboardId: DASHBOARD_ID,
            companyId: COMPANY_ID,
            embedHtml,
        });

        expect(result.embedHtml).toBe(embedHtml);
        expect(mockDashboardRepo.update).toHaveBeenCalledTimes(1);
    });

    it('should store HTML as-is (security handled at render time)', async () => {
        const dashboard = createMockDashboard();
        mockDashboardRepo.findById.mockResolvedValue(dashboard);
        mockDashboardRepo.update.mockResolvedValue();

        const fullHtml = '<html><head><style>body{color:red}</style></head><body><table><tr><td>Data</td></tr></table></body></html>';

        const result = await useCase.execute({
            dashboardId: DASHBOARD_ID,
            companyId: COMPANY_ID,
            embedHtml: fullHtml,
        });

        expect(result.embedHtml).toBe(fullHtml);
    });

    it('should clear embedHtml when set to empty string', async () => {
        const dashboard = createMockDashboard({
            embedHtml: '<iframe src="https://app.powerbi.com/view?r=old"></iframe>',
        });
        mockDashboardRepo.findById.mockResolvedValue(dashboard);
        mockDashboardRepo.update.mockResolvedValue();

        const result = await useCase.execute({
            dashboardId: DASHBOARD_ID,
            companyId: COMPANY_ID,
            embedHtml: '',
        });

        expect(result.embedHtml).toBeUndefined();
    });

    it('should not change embedHtml when not provided in request', async () => {
        const existingEmbed = '<html><body><h1>Existing</h1></body></html>';
        const dashboard = createMockDashboard({ embedHtml: existingEmbed });
        mockDashboardRepo.findById.mockResolvedValue(dashboard);
        mockDashboardRepo.update.mockResolvedValue();

        const result = await useCase.execute({
            dashboardId: DASHBOARD_ID,
            companyId: COMPANY_ID,
            name: 'New Name',
        });

        expect(result.embedHtml).toBe(existingEmbed);
        expect(result.name).toBe('New Name');
    });

    it('should throw if dashboard not found', async () => {
        mockDashboardRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({
                dashboardId: 'nonexistent',
                companyId: COMPANY_ID,
            }),
        ).rejects.toThrow('Dashboard not found');
    });

    it('should throw if company mismatch', async () => {
        const dashboard = createMockDashboard();
        mockDashboardRepo.findById.mockResolvedValue(dashboard);

        await expect(
            useCase.execute({
                dashboardId: DASHBOARD_ID,
                companyId: 'wrong-company',
            }),
        ).rejects.toThrow('Unauthorized');
    });
});
