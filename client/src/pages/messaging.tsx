import { useState, useRef, useEffect } from "react";
import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, MessageCircle, ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@shared/schema";

export default function MessagingPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (selectedUser) {
    return <DMChat user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display" data-testid="text-messages-title">Messages</h1>
            <p className="text-sm text-muted-foreground">Direct conversations</p>
          </div>
        </div>
      </div>

      <div className="px-5 flex-1">
        <ConversationsList onSelect={setSelectedUser} />
      </div>

      <NavBar />
    </div>
  );
}

function ConversationsList({ onSelect }: { onSelect: (user: User) => void }) {
  const [searchMode, setSearchMode] = useState(false);
  const [search, setSearch] = useState("");
  const { user: me } = useAuth();

  const { data: conversations, isLoading: convLoading } = useQuery({
    queryKey: ["/api/dm"],
    queryFn: async () => { const res = await fetch("/api/dm", { credentials: "include" }); if (!res.ok) throw new Error("err"); return res.json() as Promise<User[]>; },
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => { const res = await fetch("/api/users", { credentials: "include" }); if (!res.ok) throw new Error("err"); return res.json() as Promise<User[]>; },
    enabled: searchMode,
  });

  const filteredUsers = searchMode
    ? (allUsers || []).filter((u) => u.id !== me?.id && (u.firstName?.toLowerCase().includes(search.toLowerCase()) || u.lastName?.toLowerCase().includes(search.toLowerCase())))
    : conversations || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {searchMode ? (
          <>
            <button onClick={() => { setSearchMode(false); setSearch(""); }} className="p-2" data-testid="button-back-from-search"><ArrowLeft className="w-5 h-5" /></button>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people..." className="flex-1 bg-white/5 border-white/10" autoFocus data-testid="input-search-users" />
          </>
        ) : (
          <Button variant="outline" className="w-full justify-start gap-2 rounded-xl border-white/10 bg-white/5" onClick={() => setSearchMode(true)} data-testid="button-new-message">
            <UserPlus className="w-4 h-4" /> New Message
          </Button>
        )}
      </div>

      {(convLoading || (searchMode && usersLoading)) ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{searchMode ? "No users found" : "No conversations yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <button key={u.id} onClick={() => onSelect(u)} className="w-full flex items-center gap-3 p-4 glass-card rounded-xl hover:border-purple-500/20 transition-colors text-left" data-testid={`button-conversation-${u.id}`}>
              <img src={u.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.firstName}`} alt="" className="w-10 h-10 rounded-full border border-white/10" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">@{u.email?.split("@")[0] || u.id.slice(0, 8)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DMChat({ user: otherUser, onBack }: { user: User; onBack: () => void }) {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/dm", otherUser.id],
    queryFn: async () => { const res = await fetch(`/api/dm/${otherUser.id}`, { credentials: "include" }); if (!res.ok) throw new Error("err"); return res.json(); },
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => { const res = await fetch(`/api/dm/${otherUser.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }), credentials: "include" }); if (!res.ok) throw new Error("err"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dm", otherUser.id] }); queryClient.invalidateQueries({ queryKey: ["/api/dm"] }); },
  });

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = (e: React.FormEvent) => { e.preventDefault(); if (!msgInput.trim()) return; sendMutation.mutate(msgInput); setMsgInput(""); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(180deg, hsl(222 47% 5%) 0%, hsl(240 30% 6%) 50%, hsl(265 30% 7%) 100%)" }}>
      <header className="h-16 border-b border-white/5 flex items-center gap-3 px-4 bg-[hsl(222,41%,6%)]/90 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full bg-white/5" data-testid="button-back-from-dm"><ArrowLeft className="w-5 h-5" /></button>
        <img src={otherUser.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.firstName}`} alt="" className="w-8 h-8 rounded-full border border-white/10" />
        <p className="font-semibold text-sm" data-testid="text-dm-username">{otherUser.firstName} {otherUser.lastName}</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">Say hello!</div>
        ) : (
          messages?.map((msg: any) => {
            const isMe = msg.senderId === me?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "glass-card rounded-tl-sm"}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-[hsl(222,41%,6%)]">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder={`Message ${otherUser.firstName}...`} className="flex-1 rounded-xl bg-white/5 border-white/10" data-testid="input-dm-message" />
          <Button type="submit" size="icon" disabled={sendMutation.isPending || !msgInput.trim()} className="rounded-xl shrink-0 bg-primary" data-testid="button-send-dm">
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
