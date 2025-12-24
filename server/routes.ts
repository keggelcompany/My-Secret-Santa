import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { insertEventSchema, insertParticipantSchema, insertWishlistItemSchema } from "@shared/schema";
import { z } from "zod";
import { sql } from "drizzle-orm";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateMatches(participantIds: string[]): Map<string, string> {
  const matches = new Map<string, string>();
  const shuffled = shuffleArray(participantIds);

  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    matches.set(giver, receiver);
  }

  return matches;
}

import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  console.log("Entering registerRoutes");
  app.post("/api/events", async (req, res) => {
    console.log("[POST /api/events] ===== START REQUEST =====");
    console.log("[POST /api/events] Raw request body:", JSON.stringify(req.body, null, 2));
    try {
      const payload = { ...req.body };
      console.log("[POST /api/events] Payload before date conversion:", JSON.stringify(payload, null, 2));

      if (payload.endDate) {
        payload.endDate = new Date(payload.endDate);
        console.log("[POST /api/events] Converted endDate to Date:", payload.endDate);
      }

      console.log("[POST /api/events] Payload before validation:", JSON.stringify(payload, null, 2));
      const eventData = insertEventSchema.parse(payload);
      console.log("[POST /api/events] Validated event data:", JSON.stringify(eventData, null, 2));

      const event = await storage.createEvent(eventData);
      console.log("[POST /api/events] Created event from DB:", JSON.stringify(event, null, 2));

      const hostParticipant = await storage.createParticipant({
        eventId: event.id,
        name: eventData.hostName,
        email: eventData.hostEmail,
        isHost: true,
      });
      console.log("[POST /api/events] Created host participant:", hostParticipant);

      console.log(`[Magic Link] Host invite for ${eventData.hostEmail}: /join/${hostParticipant.magicToken}`);

      res.json({ event, hostParticipant });
      console.log("[POST /api/events] ===== END REQUEST SUCCESS =====");
    } catch (error) {
      console.error("[POST /api/events] ===== ERROR =====", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  app.get("/api/health", async (req, res) => {
    try {
      console.log("[Health Check] Attempting to patch schema...");
      // Force add column if missing (hack to fix schema mismatch)
      await db.execute(sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS host_participates BOOLEAN`);
      console.log("[Health Check] Applied schema fix: host_participates column");

      const events = await storage.getEventsByUserId(0);
      res.json({ status: "ok", message: "Database connected and schema patched", timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("[Health Check] Database error:", error);
      res.status(500).json({ status: "error", message: "Database connection failed", error: String(error) });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  });

  app.post("/api/events/:id/participants", async (req, res) => {
    console.log(`[POST /api/events/${req.params.id}/participants] Received request`, req.body);
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        console.error(`[POST /api/events/${req.params.id}/participants] Event not found`);
        return res.status(404).json({ error: "Event not found" });
      }

      const participantData = insertParticipantSchema.parse({
        ...req.body,
        eventId: req.params.id,
        isHost: false,
      });
      console.log(`[POST /api/events/${req.params.id}/participants] Validated participant data:`, participantData);

      const participant = await storage.createParticipant(participantData);
      console.log(`[POST /api/events/${req.params.id}/participants] Created participant:`, participant);

      console.log(`[Magic Link] Invite for ${participant.email}: /join/${participant.magicToken}`);

      res.json(participant);
    } catch (error) {
      console.error(`[POST /api/events/${req.params.id}/participants] Error:`, error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid participant data" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const eventId = req.params.id;

    try {
      const event = await storage.getEvent(eventId);
      if (!event) return res.status(404).json({ error: "Event not found" });

      // Verify host
      if (event.hostUserId !== userId) {
        return res.status(403).json({ error: "Only the host can delete this event" });
      }

      // Manual cascade delete
      const participants = await storage.getParticipantsByEvent(eventId);
      console.log(`[DELETE /api/events/${eventId}] Found ${participants.length} participants`);

      // 1. Delete wishlist items
      let wishlistCount = 0;
      for (const p of participants) {
        const result = await db.execute(sql`DELETE FROM wishlist_items WHERE participant_id = ${p.id}`);
        wishlistCount += result.rowsAffected || 0;
      }
      console.log(`[DELETE /api/events/${eventId}] Deleted ${wishlistCount} wishlist items`);

      // 2. Delete participants
      const participantsResult = await db.execute(sql`DELETE FROM participants WHERE event_id = ${eventId}`);
      console.log(`[DELETE /api/events/${eventId}] Deleted ${participantsResult.rowsAffected || 0} participants`);

      // 3. Delete event
      const eventResult = await db.execute(sql`DELETE FROM events WHERE id = ${eventId}`);
      console.log(`[DELETE /api/events/${eventId}] Deleted ${eventResult.rowsAffected || 0} event(s)`);

      // Verify deletion
      const verifyEvent = await storage.getEvent(eventId);
      if (verifyEvent) {
        console.error(`[DELETE /api/events/${eventId}] ERROR: Event still exists!`);
        return res.status(500).json({ error: "Verification failed" });
      }

      console.log(`[DELETE /api/events/${eventId}] Successfully deleted`);
      res.json({
        success: true,
        deleted: {
          event: eventResult.rowsAffected || 0,
          participants: participantsResult.rowsAffected || 0,
          wishlistItems: wishlistCount
        }
      });
    } catch (error) {
      console.error(`[DELETE /api/events/${eventId}] Error:`, error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const updatedUser = await storage.updateUser(userId, req.body);
    res.json(updatedUser);
  });

  app.get("/api/user/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    console.log(`[GET /api/user/events] Fetching events for userId: ${userId}`);

    try {
      const hostedEvents = await storage.getEventsByUserId(userId);
      console.log(`[GET /api/user/events] Found ${hostedEvents.length} hosted events`);

      const participations = await storage.getParticipationsByUserId(userId);
      console.log(`[GET /api/user/events] Found ${participations.length} participations`);

      // Fetch event details for participations
      const participatingEvents = await Promise.all(
        participations.map(async (p) => {
          const event = await storage.getEvent(p.eventId);
          if (!event) console.warn(`[GET /api/user/events] Event not found for participation ${p.id} (eventId: ${p.eventId})`);
          return { ...event, participantId: p.id, magicToken: p.magicToken };
        })
      );

      const hostedEventsWithToken = await Promise.all(
        hostedEvents.map(async (event) => {
          const participants = await storage.getParticipantsByEvent(event.id);
          const hostParticipant = participants.find(p => p.isHost);
          if (!hostParticipant) console.warn(`[GET /api/user/events] Host participant not found for event ${event.id}`);
          return { ...event, magicToken: hostParticipant?.magicToken };
        })
      );

      // Filter out any null events from participatingEvents
      const validParticipatingEvents = participatingEvents.filter(e => e !== null && e.id !== null && e.id !== undefined);

      res.json({ hosted: hostedEventsWithToken, participating: validParticipatingEvents });
    } catch (error) {
      console.error("[GET /api/user/events] Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id/participants", async (req, res) => {
    const participants = await storage.getParticipantsByEvent(req.params.id);
    res.json(participants);
  });

  app.post("/api/events/:id/match", async (req, res) => {
    try {
      const participants = await storage.getParticipantsByEvent(req.params.id);

      if (participants.length < 2) {
        return res.status(400).json({ error: "Need at least 2 participants to generate matches" });
      }

      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Filter participants based on host participation preference
      let participantsToMatch = participants;

      // If host does NOT participate (false), exclude them from matching
      // If null/undefined (old event), we assume they participate (backward compatibility) or user choice?
      // User said: "todos los eventos existentes automáticamente tendrán hostParticipates = true ... no me parece que este bien"
      // But for matching, if they are already in the list, they are participants.
      // The new logic: if hostParticipates is explicitly false, remove them.
      if (event.hostParticipates === false) {
        participantsToMatch = participants.filter(p => !p.isHost);
      }

      if (participantsToMatch.length < 2) {
        return res.status(400).json({ error: "Need at least 2 participants to generate matches" });
      }

      const participantIds = participantsToMatch.map(p => p.id);
      const matches = generateMatches(participantIds);

      const matchEntries = Array.from(matches.entries());
      for (const [giverId, receiverId] of matchEntries) {
        await storage.assignSantaMatch(giverId, receiverId);
      }

      res.json({ success: true, matchCount: matches.size });
    } catch (error) {
      console.error("Error generating matches:", error);
      res.status(500).json({ error: "Failed to generate matches. Please try again." });
    }
  });

  app.post("/api/events/:id/end", async (req, res) => {
    const event = await storage.updateEventStatus(req.params.id, "ended");
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  });

  app.get("/api/join/:token", async (req, res) => {
    const participant = await storage.getParticipantByToken(req.params.token);
    if (!participant) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    const event = await storage.getEvent(participant.eventId);
    res.json({ participant, event });
  });

  app.post("/api/join/:token/accept", async (req, res) => {
    const participant = await storage.getParticipantByToken(req.params.token);
    if (!participant) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    const updated = await storage.updateParticipantAccepted(participant.id);
    res.json(updated);
  });

  app.get("/api/participants/:id", async (req, res) => {
    const participant = await storage.getParticipant(req.params.id);
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }
    res.json(participant);
  });

  app.get("/api/participants/:id/match", async (req, res) => {
    const participant = await storage.getParticipant(req.params.id);
    if (!participant || !participant.assignedToId) {
      return res.status(404).json({ error: "No match found" });
    }

    const match = await storage.getParticipant(participant.assignedToId);
    res.json(match);
  });

  app.get("/api/participants/:id/wishlist", async (req, res) => {
    const items = await storage.getWishlistItems(req.params.id);
    res.json(items);
  });

  app.post("/api/participants/:id/wishlist", async (req, res) => {
    try {
      if (!req.body.title?.trim()) {
        return res.status(400).json({ error: "Wishlist item title is required" });
      }

      const itemData = insertWishlistItemSchema.parse({
        ...req.body,
        participantId: req.params.id,
      });
      const item = await storage.createWishlistItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating wishlist item:", error);
      res.status(400).json({ error: "Failed to create wishlist item. Please check your data and try again." });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    await storage.deleteWishlistItem(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/events/:id/stats", async (req, res) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const participants = await storage.getParticipantsByEvent(req.params.id);
    let totalWishlistItems = 0;

    for (const p of participants) {
      const items = await storage.getWishlistItems(p.id);
      totalWishlistItems += items.length;
    }

    res.json({
      event,
      participantCount: participants.length,
      acceptedCount: participants.filter(p => p.hasAccepted).length,
      totalWishlistItems,
    });
  });

  const httpServer = createServer(app);
  console.log("Exiting registerRoutes");
  return httpServer;
}
