import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function NewsCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    )

    const news = [
        {
            title: "Santa Claus is reaching",
            description: "He is coming, oh ho. Santa claus is coming to town in this holiday season. Are you ready to taste your own traditional food?",
            image: "/figmaAssets/two-hands-with-gift.png"
        },
        {
            title: "Elves are packing gifts",
            description: "The workshop is buzzing with activity as the elves work around the clock to ensure every gift is ready for the big night!",
            image: "/figmaAssets/two-hands-with-gift.png"
        },
        {
            title: "Reindeer training complete",
            description: "Rudolph and the team have finished their flight training and are ready to guide the sleigh through any weather.",
            image: "/figmaAssets/two-hands-with-gift.png"
        }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {news.map((item, index) => (
                        <CarouselItem key={index}>
                            <div className="p-1">
                                <Card className="bg-[#4a4a3a] border-0 overflow-hidden shadow-2xl rounded-none">
                                    <CardContent className="p-0 flex flex-col md:flex-row h-[300px]">
                                        <div className="flex-1 p-8 flex flex-col justify-center bg-[#4B4B3B]">
                                            <span className="text-white/60 text-xs font-semibold tracking-wider mb-2">NEWS</span>
                                            <h3 className="text-white text-2xl font-bold mb-4">{item.title}</h3>
                                            <p className="text-white/80 text-sm leading-relaxed mb-6">
                                                {item.description}
                                            </p>
                                            <div className="flex gap-2">
                                                {news.map((_, i) => (
                                                    <div key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/30'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-full md:w-[40%] bg-[#D83F31] relative flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('/figmaAssets/ellipse-5.png')] opacity-20 mix-blend-multiply"></div>
                                            <img
                                                src={item.image}
                                                alt="News"
                                                className="relative z-10 w-48 h-auto object-contain drop-shadow-2xl"
                                            />
                                            <div className="absolute bottom-6 right-6 z-20">
                                                <Button size="icon" className="rounded-full bg-white text-holiday-red hover:bg-white/90 h-10 w-10">
                                                    <Play className="h-4 w-4 fill-current" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
