import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Snow } from "@/components/Snow";
import { ArrowLeft } from "lucide-react";

const AVATARS = [
    "elf", "elf-girl", "santa", "reindeer", "cookie", "milk", "grinch", "candy-cane",
    "snowman", "stocking", "nutcracker", "star", "ornament", "tree", "fireworks",
    "champagne", "scarf", "hat", "gift", "sleigh"
];

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [_, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        if (user) {
            setLocation("/dashboard");
        }
    }, [user, setLocation]);

    const loginForm = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const registerForm = useForm({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            nickname: "", // Will be set to username on submit if empty
            avatar: "elf",
        },
    });

    const onRegisterSubmit = (data: any) => {
        // Use username as nickname if not provided (though we removed the field, so it will be empty)
        // Actually, let's just set nickname to username explicitly here
        const finalData = { ...data, nickname: data.username };
        registerMutation.mutate(finalData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-holiday-green p-4 relative overflow-hidden">
            <Snow />

            <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-holiday-gold transition-colors z-50"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Button>

            <Card className="w-full max-w-md bg-white/95 backdrop-blur relative z-10 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-holiday-green">
                        Welcome to Secret Santa
                    </CardTitle>
                    <CardDescription className="text-center">
                        Sign in or create an account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="login">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Form {...loginForm}>
                                <form
                                    onSubmit={loginForm.handleSubmit((data) =>
                                        loginMutation.mutate(data)
                                    )}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={loginForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#d42426] hover:bg-[#b31e20]"
                                        disabled={loginMutation.isPending}
                                    >
                                        Login
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register">
                            <Form {...registerForm}>
                                <form
                                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={registerForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Nickname field removed as per user request, using username instead */}

                                    <FormField
                                        control={registerForm.control}
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
                                        className="w-full bg-[#d42426] hover:bg-[#b31e20]"
                                        disabled={registerMutation.isPending}
                                    >
                                        Register
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
