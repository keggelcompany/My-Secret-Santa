import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, ArrowLeft, Send, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Snow } from "@/components/Snow";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Participant {
  name: string;
  email: string;
}

export default function CreateEvent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState<Date>();
  const [hostParticipates, setHostParticipates] = useState(true);

  const [participants, setParticipants] = useState<Participant[]>([{ name: "", email: "" }]);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/auth");
    }
  }, [user, isAuthLoading, navigate]);

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName,
          hostName: user.nickname,
          hostEmail: user.email || user.username, // Fallback to username if email is missing
          hostUserId: user.id,
          hostParticipates: hostParticipates,
          endDate: date ? date.toISOString() : undefined
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: (data) => {
      setCreatedEventId(data.event.id);
      setHostToken(data.hostParticipant.magicToken);
      setStep(2);
      toast({ title: "Event created!", description: "Now add your participants." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create event", variant: "destructive" });
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: async (participant: Participant) => {
      const res = await fetch(`/api/events/${createdEventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participant),
      });
      if (!res.ok) throw new Error("Failed to add participant");
      return res.json();
    },
  });

  const matchMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${createdEventId}/match`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate matches");
      return res.json();
    },
  });

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: "", email: "" }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index][field] = value.trim();
    setParticipants(updated);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvites = async () => {
    const validParticipants = participants.filter(p => p.name && p.email);

    if (validParticipants.length === 0) {
      toast({ title: "Error", description: "Add at least one participant with valid name and email", variant: "destructive" });
      return;
    }

    const invalidEmails = participants.filter(p => p.email && !isValidEmail(p.email));
    if (invalidEmails.length > 0) {
      toast({ title: "Error", description: "Some emails are invalid. Please check and try again.", variant: "destructive" });
      return;
    }

    try {
      for (const participant of validParticipants) {
        await addParticipantMutation.mutateAsync(participant);
      }

      await matchMutation.mutateAsync();

      toast({
        title: "Invites sent!",
        description: `${validParticipants.length} participants added and matched. Check console for magic links.`
      });

      setStep(3);
    } catch (error) {
      toast({ title: "Error", description: "Failed to send invites", variant: "destructive" });
    }
  };

  const isLoading = createEventMutation.isPending || addParticipantMutation.isPending || matchMutation.isPending;

  if (isAuthLoading || !user) {
    return <div className="min-h-screen bg-holiday-green flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-holiday-green py-8 px-4 font-sans relative overflow-hidden">
      <Snow />
      <div className="container mx-auto max-w-2xl relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white mb-8 hover:bg-white/10 hover:text-holiday-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= s
                    ? "bg-holiday-red text-white shadow-lg scale-110"
                    : "bg-white/10 text-white/30"
                  } ${s <= step && (s === 1 || (s === 2 && step >= 2))
                    ? "cursor-pointer hover:scale-125 hover:shadow-xl"
                    : "cursor-default"
                  }`}
                onClick={() => {
                  // Allow going back to step 1 from any step
                  if (s === 1 && step >= 1) {
                    setStep(1);
                  }
                  // Allow going to step 2 if we've created an event (step >= 2)
                  if (s === 2 && step >= 2 && createdEventId) {
                    setStep(2);
                  }
                }}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-20 h-1 transition-all duration-500 ${step > s ? "bg-holiday-red" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-3xl text-center font-bold drop-shadow-md">Create Your Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventName" className="text-white text-lg">Event Name</Label>
                    <Input
                      id="eventName"
                      placeholder="Christmas Gift Exchange 2024"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-lg focus:border-holiday-gold focus:ring-holiday-gold"
                    />
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label className="text-white text-lg">When is the exchange?</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3 mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hostParticipates"
                        checked={hostParticipates}
                        onCheckedChange={(checked) => setHostParticipates(checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-holiday-gold data-[state=checked]:border-holiday-gold"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="hostParticipates"
                          className="text-white text-base font-medium cursor-pointer"
                        >
                          Participate in exchange
                        </Label>
                        <p className="text-white/60 text-sm mt-1">
                          {hostParticipates
                            ? "You'll be assigned a Secret Santa and cannot see other matches"
                            : "You won't participate but can see all matches as admin"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => createEventMutation.mutate()}
                    disabled={!eventName || !date || isLoading}
                    className="w-full bg-holiday-red hover:bg-holiday-red/90 text-white h-14 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mt-4"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-3xl text-center font-bold drop-shadow-md">Add Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {participants.map((participant, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 items-end bg-white/5 p-4 rounded-xl border border-white/5"
                      >
                        <div className="flex-1 space-y-2">
                          <Label className="text-white/80 text-sm">Name</Label>
                          <Input
                            placeholder="Participant name"
                            value={participant.name}
                            onChange={(e) => handleParticipantChange(index, "name", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-holiday-gold focus:ring-holiday-gold"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-white/80 text-sm">Email</Label>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={participant.email}
                            onChange={(e) => handleParticipantChange(index, "email", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-holiday-gold focus:ring-holiday-gold"
                          />
                        </div>
                        {participants.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveParticipant(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-10 w-10"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleAddParticipant}
                    className="w-full border-dashed border-white/30 text-white hover:bg-white/10 hover:text-white h-12 text-lg bg-transparent"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Participant
                  </Button>

                  <div className="pt-6 border-t border-white/10">
                    <Button
                      onClick={handleSendInvites}
                      disabled={isLoading}
                      className="w-full bg-holiday-red hover:bg-holiday-red/90 text-white h-14 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                      Send Invites & Generate Matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-holiday-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                  >
                    <span className="text-5xl">🎄</span>
                  </motion.div>
                  <CardTitle className="text-white text-3xl font-bold drop-shadow-md">Event Created!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 text-center">
                  <p className="text-white/80 text-lg leading-relaxed">
                    Your Secret Santa event <span className="text-holiday-gold font-bold">"{eventName}"</span> has been created and all participants have been matched!
                  </p>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                    <p className="text-white/50 text-sm mb-3 uppercase tracking-wider font-bold">Your host dashboard link</p>
                    <code className="text-holiday-gold text-lg break-all font-mono bg-black/20 px-3 py-1 rounded">{`/join/${hostToken}`}</code>
                  </div>
                  <p className="text-white/50 text-sm italic">
                    (Check the console for magic links sent to all participants in this demo)
                  </p>
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={() => navigate(`/join/${hostToken}`)}
                      className="w-full bg-holiday-red hover:bg-holiday-red/90 text-white h-14 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Go to Your Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="w-full border-white/30 text-holiday-green bg-white hover:bg-white/90 h-12 text-lg font-bold"
                    >
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
