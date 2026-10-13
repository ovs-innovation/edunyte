import { useState, useRef } from "react";
import { Upload, Video, Trash2, CheckCircle2, AlertCircle, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LecturesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CloudinaryVideoUploaderProps {
  courseId: string;
  videoUrl?: string;
  videoDuration?: number;
  videoPublicId?: string;
  onVideoUploaded: (data: { videoUrl: string; videoPublicId: string; videoDuration: number }) => void;
  onVideoRemoved: () => void;
  className?: string;
  disabled?: boolean;
}

export function CloudinaryVideoUploader({
  courseId,
  videoUrl,
  videoDuration,
  videoPublicId,
  onVideoUploaded,
  onVideoRemoved,
  className,
  disabled = false,
}: CloudinaryVideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid video file (.mp4, .webm, .mov, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate size (300MB max)
    const maxSize = 300 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Video size exceeds the 300MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(5);

      const result = await LecturesAPI.uploadVideo(courseId, file, (percent) => {
        setProgress(percent);
      });

      toast({
        title: "Video uploaded successfully",
        description: "Lecture video hosted on Cloudinary and ready.",
      });

      onVideoUploaded({
        videoUrl: result.videoUrl,
        videoPublicId: result.videoPublicId,
        videoDuration: result.videoDuration,
      });
    } catch (err: any) {
      toast({
        title: "Video upload failed",
        description: err?.message || "Could not upload video to Cloudinary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Video Preview If Already Uploaded */}
      {videoUrl && !uploading ? (
        <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/90 shadow-inner">
            <video
              src={videoUrl}
              controls
              className="h-full w-full object-contain"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Video ready on Cloudinary</span>
              {videoDuration ? (
                <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  ~{videoDuration} min
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replace Video
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled}
                onClick={onVideoRemoved}
                className="h-8 gap-1 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : uploading ? (
        /* Uploading State with Progress Bar */
        <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-8 text-center shadow-inner">
          <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-primary/20 text-primary shadow-glow">
            <Video className="h-7 w-7 animate-bounce" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Uploading Lecture Video to Cloudinary...
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Please wait while your video file is processed and safely hosted.
          </p>

          <div className="mt-4 w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2.5 w-full bg-primary/20" />
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
            dragActive
              ? "border-primary bg-primary/10 shadow-lg scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/40",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Click to upload or drag & drop video
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            MP4, WebM, MOV, or MKV (Directly streamed to Cloudinary, max 300MB)
          </p>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            className="mt-4 pointer-events-none gap-2 text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 border border-cyan-300/40"
          >
            <Video className="h-4 w-4 stroke-[2.5]" />
            Select Video File
          </Button>
        </div>
      )}
    </div>
  );
}
