import { z } from 'zod';

export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profilePicture: z.string().optional(),
});

export const merchantProfileSchema = z.object({
  bussinessName: z.string().optional(),
  address: z.string().optional(),
  tinNumber: z.string().optional(),
});

export type UserProfileForm = z.infer<typeof userProfileSchema>;
export type MerchantProfileForm = z.infer<typeof merchantProfileSchema>;
