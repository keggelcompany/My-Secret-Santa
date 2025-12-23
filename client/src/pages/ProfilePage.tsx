import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const AVATARS = [
    "elf", "elf-girl", "santa", "reindeer", "cookie", "milk", "grinch", "candy-cane",
    "snowman", "stocking", "nutcracker", "star", "ornament", "tree", "fireworks",
    "champagne", "scarf", "hat", "gift", "sleigh"
];

const updateProfileSchema = z.object({
    nickname: z.string().min(1, "Nickname is required"),
    avatar: z.string().min(1, "Avatar is required"),
});

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, navigate] = useLocation();

    const form = useForm({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            nickname: user?.nickname || "",
            avatar: user?.avatar || "elf",
        },
        values: {
            nickname: user?.nickname || "",
            avatar: user?.avatar || "elf",
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: z.infer<typeof updateProfileSchema>) => {
            const res = await apiRequest("PATCH", "/api/user", data);
            return await res.json();
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["/api/user"], updatedUser);
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-holiday-green">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-holiday-green p-8 flex flex-col items-center justify-center relative">
            <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-holiday-gold transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Button>

            <Card className="w-full max-w-md bg-white/95 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-holiday-green">
                        Edit Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="nickname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nickname (Apodo)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Choose your Avatar</FormLabel>
                                        <ScrollArea className="h-[200px] border rounded-md p-4">
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-3 gap-4"
                                            >
                                                {AVATARS.map((avatar) => (
                                                    <FormItem key={avatar}>
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={avatar}
                                                                className="sr-only peer"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                            <span className="text-2xl mb-2">
                                                                {avatar === "elf" && "🧝"}
                                                                {avatar === "elf-girl" && "🧝‍♀️"}
                                                                {avatar === "santa" && "🎅"}
                                                                {avatar === "reindeer" && "🦌"}
                                                                {avatar === "cookie" && "🍪"}
                                                                {avatar === "milk" && "🥛"}
                                                                {avatar === "grinch" && "🤢"}
                                                                {avatar === "candy-cane" && "🍬"}
                                                                {avatar === "snowman" && "⛄"}
                                                                {avatar === "stocking" && "🧦"}
                                                                {avatar === "nutcracker" && "💂"}
                                                                {avatar === "star" && "⭐"}
                                                                {avatar === "ornament" && "🔮"}
                                                                {avatar === "tree" && "🎄"}
                                                                {avatar === "fireworks" && "🎆"}
                                                                {avatar === "champagne" && "🥂"}
                                                                {avatar === "scarf" && "🧣"}
                                                                {avatar === "hat" && "🧢"}
                                                                {avatar === "gift" && "🎁"}
                                                                {avatar === "sleigh" && "🛷"}
                                                            </span>
                                                            <span className="text-xs capitalize">{avatar}</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full bg-holiday-red hover:bg-holiday-red/90"
                                disabled={updateMutation.isPending}
                            >
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
