import { useRef, useEffect, useState } from "react";
import { useVideos } from "@/hooks/use-videos";
import { VideoCard } from "@/components/video-card";
import { Loader2 } from "lucide-react";
import { NavSidebar } from "@/components/nav-sidebar";

export default function FeedPage() {
  const { data: videos, isLoading } = useVideos();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      setActiveVideoIndex(index);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-foreground">
      <NavSidebar />
      
      <main className="flex-1 md:ml-64 flex justify-center h-screen overflow-hidden">
        <div 
          ref={containerRef}
          className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {videos?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
              <p className="text-muted-foreground">Be the first to upload something amazing!</p>
            </div>
          ) : (
            videos?.map((video, index) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                isActive={index === activeVideoIndex} 
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
