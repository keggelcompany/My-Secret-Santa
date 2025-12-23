import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import CreateEvent from "@/pages/CreateEvent";
import DashboardPage from "@/pages/DashboardPage";

import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import EventView from "@/pages/EventView";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateEvent} />
      <Route path="/join/:token" component={EventView} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
