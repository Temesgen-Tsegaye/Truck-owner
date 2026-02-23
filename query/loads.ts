import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";
import { CreateLoadInput, LoadItem } from "@/lib/load-schemas";

export const useLoadsQuery = () => {
  return useQuery({
    queryKey: ["loads"],
    queryFn: async () => {
      const { data } = await api.get<{ data: LoadItem[] }>("/loads/feed");
      return data.data;
    },
  });
};

export const useCreateLoadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLoadInput) =>
      api.post("/loads", {
        ...payload,
        deliveryDate: payload.deliveryDate.toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads"] });
      Toast.show({
        type: "success",
        text1: "Load created",
        text2: "Your load has been posted successfully.",
      });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Create load failed",
        text2: message,
      });
    },
  });
};
