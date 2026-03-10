import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: any;
  isActive: boolean;
}

export function VideoCard({ video, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
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
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

      <div className="absolute bottom-20 left-0 right-0 p-4 flex items-end justify-between">
        <div className="flex-1 mr-12 space-y-2 pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden">
              <img
                src={video.user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${video.user?.firstName || "U"}`}
                alt={video.user?.firstName || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-white text-sm drop-shadow-md">
              @{video.user?.firstName}{video.user?.lastName}
            </span>
          </div>
          <h3 className="text-white font-semibold drop-shadow-md line-clamp-2">{video.title}</h3>
          {video.description && (
            <p className="text-white/80 text-sm line-clamp-2 drop-shadow-md">{video.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-4 items-center pointer-events-auto pb-4">
          <button className="flex flex-col items-center gap-1 group" data-testid={`button-like-${video.id}`}>
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-primary/20 transition-colors">
              <Heart className="w-6 h-6 text-white group-hover:text-primary transition-all" />
            </div>
            <span className="text-[10px] font-medium text-white">Like</span>
          </button>

          <button className="flex flex-col items-center gap-1 group" data-testid={`button-comment-${video.id}`}>
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white">Chat</span>
          </button>

          <button className="flex flex-col items-center gap-1 group" data-testid={`button-share-${video.id}`}>
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white">Share</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md mt-2 hover:bg-white/20 transition-colors"
            data-testid={`button-mute-${video.id}`}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-6 rounded-full bg-black/40 backdrop-blur-sm">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
}
