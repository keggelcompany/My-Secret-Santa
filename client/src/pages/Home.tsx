import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Snow } from "@/components/Snow";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { VideoModal } from "@/components/VideoModal";
import { useState } from "react";

interface UserEventsResponse {
  hosted: (Event & { magicToken?: string })[];
  participating: (Event & { magicToken: string })[];
}

const steps = [
  {
    number: "1",
    title: "Create Event",
    description: "Set up your Secret Santa exchange as the host",
  },
  {
    number: "2",
    title: "Add Participants",
    description: "Invite friends and family via email",
  },
  {
    number: "3",
    title: "Automatic Matching",
    description: "We randomly assign each person their Secret Santa",
  },
  {
    number: "4",
    title: "Manage Wishlists",
    description: "Participants create wishlists for gift ideas",
  },
  {
    number: "5",
    title: "Event Wrap-up",
    description: "End the event and share personalized holiday cards",
  },
];

const faqs = [
  {
    question: "What is Secret Santa?",
    answer:
      "Secret Santa is a gift-giving tradition where participants are randomly assigned another person to give a gift to, without revealing who they are until the gift exchange.",
  },
  {
    question: "How does the matching work?",
    answer:
      "Our system randomly assigns each participant to another person in the group. We ensure no one gets themselves, and the assignments are kept secret until the event ends.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes! My Secret Santa is completely free to use. Create as many events as you like and invite as many participants as needed.",
  },
  {
    question: "How do participants join?",
    answer:
      "When you add participants, they receive a magic link via email. Clicking this link lets them join the event, view their match, and create their wishlist.",
  },
  {
    question: "Can I see all the matches as the host?",
    answer:
      "The host can choose to participate or just host. If participating, they cannot see matches until the event ends. If they decide NOT to participate, they can see all matches to manage the event.",
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showVideo, setShowVideo] = useState(false);

  const { data: userEvents } = useQuery<UserEventsResponse>({
    queryKey: ["/api/user/events"],
    enabled: !!user,
  });

  let heroButtonText = "TRY NOW";
  let heroButtonAction = () => navigate(user ? "/create" : "/auth");

  if (user && userEvents) {
    const activeHosted = userEvents.hosted.find(
      (e: any) => e.status === "active"
    );
    const activeParticipating = userEvents.participating.find(
      (e: any) => e.status === "active"
    );

    if (activeHosted) {
      heroButtonText = "Check Event Status";
      heroButtonAction = () => navigate(`/join/${activeHosted.magicToken}`);
    } else if (activeParticipating) {
      heroButtonText = "Who is your Secret Santa?";
      heroButtonAction = () =>
        navigate(`/join/${activeParticipating.magicToken}`);
    } else {
      // Logged in but no active events
      heroButtonAction = () => navigate("/create");
    }
  }

  return (
    <div className="min-h-screen bg-holiday-green font-sans relative overflow-x-hidden">
      <Snow />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-12 md:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="relative z-20 text-center lg:text-left mt-10 lg:mt-0 md:px-8">
              <div className="relative inline-block mx-auto">
                {/* Floating Santa Hat */}
                <motion.img
                  src="/figmaAssets/santa-hat.png"
                  alt="Santa Hat"
                  className="absolute -top-16 -left-4 md:-top-20 md:-left-8 w-28 md:w-40 h-auto z-30 pointer-events-none"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <h1 className="text-6xl md:text-7xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tight mb-8 drop-shadow-lg relative z-20 md:translate-x-6">
                  <span className="block">Santa</span>
                  <span className="block">Claus is</span>
                  <span className="block">coming</span>
                  <span className="block">to town!</span>
                </h1>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-8 md:mt-12 justify-center lg:justify-start items-center">
                <Button
                  onClick={heroButtonAction}
                  className="w-full md:w-auto bg-holiday-red hover:bg-holiday-red/90 text-white rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all uppercase tracking-wider"
                >
                  {heroButtonText}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVideo(true)}
                  className="w-full md:w-auto bg-[#D3AF64] border-none text-white hover:bg-white hover:text-[#D3AF64] rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all uppercase tracking-wider"
                >
                  VIEW DEMO
                </Button>
              </div>
            </div>

            {/* Right Content - Snow Globe & Ornaments */}
            <div className="relative h-full flex flex-col items-center justify-center lg:justify-end mt-12 lg:mt-0">
              {/* Floating Candy Cane */}
              <motion.img
                src="/figmaAssets/candy-stick-1.png"
                alt="Candy Cane"
                className="absolute top-0 left-0 w-24 md:w-32 lg:w-40 h-auto z-20 pointer-events-none"
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Main Snow Globe */}
              <div className="relative z-10 w-full max-w-md lg:max-w-full">
                <img
                  src="/figmaAssets/snow-globe.png"
                  alt="Snow Globe"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>

              {/* Floating Christmas Ball */}
              <motion.img
                src="/figmaAssets/christmas-ball-1.png"
                alt="Christmas Ball"
                className="absolute bottom-0 right-0 w-32 md:w-48 lg:w-64 h-auto z-20 pointer-events-none"
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-24 bg-holiday-green relative mt-0 md:mt-20"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16 drop-shadow-lg"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 h-full backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center relative z-10">
                      <motion.img 
                        src={`/figmaAssets/bolas/${step.number}.png`} 
                        alt={`Step ${step.number}`} 
                        className="w-24 h-24 object-contain drop-shadow-lg"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2, // Stagger the animation slightly
                        }}
                      />
                    </div>
                    <h3 className="text-holiday-gold font-bold text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-holiday-green">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16 drop-shadow-lg"
          >
            Frequently Asked Questions
          </motion.h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white/5 border-white/10 rounded-xl px-6 hover:bg-white/10 transition-colors"
                >
                  <AccordionTrigger className="text-white text-lg font-medium text-left hover:no-underline hover:text-holiday-gold py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/80 text-base pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 text-white text-center relative overflow-hidden min-h-[400px] md:min-h-[600px] flex items-center justify-center">
        {/* Blurred Gold Background - More Transparent */}
        <div className="absolute inset-0 bg-[#1c442f]"></div>
        
        {/* Santa Gangster - Left Side */}
        <motion.div
          className="absolute left-4 lg:left-12 bottom-0 z-20 w-1/3 max-w-[400px] hidden md:block"
          initial={{ x: -100, y: 100, opacity: 0 }}
          whileInView={{ x: 0, y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img 
            src="/figmaAssets/CTA Section/santagangster.png" 
            alt="Santa Gangster" 
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Christmas Tree - Right Side */}
        <div className="absolute right-4 bottom-12 z-20 w-1/3 max-w-[350px] hidden md:block group">
           <img 
            src="/figmaAssets/CTA Section/christmastree.png" 
            alt="Christmas Tree" 
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="container mx-auto px-4 relative z-30">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-8 drop-shadow-lg"
          >
            Create your first event
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-90"
          >
            Start a new tradition with friends and family. It's free and easy!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => navigate(user ? "/create" : "/auth")}
              className="w-full md:w-auto bg-[#D83F31] text-white hover:bg-white hover:text-[#1f4c34] rounded-full px-10 py-8 text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all uppercase tracking-wider"
            >
              Start Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1f4c34] py-12 text-center text-white">
        <div className="container mx-auto px-4">
          <p className="text-lg font-medium">
            &copy; Keggel Company. All rights reserved.
          </p>
        </div>
      </footer>

      <VideoModal 
        isOpen={showVideo} 
        onClose={() => setShowVideo(false)} 
        videoUrl="https://youtu.be/E5h58XuLkn4" 
      />
    </div>
  );
}
