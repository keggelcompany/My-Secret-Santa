import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Snow } from "@/components/Snow";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-holiday-green font-sans relative overflow-hidden">
      <Snow />
      <Card className="w-full max-w-md mx-4 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl relative z-10">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-holiday-red/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-holiday-red" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-white/60 mb-8">
            The page you're looking for seems to have gotten lost in the snow.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-holiday-red hover:bg-holiday-red/90 text-white font-bold h-12 text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
