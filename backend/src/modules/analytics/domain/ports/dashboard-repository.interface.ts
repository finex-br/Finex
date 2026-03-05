import { Dashboard } from '../entities/dashboard';

export interface IDashboardRepository {
  save(dashboard: Dashboard): Promise<void>;
  findById(id: string): Promise<Dashboard | null>;
  findByCompanyId(companyId: string): Promise<Dashboard[]>;
  update(dashboard: Dashboard): Promise<void>;
  delete(id: string): Promise<void>;
}
