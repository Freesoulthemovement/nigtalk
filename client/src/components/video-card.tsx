import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from "lucide-react";

interface VideoCardProps {
  video: any;
  isActive: boolean;
}

export function VideoCard({ video, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likeCount] = useState(Math.floor(Math.random() * 500) + 10);
  const [commentCount] = useState(Math.floor(Math.random() * 50));
  const [shareCount] = useState(Math.floor(Math.random() * 100));

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
        <button className="flex flex-col items-center gap-1" data-testid={`button-like-${video.id}`}>
          <Heart className="w-7 h-7 text-white" />
          <span className="text-xs font-medium text-white">{likeCount}</span>
        </button>
        <button className="flex flex-col items-center gap-1" data-testid={`button-comment-${video.id}`}>
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-xs font-medium text-white">{commentCount}</span>
        </button>
        <button className="flex flex-col items-center gap-1" data-testid={`button-share-${video.id}`}>
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-xs font-medium text-white">{shareCount}</span>
        </button>
        <button onClick={toggleMute} data-testid={`button-mute-${video.id}`}>
          {isMuted ? <VolumeX className="w-6 h-6 text-white/60" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>

      <div className="absolute bottom-20 left-4 right-20 z-20 space-y-2">
        <div className="flex items-center gap-3">
          <img
            src={video.user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${video.user?.firstName || "U"}`}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
          />
          <div>
            <p className="font-bold text-white text-sm drop-shadow-md">
              {video.user?.firstName} {video.user?.lastName}
            </p>
            <p className="text-white/60 text-xs">@{video.user?.email?.split("@")[0] || "user"}</p>
          </div>
        </div>
        <p className="text-white text-sm drop-shadow-md leading-relaxed">
          {video.description || video.title}
        </p>
        {video.category && video.category !== "general" && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/70 text-xs capitalize">{video.category}</span>
          </div>
        )}
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
