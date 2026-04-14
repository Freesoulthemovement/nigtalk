import { useState, useRef, useEffect } from "react";
import { MessageCircle, Volume2, VolumeX, Play, Gift } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

function VibeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12c0 0 2-4 5-4s3 8 6 8 5-4 5-4" />
      <path d="M7 12c0 0 1-2 2.5-2s1.5 4 3 4 2.5-2 2.5-2" />
    </svg>
  );
}

function NotVibeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12c0 0 2-4 5-4s3 8 6 8 5-4 5-4" opacity="0.3" />
      <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.5" />
    </svg>
  );
}

interface VideoCardProps {
  video: any;
  isActive: boolean;
}

export function VideoCard({ video, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vibeData } = useQuery({
    queryKey: ["/api/vibes", video.id],
    queryFn: async () => { const res = await fetch(`/api/vibes/${video.id}`); return res.json(); },
  });

  const vibeMutation = useMutation({
    mutationFn: async (isVibe: boolean) => {
      const res = await fetch("/api/vibes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId: video.id, isVibe }), credentials: "include" });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vibes", video.id] }),
  });

  const [commentCount] = useState(Math.floor(Math.random() * 50));

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
      else { videoRef.current.play(); setIsPlaying(true); }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black snap-start shrink-0" data-testid={`video-card-${video.id}`}>
      <video ref={videoRef} src={video.videoUrl} className="w-full h-full object-cover" loop playsInline muted={isMuted} onClick={togglePlay} />

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70 pointer-events-none" />

      <div className="absolute right-4 bottom-40 flex flex-col gap-5 items-center z-20">
        <button className="flex flex-col items-center gap-1" onClick={() => vibeMutation.mutate(true)} data-testid={`button-vibe-${video.id}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <VibeIcon className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-xs font-medium text-white">{vibeData?.vibes || 0}</span>
          <span className="text-[9px] text-green-400 font-medium">Vibe</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={() => vibeMutation.mutate(false)} data-testid={`button-notvibe-${video.id}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <NotVibeIcon className="w-6 h-6 text-red-400" />
          </div>
          <span className="text-xs font-medium text-white">{vibeData?.notVibes || 0}</span>
          <span className="text-[9px] text-red-400 font-medium">Not Vibe</span>
        </button>
        <button className="flex flex-col items-center gap-1" data-testid={`button-comment-${video.id}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-white">{commentCount}</span>
        </button>
        <button className="flex flex-col items-center gap-1" data-testid={`button-gift-${video.id}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Gift className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[9px] text-amber-400 font-medium">Gift</span>
        </button>
        <button onClick={toggleMute} data-testid={`button-mute-${video.id}`}>
          {isMuted ? <VolumeX className="w-6 h-6 text-white/60" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>

      <div className="absolute bottom-20 left-4 right-20 z-20 space-y-2">
        <div className="flex items-center gap-3">
          <img src={video.user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${video.user?.firstName || "U"}`} alt="" className="w-10 h-10 rounded-full border-2 border-white/30 object-cover" />
          <div>
            <p className="font-bold text-white text-sm drop-shadow-md">{video.user?.firstName} {video.user?.lastName}</p>
            <p className="text-white/60 text-xs">@{video.user?.email?.split("@")[0] || "user"}</p>
          </div>
        </div>
        <p className="text-white text-sm drop-shadow-md leading-relaxed">{video.description || video.title}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {video.category && video.category !== "general" && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70 text-xs capitalize">{video.category}</span>
            </div>
          )}
          {video.location && (
            <span className="text-white/50 text-xs">📍 {video.location}</span>
          )}
          {video.hashtags && video.hashtags.split(",").map((tag: string) => (
            <span key={tag} className="text-cyan-400 text-xs">#{tag.trim()}</span>
          ))}
        </div>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-5 rounded-full bg-black/40 backdrop-blur-sm">
            <Play className="w-10 h-10 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
}
