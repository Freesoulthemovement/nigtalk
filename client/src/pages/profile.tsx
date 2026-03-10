import { useAuth } from "@/hooks/use-auth";
import { NavBar } from "@/components/nav-bar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, MessageCircle, Settings } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-10 pb-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-purple-500/30 shadow-xl shadow-purple-900/20 mb-4"
            data-testid="img-profile-avatar"
          />
          <h1 className="text-2xl font-bold font-display" data-testid="text-profile-name">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-muted-foreground">@{user.email?.split("@")[0] || user.id.slice(0, 8)}</p>

          <div className="flex gap-8 mt-5">
            <div className="text-center">
              <span className="block font-bold text-lg">0</span>
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg">0</span>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg">0</span>
              <span className="text-xs text-muted-foreground">Likes</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6 w-full">
            <Link href="/messages" className="flex-1">
              <Button variant="outline" className="w-full gap-2 rounded-xl border-white/10 bg-white/5" data-testid="button-go-to-messages">
                <MessageCircle className="w-4 h-4" /> Messages
              </Button>
            </Link>
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 px-3" data-testid="button-settings">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="rounded-xl border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 px-3" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 flex-1">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="videos" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-sm" data-testid="tab-videos">Videos</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-sm" data-testid="tab-liked">Liked</TabsTrigger>
            <TabsTrigger value="tribes" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-sm" data-testid="tab-tribes">Tribes</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-5">
            <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
              <p className="text-sm">No videos uploaded yet.</p>
              <Link href="/upload">
                <Button variant="ghost" className="text-primary mt-2 text-sm" data-testid="link-upload-first-video">Upload your first video</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-5">
            <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
              <p className="text-sm">No liked videos yet.</p>
            </div>
          </TabsContent>

          <TabsContent value="tribes" className="mt-5">
            <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
              <p className="text-sm">Not a member of any tribes yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          NigTalk by Free Soul the Movement
        </p>
        <p className="text-xs mt-1">
          <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-profile-support">nigtalksupport@freesoulthemovement</a>
        </p>
      </div>

      <NavBar />
    </div>
  );
}
