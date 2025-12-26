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
import { Snow } from "@/components/Snow";

const AVATAR_MAP: Record<string, string> = {
  elf: "/figmaAssets/Emojis-editados/Elf.png",
  "elf-girl": "/figmaAssets/Emojis-editados/Elf-Girl.png",
  santa: "/figmaAssets/Emojis-editados/Santa.png",
  reindeer: "/figmaAssets/Emojis-editados/Reindeer.png",
  cookie: "/figmaAssets/Emojis-editados/Cookie.png",
  milk: "/figmaAssets/Emojis-editados/Milk.png",
  grinch: "/figmaAssets/Emojis-editados/Grinch.png",
  "candy-cane": "/figmaAssets/Emojis-editados/Candy.png",
  snowman: "/figmaAssets/Emojis-editados/Snowman.png",
  stocking: "/figmaAssets/Emojis-editados/stocking.png",
  nutcracker: "/figmaAssets/Emojis-editados/Nutcracker.png",
  star: "/figmaAssets/Emojis-editados/Star.png",
  ornament: "/figmaAssets/Emojis-editados/Ornament.png",
  tree: "/figmaAssets/Emojis-editados/Tree.png",
  fireworks: "/figmaAssets/Emojis-editados/Fireworks.png",
  champagne: "/figmaAssets/Emojis-editados/Champagne.png",
  scarf: "/figmaAssets/Emojis-editados/Scarf.png",
  hat: "/figmaAssets/Emojis-editados/Hat.png",
  gift: "/figmaAssets/Emojis-editados/Gift.png",
  sleigh: "/figmaAssets/Emojis-editados/Sleigh.png",
};

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
        <div className="min-h-screen bg-holiday-green p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <Snow />
            <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-holiday-gold transition-colors z-10"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Button>

            <Card className="w-full max-w-md bg-white/95 backdrop-blur relative z-10">
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
                                        <div className="h-[240px] border rounded-md bg-[#fefefe] overflow-y-auto custom-scrollbar">
                                            <div className="p-4">
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="grid grid-cols-4 gap-3"
                                                >
                                                    {Object.keys(AVATAR_MAP).map((avatar) => (
                                                        <FormItem key={avatar} className="space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem
                                                                    value={avatar}
                                                                    className="sr-only"
                                                                />
                                                            </FormControl>
                                                            <FormLabel
                                                                className={`flex flex-col items-center justify-center rounded-lg p-2 transition-all cursor-pointer hover:scale-105 h-full ${
                                                                    field.value === avatar
                                                                        ? "bg-holiday-red/20"
                                                                        : "bg-transparent"
                                                                }`}
                                                            >
                                                                <span className="mb-1 opacity-100">
                                                                    <img 
                                                                        src={AVATAR_MAP[avatar]} 
                                                                        alt={avatar} 
                                                                        className="w-8 h-8 object-contain" 
                                                                    />
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] capitalize font-medium ${
                                                                        field.value === avatar
                                                                            ? "text-holiday-red"
                                                                            : "text-muted-foreground"
                                                                    }`}
                                                                >
                                                                    {avatar}
                                                                </span>
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        </div>
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
