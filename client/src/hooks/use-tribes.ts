import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { Tribe, MessageWithUser } from "@shared/routes";
import type { InsertTribe } from "@shared/schema";

// List all tribes
export function useTribes() {
  return useQuery({
    queryKey: [api.tribes.list.path],
    queryFn: async () => {
      const res = await fetch(api.tribes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tribes");
      return api.tribes.list.responses[200].parse(await res.json());
    },
  });
}

// Get single tribe detail
export function useTribe(id: number) {
  return useQuery({
    queryKey: [api.tribes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tribes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tribe");
      return api.tribes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Create a new tribe
export function useCreateTribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTribe) => {
      const res = await fetch(api.tribes.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to create tribe");
      }
      return api.tribes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tribes.list.path] });
      toast({ title: "Success", description: "Tribe created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Join a tribe
export function useJoinTribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tribeId: number) => {
      const url = buildUrl(api.tribes.join.path, { id: tribeId });
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to join tribe");
      return api.tribes.join.responses[200].parse(await res.json());
    },
    onSuccess: (_, tribeId) => {
      queryClient.invalidateQueries({ queryKey: [api.tribes.get.path, tribeId] });
      toast({ title: "Joined!", description: "You are now a member of this tribe." });
    },
  });
}

// Get messages for a tribe (polling enabled)
export function useTribeMessages(tribeId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, tribeId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { id: tribeId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!tribeId,
    refetchInterval: 3000, // Poll every 3 seconds as requested
  });
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tribeId, content }: { tribeId: number; content: string }) => {
      const url = buildUrl(api.messages.create.path, { id: tribeId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { tribeId }) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, tribeId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });
}
