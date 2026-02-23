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
  capacity: z.number().positive("Capacity must be positive"),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
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
  createdAt: string;
  driverId: string | null;
  driver: DriverInfo | null;
};
