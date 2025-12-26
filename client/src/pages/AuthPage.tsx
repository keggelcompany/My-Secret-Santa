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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="login"
          >
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

                  <FormField
                    control={registerForm.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose your Avatar</FormLabel>

                        <div className="flex flex-col items-center justify-center p-6 mb-4 rounded-xl bg-[#fefefe] backdrop-blur-sm">
                          <div className="mb-2 animate-bounce-slow">
                            {AVATAR_MAP[field.value] ? (
                              <img 
                                src={AVATAR_MAP[field.value]} 
                                alt={field.value} 
                                className="w-32 h-32 object-contain"
                              />
                            ) : (
                              <span className="text-6xl">❓</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-holiday-green capitalize">
                            {field.value || "Select an avatar"}
                          </p>
                        </div>

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
