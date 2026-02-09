import { useState } from "react";
import { NavSidebar } from "@/components/nav-sidebar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, Film, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateVideo } from "@/hooks/use-videos";
import { useLocation } from "wouter";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { mutate: createVideo, isPending } = useCreateVideo();
  
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleUploadComplete = (result: any) => {
    // Uppy result structure varies, but for presigned URL flow, we usually know the URL we asked for.
    // However, the ObjectUploader wrapper handles the upload.
    // The issue is getting the public URL back.
    // In our implementation notes, we request the URL first.
    // The ObjectUploader 'onGetUploadParameters' helps Uppy upload it.
    
    // Hack: For this demo, since Uppy handles the PUT, we need the final URL.
    // Real implementation would ideally return the URL from the uploader component or we construct it.
    // Let's assume the uploadURL returned by request-url is what we need, but we need to capture it.
    
    // Alternative: We'll rely on the user to use the form AFTER upload is "Complete" in UI.
    // But we need the URL. 
    // Let's modify the flow slightly: The user uploads, we get a success signal.
    // Since we don't have easy access to the exact URL inside the standard Uppy callbacks in this wrapper without state lift,
    // We will assume a pattern or just require the user to wait. 
    // Actually, let's look at how ObjectUploader works in the context.
    
    // Wait, the prompt provided ObjectUploader.tsx. Let's look at it.
    // It takes `onGetUploadParameters` and `onComplete`.
    // We can capture the URL in `onGetUploadParameters`.
    console.log("Upload complete", result);
  };

  // We need to capture the URL generated during the signing process
  const lastGeneratedUrl = useState<{url: string} | null>(null);

  const handleSubmit = () => {
    if (!uploadedUrl || !title) return;
    
    createVideo({
      title,
      description,
      videoUrl: uploadedUrl,
      // Default thumbnail for now
      thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop" 
    }, {
      onSuccess: () => setLocation("/")
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <NavSidebar />
      
      <main className="flex-1 md:ml-64 p-6 md:p-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">Upload Video</h1>
            <p className="text-muted-foreground">Share your story with the tribe.</p>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-6">
              
              {!uploadedUrl ? (
                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-colors bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <CloudUpload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Select video to upload</h3>
                    <p className="text-sm text-muted-foreground mt-1">MP4, WebM up to 50MB</p>
                  </div>
                  
                  <ObjectUploader
                    onGetUploadParameters={async (file) => {
                      const res = await fetch("/api/uploads/request-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: file.name,
                          size: file.size,
                          contentType: file.type,
                        }),
                      });
                      const { uploadURL, objectPath } = await res.json();
                      
                      // Construct the public URL (assuming the route serves it at /objects/...)
                      // The backend route is /objects/:objectPath(*)
                      const publicUrl = `${window.location.origin}${objectPath}`;
                      setUploadedUrl(publicUrl); // Capture it!

                      return {
                        method: "PUT",
                        url: uploadURL,
                        headers: { "Content-Type": file.type },
                      };
                    }}
                    onComplete={handleUploadComplete}
                    buttonClassName="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-xl shadow-lg shadow-primary/20"
                  >
                    Choose File
                  </ObjectUploader>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-500">Upload Successful!</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{uploadedUrl}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setUploadedUrl(null)} className="ml-auto">
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="What is happening in this video?" 
                    className="min-h-[100px] bg-background"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg rounded-xl" 
                onClick={handleSubmit}
                disabled={!uploadedUrl || !title || isPending}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Film className="w-5 h-5 mr-2" />}
                Publish Video
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
