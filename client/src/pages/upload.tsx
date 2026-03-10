import { useState, useEffect } from "react";
import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, Film, Loader2, CheckCircle2, Camera, Image, Headphones, FileText } from "lucide-react";
import { useCreateVideo } from "@/hooks/use-videos";
import { useLocation, useSearch } from "wouter";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";

const uploadTypeConfig: Record<string, { title: string; icon: any; accept: string; description: string }> = {
  camera: { title: "Record Video", icon: Camera, accept: "video/*", description: "Record a video using your camera." },
  photo: { title: "Upload Photo", icon: Image, accept: "image/*", description: "Share a photo with your tribe." },
  video: { title: "Upload Video", icon: Film, accept: "video/*", description: "Upload a video file." },
  audio: { title: "Upload Audio", icon: Headphones, accept: "audio/*", description: "Share an audio clip or podcast." },
  blueprint: { title: "Share Blueprint", icon: FileText, accept: ".pdf,video/*,image/*", description: "Upload a PDF or video of your design to educate the community." },
};

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const uploadType = params.get("type") || "video";
  const config = uploadTypeConfig[uploadType] || uploadTypeConfig.video;
  const { mutate: createVideo, isPending } = useCreateVideo();

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(uploadType === "blueprint" ? "blueprints" : "general");

  useEffect(() => {
    setCategory(uploadType === "blueprint" ? "blueprints" : "general");
  }, [uploadType]);

  const handleSubmit = () => {
    if (!uploadedUrl || !title) return;
    createVideo({ title, description, videoUrl: uploadedUrl, category }, { onSuccess: () => setLocation("/") });
  };

  const IconComponent = config.icon;

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="flex-1 px-5 pt-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display mb-0.5" data-testid="text-upload-title">{config.title}</h1>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6">
            {!uploadedUrl ? (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-purple-500/30 transition-colors">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <CloudUpload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold">Select file to upload</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadType === "blueprint" ? "PDF, MP4, images up to 50MB" :
                      uploadType === "photo" ? "JPG, PNG, WebP up to 20MB" :
                        uploadType === "audio" ? "MP3, WAV, AAC up to 30MB" :
                          "MP4, WebM up to 50MB"}
                  </p>
                </div>
                {uploadType === "camera" ? (
                  <label className="cursor-pointer">
                    <input type="file" accept="video/*" capture="user" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setUploadedUrl(URL.createObjectURL(file)); }} data-testid="input-camera-capture" />
                    <span className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-cyan-900/30">Open Camera</span>
                  </label>
                ) : (
                  <label className="cursor-pointer">
                    <input type="file" accept={config.accept} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setUploadedUrl(URL.createObjectURL(file)); }} data-testid="input-file-upload" />
                    <span className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-900/30">Choose File</span>
                  </label>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle2 className="w-7 h-7 text-green-500 shrink-0" />
                <div className="flex-1"><p className="font-semibold text-sm text-green-400">File Selected!</p></div>
                <Button variant="ghost" size="sm" onClick={() => setUploadedUrl(null)} data-testid="button-change-file">Change</Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Title</Label>
                <Input id="title" placeholder="Give your content a title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10" data-testid="input-video-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea id="description" placeholder="What is this about?" className="min-h-[80px] bg-white/5 border-white/10" value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-video-description" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-video-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="tribes">Tribes</SelectItem>
                    <SelectItem value="frequencies">Frequencies</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="nonprofits">Nonprofits</SelectItem>
                    <SelectItem value="blueprints">Blueprints</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold" onClick={handleSubmit} disabled={!uploadedUrl || !title || isPending} data-testid="button-publish-video">
              {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <IconComponent className="w-5 h-5 mr-2" />}
              Publish
            </Button>
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
