import { AxiosError } from 'axios';

import { api } from '@/lib/api';
import { RegistrationRequest, RegistrationResponse } from '@/lib/data/manufacturer';

export class ManufacturerService {
  static async register(data: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      const response = await api.post<RegistrationResponse>('/api/auth/register', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  }
}