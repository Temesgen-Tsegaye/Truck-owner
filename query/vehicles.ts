import { api } from "@/lib/api";
import { CreateVehicleInput, VehicleItem } from "@/lib/vehicle-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";

export const useVehiclesQuery = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await api.get<VehicleItem[]>("/vehicles");
      return data;
    },
  });
};

export const useCreateVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVehicleInput) =>
      api.post("/vehicles", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      Toast.show({
        type: "success",
        text1: "Truck added",
        text2: "Your truck has been added successfully.",
      });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Failed to add truck",
        text2: message,
      });
    },
  });
};

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      Toast.show({
        type: "success",
        text1: "Truck removed",
      });
    },
  });
};
