import { useRoute } from "wouter";
import { useTribe, useTribeMessages, useSendMessage, useJoinTribe } from "@/hooks/use-tribes";
import { NavBar } from "@/components/nav-bar";
import { Loader2, Send, Users, UserPlus, ArrowLeft, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function TribeDetailPage() {
  const [, params] = useRoute("/tribes/:id");
  const tribeId = parseInt(params?.id || "0");
  const { data: tribe, isLoading: isTribeLoading } = useTribe(tribeId);
  const { data: messages, isLoading: isMessagesLoading } = useTribeMessages(tribeId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: joinTribe, isPending: isJoining } = useJoinTribe();
  const { user } = useAuth();

  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMember = tribe?.members?.some((m: any) => m.user.id === user?.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    sendMessage({ tribeId, content: msgInput });
    setMsgInput("");
  };

  if (isTribeLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!tribe) return <div className="p-8">Tribe not found</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/tribes">
            <button className="p-2 rounded-full hover:bg-muted transition-colors" data-testid="button-back-to-tribes">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none" data-testid="text-tribe-name">{tribe.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{tribe.members?.length || 0} members</p>
          </div>
        </div>

        {!isMember && (
          <Button size="sm" onClick={() => joinTribe(tribeId)} disabled={isJoining} className="rounded-xl" data-testid="button-join-tribe">
            {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Join Tribe
          </Button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isMember ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Join to Chat</h2>
            <p className="text-sm max-w-sm">You need to be a member of this tribe to see and send messages.</p>
          </div>
        ) : isMessagesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages?.map((msg: any) => {
            const isMe = msg.user?.id === user?.id || msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <img
                    src={msg.user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.user?.firstName || "?"}`}
                    className="w-8 h-8 rounded-full mt-1 border border-border shrink-0"
                    alt="User"
                  />
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                }`}>
                  {!isMe && <div className="text-[10px] opacity-70 mb-1">{msg.user?.firstName}</div>}
                  {msg.isRadio && (
                    <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
                      <Radio className="w-3 h-3" /> Radio Message
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isMember && (
        <div className="p-4 bg-background border-t border-border shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder={`Message #${tribe.name}...`}
              className="flex-1 rounded-xl border-border bg-card"
              data-testid="input-tribe-message"
            />
            <Button type="submit" size="icon" disabled={isSending || !msgInput.trim()} className="rounded-xl h-10 w-10 shrink-0" data-testid="button-send-tribe-message">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
