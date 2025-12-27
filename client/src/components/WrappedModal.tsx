import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Link as LinkIcon, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  eventName: string;
}

export function WrappedModal({ isOpen, onClose, imageUrl, eventName }: WrappedModalProps) {
  const { toast } = useToast();

  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    const fileName = `secret-santa-wrapped-${eventName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
    link.download = fileName;
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded!", description: "Your Wrapped card has been saved." });
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Copied!", description: "App link copied to clipboard." });
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], "wrapped.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'My Secret Santa Wrapped',
                text: 'Check out my Secret Santa Wrapped card!',
                files: [file]
            });
        } else {
            await navigator.share({
                title: 'My Secret Santa Wrapped',
                text: 'Check out my Secret Santa Wrapped card!',
                url: window.location.origin
            });
        }
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast({ title: "Not supported", description: "Sharing is not supported on this device.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[350px] p-0 bg-transparent border-none shadow-none max-h-[90vh] overflow-y-auto custom-scrollbar [&>button]:hidden">
        <div className="relative bg-white border-4 border-black rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <DialogTitle className="sr-only">Your Wrapped Card</DialogTitle>
          <DialogDescription className="sr-only">Preview and share your Secret Santa wrapped card.</DialogDescription>

          {/* Close Button - Floating */}
          <div className="absolute top-2 right-2 z-50">
            <DialogClose onClick={onClose} className="text-black/50 hover:text-black transition-colors bg-white/80 hover:bg-white rounded-full p-1 shadow-sm">
              <X className="w-5 h-5" />
            </DialogClose>
          </div>

          {/* Header Text */}
          <div className="pt-6 pb-2 px-4 text-center shrink-0">
             <span className="text-black font-bold text-xl font-sans">Your Wrapped Card</span>
          </div>

          {/* Image Preview */}
          <div className="px-4 py-2 bg-white flex justify-center items-center grow">
            <img 
                src={imageUrl} 
                alt="Wrapped Card" 
                className="w-full h-auto rounded-lg shadow-md border border-black/10"
            />
          </div>

          {/* Actions */}
          <div className="bg-white p-4 flex flex-col gap-2 shrink-0">
             <Button onClick={handleDownload} className="w-full bg-holiday-gold hover:bg-holiday-gold/90 text-white font-bold border border-holiday-gold h-10">
                <Download className="w-4 h-4 mr-2" /> Download Image
             </Button>
             <div className="flex flex-col gap-2">
                <Button onClick={handleCopyLink} variant="outline" className="w-full border-holiday-gold text-holiday-gold hover:bg-holiday-gold hover:text-white font-bold transition-colors h-10">
                    <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full border-holiday-gold text-holiday-gold hover:bg-holiday-gold hover:text-white font-bold transition-colors h-10">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
