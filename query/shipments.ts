import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface ShipmentItem {
  id: string;
  status: string;
  load: {
    id: string;
    productType: string;
    quantity: number;
    origin: string;
    destination: string;
    startingPlace: string;
    destinationPlace: string;
    weight: number;
    deliveryDate: string;
    merchant: {
      id: string;
      user: {
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
      };
    };
  };
  vehicle: {
    id: string;
    licensePlate: string;
    vehicleType: string;
    vehicleOwner: {
      id: string;
      user: {
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
  driver?: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export const useShipmentsQuery = () => {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data } = await api.get<ShipmentItem[]>("/shipments");
      return data;
    },
  });
};

export const useShipmentQuery = (id: string) => {
  return useQuery({
    queryKey: ["shipment", id],
    queryFn: async () => {
      const { data } = await api.get<any>(`/shipments/${id}`);
      return data;
    },
    enabled: !!id,
  });
};