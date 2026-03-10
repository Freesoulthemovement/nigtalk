import { useAuth } from "@/hooks/use-auth";
import { NavBar } from "@/components/nav-bar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, LogOut, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center">
            <img
              src={user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-background shadow-xl mb-4"
              data-testid="img-profile-avatar"
            />
            <h1 className="text-2xl font-bold font-display" data-testid="text-profile-name">{user.firstName} {user.lastName}</h1>
            <p className="text-sm text-muted-foreground">@{user.email?.split("@")[0] || user.id.slice(0, 8)}</p>

            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <span className="block font-bold">0</span>
                <span className="text-xs text-muted-foreground">Following</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">0</span>
                <span className="text-xs text-muted-foreground">Followers</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">0</span>
                <span className="text-xs text-muted-foreground">Likes</span>
              </div>
            </div>

            <div className="flex gap-2 mt-6 w-full">
              <Link href="/messages" className="flex-1">
                <Button variant="outline" className="w-full gap-2 rounded-xl" data-testid="button-go-to-messages">
                  <MessageCircle className="w-4 h-4" /> Messages
                </Button>
              </Link>
              <Button variant="destructive" className="rounded-xl gap-2" onClick={() => logout()} data-testid="button-logout">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 w-full">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full bg-card border border-border p-1 rounded-xl">
            <TabsTrigger value="videos" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white" data-testid="tab-videos">Videos</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white" data-testid="tab-liked">Liked</TabsTrigger>
            <TabsTrigger value="tribes" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white" data-testid="tab-tribes">Tribes</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
              <p>No videos uploaded yet.</p>
              <Link href="/upload">
                <Button variant="ghost" className="text-primary mt-2" data-testid="link-upload-first-video">Upload your first video</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="text-center py-16 text-muted-foreground">
              <p>No liked videos yet.</p>
            </div>
          </TabsContent>

          <TabsContent value="tribes" className="mt-6">
            <div className="text-center py-16 text-muted-foreground">
              <p>Not a member of any tribes yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">
          Contact: <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-profile-support">nigtalksupport@freesoulthemovement</a>
        </p>
      </div>
      <NavBar />
    </div>
  );
}
