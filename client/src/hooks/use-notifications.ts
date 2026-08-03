import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Notification {
  id: number;
  userId: string;
  type: string;
  tribeId: number | null;
  proposalId: number | null;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000, // poll every 30s
  });
}

export function useUnreadNotificationCount() {
  return useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });
}

export function useMarkTribeNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tribeId: number) => apiRequest("PATCH", `/api/notifications/read-tribe/${tribeId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });
}
