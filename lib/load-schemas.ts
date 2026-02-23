import { z } from "zod";

export const loadTypeValues = ["LIQUID", "SOLID"] as const;

export const loadCategoryValues = [
  "CONSTUCTION_MATERIALS",
  "AGRICULTURAL_PRODUCTS",
  "CONSUMER_GOODS",
  "ELECTRONICS",
  "FURNITURE",
  "VEHICLES",
  "HAZARDOUS_MATERIALS",
  "PERISHABLE_GOODS",
  "OTHER",
] as const;

export const createLoadSchema = z.object({
  location: z.string().min(1),
  weight: z.number().positive(),
  loadType: z.enum(loadTypeValues),
  loadCategory: z.enum(loadCategoryValues),
  deliveryDate: z.date(),
  startingPlace: z.string().min(1),
  destinationPlace: z.string().min(1),
});

export type CreateLoadInput = z.infer<typeof createLoadSchema>;
export type LoadType = (typeof loadTypeValues)[number];
export type LoadCategory = (typeof loadCategoryValues)[number];

export type LoadItem = {
  id: string;
  merchantId: string;
  location: string;
  weight: number;
  loadType: LoadType;
  loadCategory: LoadCategory;
  deliveryDate: string;
  startingPlace: string;
  destinationPlace: string;
  isApproved: boolean;
  createdAt: string;
};
