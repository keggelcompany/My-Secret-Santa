import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

export function Navbar() {
    const { user, logoutMutation } = useAuth();
    const [location, navigate] = useLocation();

    const handleLogout = () => {
        logoutMutation.mutate();
        navigate("/");
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 pt-4 pb-4">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img src="/figmaAssets/logo-1.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg leading-none">My Secret</span>
                            <span className="text-white font-bold text-lg leading-none">Santa</span>
                        </div>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="/#how-it-works" className="text-white/90 hover:text-holiday-gold hover:underline underline-offset-4 transition-all text-lg font-normal">How it Works</a>
                    <a href="/#faq" className="text-white/90 hover:text-holiday-gold hover:underline underline-offset-4 transition-all text-lg font-normal">FAQ</a>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Button
                                onClick={() => navigate("/dashboard")}
                                className="bg-holiday-red hover:bg-holiday-red/90 text-white rounded-full px-6 py-2 font-bold shadow-lg hover:shadow-xl transition-all uppercase tracking-wide"
                            >
                                DASHBOARD
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white/20">
                                        <span className="text-2xl">
                                            {user.avatar === "elf" && "🧝"}
                                            {user.avatar === "elf-girl" && "🧝‍♀️"}
                                            {user.avatar === "santa" && "🎅"}
                                            {user.avatar === "reindeer" && "🦌"}
                                            {user.avatar === "cookie" && "🍪"}
                                            {user.avatar === "milk" && "🥛"}
                                            {user.avatar === "grinch" && "🤢"}
                                            {user.avatar === "candy-cane" && "🍬"}
                                            {user.avatar === "snowman" && "⛄"}
                                            {user.avatar === "stocking" && "🧦"}
                                            {user.avatar === "nutcracker" && "💂"}
                                            {user.avatar === "star" && "⭐"}
                                            {user.avatar === "ornament" && "🔮"}
                                            {user.avatar === "tree" && "🎄"}
                                            {user.avatar === "fireworks" && "🎆"}
                                            {user.avatar === "champagne" && "🥂"}
                                            {user.avatar === "scarf" && "🧣"}
                                            {user.avatar === "hat" && "🧢"}
                                            {user.avatar === "gift" && "🎁"}
                                            {user.avatar === "sleigh" && "🛷"}
                                            {!user.avatar && "👤"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur w-48">
                                    <DropdownMenuItem
                                        onClick={() => navigate("/profile")}
                                        className="cursor-pointer hover:bg-holiday-green/10 py-2.5"
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer hover:bg-red-50 text-red-600 py-2.5"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                onClick={() => navigate("/auth")}
                                variant="ghost"
                                className="text-white hover:text-white/80 hover:bg-white/10 font-bold text-base"
                            >
                                Login
                            </Button>
                            <Button
                                onClick={() => navigate("/auth")}
                                className="bg-holiday-red hover:bg-holiday-red/90 text-white rounded-full px-8 py-2 font-bold shadow-lg hover:shadow-xl transition-all uppercase tracking-wide"
                            >
                                Register
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
