export type UserType = 'merchant' | 'driver' | 'vehicleOwner';

export interface MerchantProfile {
  id: string;
  address?: string;
  bussinessName?: string;
  tinNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleOwnerProfile {
  id: string;
  name?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  id: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  phoneVerified: boolean;
  telegramId?: string;
  telegramUsername?: string;
  createdAt: string;
  updatedAt: string;
  merchant?: MerchantProfile;
  vehicleOwner?: VehicleOwnerProfile;
  driver?: DriverProfile;
}

export interface UpdateBaseProfileInput {
  firstName?: string;
  lastName?: string;
  pin?: string;
}

export interface UpdateMerchantInput {
  address?: string;
  bussinessName?: string;
  tinNumber?: string;
}

export interface UpdateVehicleOwnerInput {
  name?: string;
  contactInfo?: string;
}

export interface UpdateDriverInput {
  // Add driver specific fields if any
}

export type UpdateProfileByTypeInput = 
  | { type: 'merchant'; data: UpdateMerchantInput }
  | { type: 'vehicleOwner'; data: UpdateVehicleOwnerInput }
  | { type: 'driver'; data: UpdateDriverInput };
