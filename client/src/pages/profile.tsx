import { useAuth } from "@/hooks/use-auth";
import { NavSidebar } from "@/components/nav-sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";

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
    <div className="flex min-h-screen bg-background text-foreground">
      <NavSidebar />
      
      <main className="flex-1 md:ml-64">
        {/* Profile Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img 
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-background shadow-xl"
              />
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold font-display">{user.firstName} {user.lastName}</h1>
                <p className="text-muted-foreground">@{user.email?.split('@')[0]}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
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
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
                <Button variant="destructive" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="w-full bg-card border border-border p-1 rounded-xl">
              <TabsTrigger value="videos" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Videos</TabsTrigger>
              <TabsTrigger value="liked" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Liked</TabsTrigger>
              <TabsTrigger value="tribes" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Tribes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos" className="mt-8">
              <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
                <p>No videos uploaded yet.</p>
                <Button variant="link" className="text-primary mt-2">Upload your first video</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="liked" className="mt-8">
              <div className="text-center py-20 text-muted-foreground">
                <p>No liked videos yet.</p>
              </div>
            </TabsContent>

            <TabsContent value="tribes" className="mt-8">
              <div className="text-center py-20 text-muted-foreground">
                <p>Not a member of any tribes yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
