import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Plus, Trash2, Eye, EyeOff, Users, Loader2, Download, ArrowLeft, ExternalLink } from "lucide-react";
import { Snow } from "@/components/Snow";

interface Participant {
  id: string;
  eventId: string;
  name: string;
  email: string;
  isHost: boolean;
  hasAccepted: boolean;
  magicToken: string;
  assignedToId: string | null;
}

interface Event {
  id: string;
  name: string;
  hostName: string;
  hostEmail: string;
  status: string;
}

interface WishlistItem {
  id: string;
  participantId: string;
  title: string;
  description: string | null;
  link: string | null;
}

export default function EventView() {
  const [, params] = useRoute("/join/:token");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showMatch, setShowMatch] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", link: "" });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: joinData, isLoading: joinLoading, error: joinError } = useQuery({
    queryKey: ["join", params?.token],
    queryFn: async () => {
      const res = await fetch(`/api/join/${params?.token}`);
      if (!res.ok) throw new Error("Invalid invite");
      return res.json() as Promise<{ participant: Participant; event: Event }>;
    },
    enabled: !!params?.token,
  });

  const { data: matchData } = useQuery({
    queryKey: ["match", joinData?.participant?.id],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${joinData?.participant?.id}/match`);
      if (!res.ok) return null;
      return res.json() as Promise<Participant>;
    },
    enabled: !!joinData?.participant?.id && !!joinData?.participant?.assignedToId,
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist", joinData?.participant?.id],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${joinData?.participant?.id}/wishlist`);
      return res.json() as Promise<WishlistItem[]>;
    },
    enabled: !!joinData?.participant?.id,
  });

  const { data: allParticipants = [] } = useQuery({
    queryKey: ["participants", joinData?.event?.id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${joinData?.event?.id}/participants`);
      return res.json() as Promise<Participant[]>;
    },
    enabled: !!joinData?.event?.id && joinData?.participant?.isHost,
  });

  const { data: matchWishlist = [] } = useQuery({
    queryKey: ["matchWishlist", matchData?.id],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${matchData?.id}/wishlist`);
      return res.json() as Promise<WishlistItem[]>;
    },
    enabled: !!matchData?.id,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/join/${params?.token}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join"] });
      toast({ title: "Welcome!", description: "You've joined the Secret Santa event." });
    },
  });

  const addWishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/participants/${joinData?.participant?.id}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      setNewItem({ title: "", description: "", link: "" });
      toast({ title: "Added!", description: "Wishlist item added." });
    },
  });

  const deleteWishlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: "Removed", description: "Item removed from wishlist." });
    },
  });

  const endEventMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${joinData?.event?.id}/end`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to end event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join"] });
      toast({ title: "Event ended!", description: "You can now generate your Wrapped card." });
    },
  });

  const generateWrappedCard = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas || !joinData || !matchData) {
        toast({ title: "Error", description: "Missing data for card generation", variant: "destructive" });
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast({ title: "Error", description: "Could not create canvas context", variant: "destructive" });
        return;
      }

      canvas.width = 800;
      canvas.height = 600;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, "#1F4C34"); // holiday-green
      gradient.addColorStop(1, "#0f2518"); // darker green
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Decorative circles
      ctx.fillStyle = "#D83F31"; // holiday-red
      ctx.beginPath();
      ctx.arc(700, 100, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#D3AF64"; // holiday-gold
      ctx.beginPath();
      ctx.arc(100, 500, 60, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = "white";
      ctx.font = "bold 48px Jost, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Secret Santa Wrapped", 400, 80);

      ctx.font = "bold 32px Jost, sans-serif";
      ctx.fillText(joinData.event.name, 400, 140);

      ctx.font = "24px Jost, sans-serif";
      ctx.fillStyle = "#D3AF64";
      ctx.fillText(`${joinData.participant.name}'s Summary`, 400, 200);

      ctx.fillStyle = "white";
      ctx.font = "20px Jost, sans-serif";
      ctx.fillText(`You gifted to: ${matchData.name}`, 400, 280);
      ctx.fillText(`Wishlist items created: ${wishlistItems.length}`, 400, 320);
      ctx.fillText(`Total participants: ${allParticipants.length || "?"}`, 400, 360);

      ctx.font = "bold 28px Jost, sans-serif";
      ctx.fillStyle = "#D83F31";
      ctx.fillText("Happy Holidays!", 400, 480);

      ctx.font = "16px Jost, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("My Secret Santa", 400, 560);

      const link = document.createElement("a");
      const fileName = `secret-santa-wrapped-${(joinData.event.name || "event").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Downloaded!", description: "Your Wrapped card has been saved." });
    } catch (error) {
      console.error("Error generating wrapped card:", error);
      toast({ title: "Error", description: "Failed to generate wrapped card", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (joinData && !joinData.participant.hasAccepted && !acceptMutation.isPending) {
      acceptMutation.mutate();
    }
  }, [joinData?.participant?.id]);

  if (joinLoading) {
    return (
      <div className="min-h-screen bg-holiday-green flex items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (joinError || !joinData) {
    return (
      <div className="min-h-screen bg-holiday-green flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <Snow />
        <Card className="bg-white/5 border-white/10 backdrop-blur-md max-w-md w-full relative z-10">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-white text-2xl font-bold mb-2">Invalid Invite</h2>
            <p className="text-white/70 mb-6">This invite link is invalid or has expired.</p>
            <Button onClick={() => navigate("/")} className="bg-holiday-red hover:bg-holiday-red/90 text-white font-bold">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { participant, event } = joinData;
  const isEnded = event.status === "ended";

  return (
    <div className="min-h-screen bg-holiday-green py-8 px-4 font-sans relative overflow-hidden">
      <Snow />
      <canvas ref={canvasRef} className="hidden" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white mb-4 hover:bg-white/10 hover:text-holiday-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Home
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:px-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">{event.name}</h1>
            <p className="text-white/70">Welcome, <span className="font-bold text-white">{participant.name}</span>!</p>
            {participant.isHost && <span className="inline-block mt-2 px-3 py-1 bg-holiday-gold text-white text-sm rounded-full font-bold shadow-sm">Host</span>}
          </div>
          {isEnded && (
            <span className="px-4 py-2 bg-holiday-red text-white rounded-full font-bold shadow-lg animate-pulse">
              Event Ended
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-md h-full shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Gift className="w-6 h-6 text-holiday-red" />
                  Your Secret Santa Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">You are gifting to:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMatch(!showMatch)}
                        className="text-white hover:bg-white/10"
                      >
                        {showMatch ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <AnimatePresence>
                      {showMatch && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-holiday-red p-6 rounded-xl text-center shadow-inner"
                        >
                          <div className="text-4xl mb-2">🎁</div>
                          <p className="text-white text-2xl font-bold">{matchData.name}</p>
                          <p className="text-white/80 text-sm mt-1">{matchData.email}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {showMatch && matchWishlist.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-holiday-gold font-bold mb-3 uppercase text-sm tracking-wider">Their Wishlist</h4>
                        <ul className="space-y-2">
                          {matchWishlist.map((item) => (
                            <li key={item.id} className="bg-black/20 p-3 rounded-lg border border-white/5">
                              <p className="text-white font-medium">{item.title}</p>
                              {item.description && <p className="text-white/60 text-sm mt-1">{item.description}</p>}
                              {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-holiday-gold text-sm flex items-center gap-1 mt-2 hover:underline">
                                  View Link <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/50 italic">Matches haven't been generated yet.</p>
                    <p className="text-white/30 text-sm mt-2">Wait for the host to start the exchange!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-md h-full shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Your Wishlist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {wishlistItems.length === 0 && (
                    <p className="text-white/40 text-center py-4 italic">No items yet. Add some below!</p>
                  )}
                  {wishlistItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/10 p-3 rounded-lg flex justify-between items-start border border-white/5 group"
                    >
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        {item.description && <p className="text-white/60 text-sm">{item.description}</p>}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-holiday-gold text-sm hover:underline">
                            {item.link}
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWishlistMutation.mutate(item.id)}
                        className="text-white/30 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <Input
                    placeholder="Gift idea title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-holiday-gold focus:ring-holiday-gold"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-holiday-gold focus:ring-holiday-gold"
                  />
                  <Input
                    placeholder="Link (optional)"
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-holiday-gold focus:ring-holiday-gold"
                  />
                  <Button
                    onClick={() => addWishlistMutation.mutate()}
                    disabled={!newItem.title || addWishlistMutation.isPending}
                    className="w-full bg-holiday-red hover:bg-holiday-red/90 text-white font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {participant.isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6 text-holiday-gold" />
                  Host Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">All Participants ({allParticipants.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allParticipants.map((p) => (
                      <div key={p.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center border border-white/5">
                        <div className="overflow-hidden">
                          <p className="text-white truncate font-medium">{p.name}</p>
                          <p className="text-white/50 text-xs truncate">{p.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.hasAccepted ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {p.hasAccepted ? "Joined" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isEnded ? (
                  <Button
                    onClick={() => endEventMutation.mutate()}
                    disabled={endEventMutation.isPending}
                    className="w-full bg-holiday-gold hover:bg-holiday-gold/90 text-white font-bold h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    End Event & Generate Cards
                  </Button>
                ) : (
                  <Button
                    onClick={generateWrappedCard}
                    className="w-full bg-holiday-red hover:bg-holiday-red/90 text-white font-bold h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Your Wrapped Card
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isEnded && !participant.isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎄</div>
                <h3 className="text-white text-2xl font-bold mb-2">Event Complete!</h3>
                <p className="text-white/70 mb-6">The Secret Santa event has ended. Download your personalized Wrapped card!</p>
                <Button
                  onClick={generateWrappedCard}
                  className="bg-holiday-red hover:bg-holiday-red/90 text-white font-bold h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Wrapped Card
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
