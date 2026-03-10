import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { InsertTribe } from "@shared/schema";

export function useTribes() {
  return useQuery({
    queryKey: ["/api/tribes"],
    queryFn: async () => {
      const res = await fetch("/api/tribes", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tribes");
      return res.json();
    },
  });
}

export function useTribe(id: number) {
  return useQuery({
    queryKey: ["/api/tribes", id],
    queryFn: async () => {
      const res = await fetch(`/api/tribes/${id}`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tribe");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateTribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTribe) => {
      const res = await fetch("/api/tribes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create tribe");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tribes"] });
      toast({ title: "Success", description: "Tribe created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useJoinTribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tribeId: number) => {
      const res = await fetch(`/api/tribes/${tribeId}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to join tribe");
      return res.json();
    },
    onSuccess: (_, tribeId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tribes", tribeId] });
      toast({ title: "Joined!", description: "You are now a member of this tribe." });
    },
  });
}

export function useTribeMessages(tribeId: number) {
  return useQuery({
    queryKey: ["/api/tribes", tribeId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/tribes/${tribeId}/messages`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!tribeId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tribeId, content, isRadio }: { tribeId: number; content: string; isRadio?: boolean }) => {
      const res = await fetch(`/api/tribes/${tribeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isRadio }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_, { tribeId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tribes", tribeId, "messages"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });
}
