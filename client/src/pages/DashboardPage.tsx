import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@shared/schema";
import { Loader2, Plus, Gift, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import { Snow } from "@/components/Snow";
import { useToast } from "@/hooks/use-toast";

type UserEventsResponse = {
    hosted: (Event & { magicToken?: string })[];
    participating: (Event & { participantId: string; magicToken?: string })[];
};

export default function Dashboard() {
    const { user } = useAuth();
    const [_, navigate] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<UserEventsResponse>({
        queryKey: ["/api/user/events"],
        enabled: !!user,
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (eventId: string) => {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete event");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user/events"] });
            toast({ title: "Event deleted", description: "The event has been removed." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
        },
    });

    const handleDelete = (eventId: string, eventName: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
            deleteEventMutation.mutate(eventId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-holiday-green">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        );
    }

    const hasEvents = data && (data.hosted.length > 0 || data.participating.length > 0);

    return (
        <div className="min-h-screen bg-holiday-green p-8 relative overflow-hidden">
            <Snow />
            <div className="max-w-6xl mx-auto relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="text-white mb-6 hover:bg-white/10 hover:text-holiday-gold transition-colors pl-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome, {user?.nickname || user?.username}!
                    </h1>
                    <Button
                        onClick={() => navigate("/create")}
                        className="bg-holiday-red hover:bg-holiday-red/90 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Event
                    </Button>
                </div>

                {!hasEvents ? (
                    <Card className="bg-white/10 border-white/20 backdrop-blur">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Gift className="w-24 h-24 text-white/20 mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                No events yet
                            </h2>
                            <p className="text-white/70 mb-8 max-w-md">
                                You haven't created or joined any Secret Santa events yet. Start by creating your first event!
                            </p>
                            <Button
                                onClick={() => navigate("/create")}
                                size="lg"
                                className="bg-holiday-red hover:bg-holiday-red/90 text-white font-bold text-lg px-8"
                            >
                                Create Event
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {data.hosted.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-holiday-gold" />
                                    Events You Host
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.hosted.map((event) => (
                                        <div key={event.id} className="relative group cursor-pointer" onClick={() => navigate(`/join/${event.magicToken}`)}>
                                            <Card className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/20 transition-all">
                                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-white group-hover:text-holiday-gold transition-colors">
                                                        {event.name}
                                                    </CardTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-white/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                        onClick={(e) => handleDelete(event.id, event.name, e)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-white/70 text-sm">
                                                        Status: <span className="capitalize">{event.status}</span>
                                                    </p>
                                                    <p className="text-white/70 text-sm">
                                                        Created: {new Date(event.createdAt).toLocaleDateString()}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.participating.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-holiday-gold" />
                                    Participating In
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.participating.map((event) => (
                                        <div key={event.id} className="cursor-pointer group" onClick={() => navigate(`/join/${event.magicToken}`)}>
                                            <Card className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/20 transition-all">
                                                <CardHeader>
                                                    <CardTitle className="text-white group-hover:text-holiday-gold transition-colors">
                                                        {event.name}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-white/70 text-sm">
                                                        Host: {event.hostName}
                                                    </p>
                                                    <p className="text-white/70 text-sm">
                                                        Status: <span className="capitalize">{event.status}</span>
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
