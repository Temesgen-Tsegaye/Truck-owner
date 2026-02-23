import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useChatRoomsQuery = () => {
  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async () => {
      const { data } = await api.get("/chat/rooms");
      return data;
    },
  });
};