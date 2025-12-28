import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  // Extract video ID from URL if needed, or use embed URL directly
  // The provided URL is https://youtu.be/E5h58XuLkn4
  // Embed URL should be https://www.youtube.com/embed/E5h58XuLkn4
  
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("embed")) return url;
      const videoId = url.split("youtu.be/")[1]?.split("?")[0] || url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } catch (e) {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl) + "&controls=1&showinfo=0&rel=0&modestbranding=1";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-none shadow-none">
        <div className="relative bg-black border-4 border-black rounded-xl overflow-hidden shadow-2xl">
          <DialogTitle className="sr-only">Holiday Preview Video</DialogTitle>
          <DialogDescription className="sr-only">A video preview of the Secret Santa experience.</DialogDescription>
          
          {/* Close Button */}
          <div className="absolute top-2 right-2 z-50">
            <DialogClose onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-black/20 rounded-full p-1">
              <X className="w-6 h-6" />
            </DialogClose>
          </div>

          {/* Video Container */}
          <div className="aspect-video w-full bg-black">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
