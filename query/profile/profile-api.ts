import { api } from '@/lib/api';
import { 
  UpdateBaseProfileInput, 
  UserProfileResponse, 
  UserType 
} from './types';

export const profileApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateBaseProfile: async (data: UpdateBaseProfileInput): Promise<UserProfileResponse> => {
    const response = await api.patch('/profile/base', data);
    return response.data;
  },

  updateProfileByType: async (type: UserType, data: any): Promise<any> => {
    const response = await api.patch(`/profile/${type}`, data);
    return response.data;
  },

  updatePhoneNumber: async (phoneNumber: string): Promise<UserProfileResponse> => {
    const response = await api.patch('/profile/phone-number', { phoneNumber });
    return response.data;
  },

  initiatePhoneVerification: async () => {
    const response = await api.post('/profile/verify-phone/telegram');
    return response.data;
  },
};
