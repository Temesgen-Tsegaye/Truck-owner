import { z } from "zod";

export const vehicleTypeValues = [
  "TRUCK",
  "VAN",
  "TRAILER",
  "FLATBED",
  "TANKER",
  "REFRIGERATED",
  "BOX_TRUCK",
  "OTHER",
] as const;

export const createVehicleSchema = z.object({
  vehicleType: z.enum(vehicleTypeValues),
  licensePlate: z.string().min(1, "License plate is required"),
  capacity: z.coerce.number().positive("Capacity must be positive"),
  carImage: z.string().optional(),
});

export const updateVehicleSchema = z.object({
  vehicleType: z.enum(vehicleTypeValues).optional(),
  licensePlate: z.string().min(1, "License plate is required").optional(),
  capacity: z.coerce.number().positive("Capacity must be positive").optional(),
  carImage: z.string().optional(),
  driverId: z.string().uuid().nullable().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleType = (typeof vehicleTypeValues)[number];

export type DriverInfo = {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    telegramUsername: string | null;
  };
};

export type VehicleItem = {
  id: string;
  vehicleOwnerId: string;
  vehicleType: VehicleType;
  licensePlate: string;
  capacity: number;
  carImage?: string;
  createdAt: string;
  driverId: string | null;
  driver: DriverInfo | null;
};
