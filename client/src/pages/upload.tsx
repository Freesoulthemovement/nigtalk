import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, Film, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateVideo } from "@/hooks/use-videos";
import { useLocation } from "wouter";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { mutate: createVideo, isPending } = useCreateVideo();

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");

  const handleSubmit = () => {
    if (!uploadedUrl || !title) return;

    createVideo(
      {
        title,
        description,
        videoUrl: uploadedUrl,
        category,
      },
      { onSuccess: () => setLocation("/") }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="flex-1 p-4 pt-6 md:p-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-display mb-1" data-testid="text-upload-title">Upload Video</h1>
            <p className="text-sm text-muted-foreground">Share your story with the tribe.</p>
          </div>

          <Card className="border-border bg-card/50">
            <CardContent className="pt-6 space-y-6">
              {!uploadedUrl ? (
                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-colors bg-black/10">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CloudUpload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Select video to upload</h3>
                    <p className="text-sm text-muted-foreground mt-1">MP4, WebM up to 50MB</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setUploadedUrl(url);
                        }
                      }}
                      data-testid="input-video-file"
                    />
                    <span className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-xl shadow-lg shadow-primary/20 transition-colors">
                      Choose File
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-green-500">File Selected!</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setUploadedUrl(null)} data-testid="button-change-file">
                    Change
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Give your video a catchy title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                    data-testid="input-video-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is happening in this video?"
                    className="min-h-[80px] bg-background"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="input-video-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-background" data-testid="select-video-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="tribes">Tribes</SelectItem>
                      <SelectItem value="frequencies">Frequencies</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="blueprints">Blueprints</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base rounded-xl"
                onClick={handleSubmit}
                disabled={!uploadedUrl || !title || isPending}
                data-testid="button-publish-video"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Film className="w-5 h-5 mr-2" />}
                Publish Video
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
