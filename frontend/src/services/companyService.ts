import { api } from '@/services/api';

export interface MyCompanyResponse {
  success: boolean;
  company: { id: string; name: string; role: string } | null;
}

export interface CreateCompanyResponse {
  success: boolean;
  message: string;
  company: { id: string; name: string; role: string };
}

export const companyService = {
  getMyCompany: async (): Promise<MyCompanyResponse> => {
    const res = await api.get<MyCompanyResponse>('/companies/me');
    return res.data;
  },

  createCompany: async (name: string): Promise<CreateCompanyResponse> => {
    const res = await api.post<CreateCompanyResponse>('/companies', { name });
    return res.data;
  },
};
