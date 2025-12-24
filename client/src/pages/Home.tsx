import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Snow } from "@/components/Snow";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";

interface UserEventsResponse {
  hosted: (Event & { magicToken?: string })[];
  participating: (Event & { magicToken: string })[];
}

const steps = [
  { number: "1", title: "Create Event", description: "Set up your Secret Santa exchange as the host" },
  { number: "2", title: "Add Participants", description: "Invite friends and family via email" },
  { number: "3", title: "Automatic Matching", description: "We randomly assign each person their Secret Santa" },
  { number: "4", title: "Manage Wishlists", description: "Participants create wishlists for gift ideas" },
  { number: "5", title: "Event Wrap-up", description: "End the event and share personalized holiday cards" },
];

const faqs = [
  {
    question: "What is Secret Santa?",
    answer: "Secret Santa is a gift-giving tradition where participants are randomly assigned another person to give a gift to, without revealing who they are until the gift exchange."
  },
  {
    question: "How does the matching work?",
    answer: "Our system randomly assigns each participant to another person in the group. We ensure no one gets themselves, and the assignments are kept secret until the event ends."
  },
  {
    question: "Is it free to use?",
    answer: "Yes! My Secret Santa is completely free to use. Create as many events as you like and invite as many participants as needed."
  },
  {
    question: "How do participants join?",
    answer: "When you add participants, they receive a magic link via email. Clicking this link lets them join the event, view their match, and create their wishlist."
  },
  {
    question: "Can I see all the matches as the host?",
    answer: "The host can choose to participate or just host. If participating, they cannot see matches until the event ends. If they decide NOT to participate, they can see all matches to manage the event."
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: userEvents } = useQuery<UserEventsResponse>({
    queryKey: ["/api/user/events"],
    enabled: !!user,
  });

  let heroButtonText = "TRY NOW";
  let heroButtonAction = () => navigate(user ? "/create" : "/auth");

  if (user && userEvents) {
    const activeHosted = userEvents.hosted.find((e: any) => e.status === "active");
    const activeParticipating = userEvents.participating.find((e: any) => e.status === "active");

    if (activeHosted) {
      heroButtonText = "Check Event Status";
      heroButtonAction = () => navigate(`/join/${activeHosted.magicToken}`);
    } else if (activeParticipating) {
      heroButtonText = "Who is your Secret Santa?";
      heroButtonAction = () => navigate(`/join/${activeParticipating.magicToken}`);
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
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="relative z-20 text-center lg:text-left mt-10 lg:mt-0">
              <div className="relative inline-block">
                {/* Floating Santa Hat */}
                <motion.img
                  src="/figmaAssets/santa-hat.png"
                  alt="Santa Hat"
                  className="absolute -top-16 -left-12 md:-top-20 md:-left-8 w-28 md:w-40 h-auto z-30 pointer-events-none"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tight mb-8 drop-shadow-lg relative z-20">
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
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full md:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-holiday-green rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all uppercase tracking-wider"
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
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-holiday-green relative mt-20">
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
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 h-full backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-holiday-red rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
                      {step.number}
                    </div>
                    <h3 className="text-holiday-gold font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{step.description}</p>
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
                <AccordionItem value={`item-${index}`} className="bg-white/5 border-white/10 rounded-xl px-6 hover:bg-white/10 transition-colors">
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
      <section className="py-24 bg-holiday-red text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Create your first exchange</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-90">
            Start a new tradition with friends and family. It's free and easy!
          </p>
          <Button
            onClick={() => navigate(user ? "/create" : "/auth")}
            className="w-full md:w-auto bg-white text-holiday-red hover:bg-gray-100 rounded-full px-10 py-8 text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all uppercase tracking-wider"
          >
            Start Now
          </Button>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl">🎄</div>
          <div className="absolute bottom-10 right-10 text-9xl">🎁</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 py-12 text-center text-white/60">
        <div className="container mx-auto px-4">
          <p className="text-lg font-medium">&copy; 2024 Keggel Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
