import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { type VideoWithUser } from "@shared/routes";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: VideoWithUser;
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
    <div className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-40px)] bg-black md:rounded-2xl overflow-hidden snap-start shrink-0">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

      {/* Controls & Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-between">
        <div className="flex-1 mr-12 space-y-2 pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
              <img 
                src={video.user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${video.user.firstName}`}
                alt={video.user.firstName || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-white drop-shadow-md">
              @{video.user.firstName}{video.user.lastName}
            </span>
          </div>
          <h3 className="text-white font-semibold text-lg drop-shadow-md line-clamp-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white/80 text-sm line-clamp-2 drop-shadow-md">
              {video.description}
            </p>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="flex flex-col gap-4 items-center pointer-events-auto pb-4">
          <button className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-primary/20 transition-colors">
              <Heart className="w-7 h-7 text-white group-hover:text-primary group-hover:fill-primary transition-all" />
            </div>
            <span className="text-xs font-medium text-white shadow-black drop-shadow-md">Like</span>
          </button>

          <button className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-medium text-white shadow-black drop-shadow-md">Chat</span>
          </button>

          <button className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-medium text-white shadow-black drop-shadow-md">Share</span>
          </button>

          <button 
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md mt-4 hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-6 rounded-full bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
}
