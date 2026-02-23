import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";

export interface Driver {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    telegramUsername: string | null;
  };
  vehicle: {
    id: string;
    licensePlate: string;
    vehicleType: string;
  } | null;
}

export interface DriverAssignmentRequest {
  id: string;
  vehicleId: string;
  driverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  vehicle: {
    id: string;
    licensePlate: string;
    vehicleType: string;
  };
  driver: Driver;
  requestedByUser: {
    id: string;
    name: string | null;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  createdAt: string;
}

export interface SearchDriversParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateAssignmentRequestParams {
  vehicleId: string;
  driverId: string;
}

export const useSearchDriversQuery = (params: SearchDriversParams) => {
  return useQuery({
    queryKey: ["drivers", "search", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: Driver[]; meta: any }>("/driver-assignment-requests/drivers", { params });
      return data;
    },
    enabled: !!params.search && params.search.length >= 2,
  });
};

export const useCreateAssignmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAssignmentRequestParams) =>
      api.post("/driver-assignment-requests", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-assignment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      Toast.show({
        type: "success",
        text1: "Request sent",
        text2: "Driver assignment request has been sent successfully.",
      });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Failed to send request",
        text2: message,
      });
    },
  });
};

export const useAssignmentRequestsQuery = () => {
  return useQuery({
    queryKey: ["driver-assignment-requests"],
    queryFn: async () => {
      const { data } = await api.get<DriverAssignmentRequest[]>("/driver-assignment-requests");
      return data;
    },
  });
};

export const useAcceptAssignmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) =>
      api.patch(`/driver-assignment-requests/${requestId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-assignment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      Toast.show({
        type: "success",
        text1: "Request accepted",
        text2: "You have accepted the driver assignment request.",
      });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Failed to accept request",
        text2: message,
      });
    },
  });
};

export const useRejectAssignmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) =>
      api.patch(`/driver-assignment-requests/${requestId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-assignment-requests"] });
      Toast.show({
        type: "success",
        text1: "Request rejected",
        text2: "You have rejected the driver assignment request.",
      });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Failed to reject request",
        text2: message,
      });
    },
  });
};

export const useCancelAssignmentRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) =>
      api.delete(`/driver-assignment-requests/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-assignment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      Toast.show({
        type: "success",
        text1: "Request cancelled",
        text2: "Driver assignment request has been cancelled.",
      });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Failed to cancel request",
        text2: message,
      });
    },
  });
};