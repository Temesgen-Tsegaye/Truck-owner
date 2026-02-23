import { api } from "@/lib/api";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";

export type MerchantSignupForm = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  pin: string;
  bussinessName: string;
  tinNumber: string;
  businessAddress: string;
};

export type MerchantLoginForm = {
  phoneNumber: string;
  pin: string;
};

export type PhoneCheckPayload = {
  phoneNumber: string;
  telegramData?: any;
};

export type VerifyPinPayload = {
  phoneNumber: string;
  pin: string;
  appType: "merchant" | "driver" | "vehicleOwner";
  telegramData?: any;
};

export const usePhoneCheckMutation = () => {
  return useMutation({
    mutationFn: async ({ phoneNumber, telegramData }: PhoneCheckPayload) =>
      api.post("/authentication/mobile/phone-check", {
        phoneNumber,
        appType: "merchant",
        telegramData,
      }),
    onError: (error) => {
      console.log({ error: JSON.stringify(error) });
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Phone check failed",
        text2: message,
      });
    },
    onSuccess: (data) => {
      // Toast handles in component for specific logic (exist/created)
    }
  });
};

export const useCheckStatusMutation = () => {
  return useMutation({
    mutationFn: async ({ phoneNumber }: { phoneNumber: string}) =>
      api.post("/authentication/mobile/check-status", {
        phoneNumber,
        appType: "merchant"
      }),
  });
};

export const useVerifyPinMutation = () => {
  return useMutation({
    mutationFn: async (payload: VerifyPinPayload) =>
      api.post("/authentication/mobile/verify-pin", payload),
    onError: (error) => {
      // 409 is handled by the component
      if (axios.isAxiosError(error) && error.response?.status === 409) return;

      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: message,
      });
    },
  });
};


export const useSignUpMerchantMutation = (
  options?: UseMutationOptions<any, Error, Partial<MerchantSignupForm>>
) => {
  return useMutation({
    mutationFn: async (payload: Partial<MerchantSignupForm>) =>
      api.post("/authentication/merchant/signup", {
        phoneNumber: payload.phoneNumber,
        pin: payload.pin,
      }),
    onError: (error) => {
      // 409 is handled by the component
      if (axios.isAxiosError(error) && error.response?.status === 409) return;

      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: message,
      });
    },
    ...options,
  });
};

export const useSignInMerchantMutation = (
  options?: UseMutationOptions<any, Error, MerchantLoginForm>
) => {
  return useMutation({
    mutationFn: async (payload: MerchantLoginForm) =>
      api.post("/authentication/merchant/signin", payload),
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          error.message
        : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: message,
      });
    },
    ...options,
  });
};
