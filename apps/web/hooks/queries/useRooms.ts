import { useQuery } from "@tanstack/react-query";
import { roomsApi } from "@/lib/api/rooms.api";

export const ROOMS_QUERY_KEY = ["rooms"] as const;

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: () => roomsApi.list(),
    staleTime: 60_000,
  });
}
