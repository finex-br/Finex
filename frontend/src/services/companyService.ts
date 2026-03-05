import { api } from '@/services/api';

export interface MyCompanyResponse {
  success: boolean;
  company: { id: string; name: string; role: string } | null;
}

export interface CompanySummary {
  id: string;
  name: string;
  role: string;
}

export interface ListMyCompaniesResponse {
  success: boolean;
  companies: CompanySummary[];
  total: number;
}

export interface CreateCompanyResponse {
  success: boolean;
  message: string;
  company: { id: string; name: string; role: string };
}

export const companyService = {
  getMyCompany: async (companyId?: string): Promise<MyCompanyResponse> => {
    const res = await api.get<MyCompanyResponse>('/companies/me', {
      headers: companyId ? { 'x-company-id': companyId } : undefined,
    });
    return res.data;
  },

  listMyCompanies: async (): Promise<ListMyCompaniesResponse> => {
    const res = await api.get<ListMyCompaniesResponse>('/companies');
    return res.data;
  },

  createCompany: async (name: string): Promise<CreateCompanyResponse> => {
    const res = await api.post<CreateCompanyResponse>('/companies', { name });
    return res.data;
  },

  getCompanyName: async (companyId: string): Promise<string> => {
    const res = await api.get<{ success: boolean; companyName: string }>(`/companies/${companyId}/name`);
    return res.data.companyName;
  },
};
