import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/query/profile/profile-api';
import Toast from 'react-native-toast-message';
import { UpdateProfileByTypeInput, UserProfileResponse } from './types';
import { useSession } from '@/context/auth-context';

export const useProfile = () => {
  const { session } = useSession();
  
  return useQuery<UserProfileResponse>({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    enabled: !!session,
  });
};

export const useUpdateBaseProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateBaseProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      // Fallback for cache update
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    },
  });
};

export const useUpdateProfileByType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, data }: UpdateProfileByTypeInput) =>
      profileApi.updateProfileByType(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Toast.show({
        type: 'success',
        text1: 'Profile detail updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile detail',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    },
  });
};

export const useUpdatePhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string) => profileApi.updatePhoneNumber(phoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Toast.show({
        type: 'success',
        text1: 'Phone number updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update phone number',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    },
  });
};

export const useInitiatePhoneVerification = () => {
  return useMutation({
    mutationFn: profileApi.initiatePhoneVerification,
    onSuccess: (data) => {
      Toast.show({
        type: 'info',
        text1: 'Verification initiated',
        text2: 'Please follow the instructions in the Telegram bot',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to initiate verification',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    },
  });
};
