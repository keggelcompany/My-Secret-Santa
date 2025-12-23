
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
// import { eq } from "drizzle-orm";
import {
  events,
  participants,
  wishlistItems,
  users,
  type Event,
  type InsertEvent,
  type Participant,
  type InsertParticipant,
  type WishlistItem,
  type InsertWishlistItem,
  type User,
  type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByEmail(email: string): Promise<Event[]>;
  getEventsByUserId(userId: number): Promise<Event[]>;
  updateEventStatus(id: string, status: string): Promise<Event | undefined>;

  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipationsByUserId(userId: number): Promise<Participant[]>;
  getParticipantByToken(token: string): Promise<Participant | undefined>;
  getParticipantsByEvent(eventId: string): Promise<Participant[]>;
  updateParticipantAccepted(id: string): Promise<Participant | undefined>;
  assignSantaMatch(id: string, assignedToId: string): Promise<Participant | undefined>;

  createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  getWishlistItems(participantId: string): Promise<WishlistItem[]>;
  deleteWishlistItem(id: string): Promise<void>;
}





export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    try {
      console.log("[DatabaseStorage.createEvent] Attempting insert:", insertEvent);
      const [event] = await db
        .insert(events)
        .values(insertEvent)
        .returning();
      console.log("[DatabaseStorage.createEvent] Insert successful:", event);
      return event;
    } catch (error) {
      console.error("[DatabaseStorage.createEvent] Insert failed:", error);
      throw error;
    }
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }

  async getEventsByEmail(email: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.hostEmail, email));
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.hostUserId, userId));
  }

  async updateEventStatus(id: string, status: string): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ status })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    try {
      console.log("[DatabaseStorage.createParticipant] Attempting insert:", insertParticipant);
      const [participant] = await db
        .insert(participants)
        .values(insertParticipant)
        .returning();
      console.log("[DatabaseStorage.createParticipant] Insert successful:", participant);
      return participant;
    } catch (error) {
      console.error("[DatabaseStorage.createParticipant] Insert failed:", error);
      throw error;
    }
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id));
    return participant;
  }

  async getParticipationsByUserId(userId: number): Promise<Participant[]> {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.userId, userId));
  }

  async getParticipantByToken(token: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.magicToken, token));
    return participant;
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.eventId, eventId));
  }

  async updateParticipantAccepted(id: string): Promise<Participant | undefined> {
    const [participant] = await db
      .update(participants)
      .set({ hasAccepted: true })
      .where(eq(participants.id, id))
      .returning();
    return participant;
  }

  async assignSantaMatch(id: string, assignedToId: string): Promise<Participant | undefined> {
    const [participant] = await db
      .update(participants)
      .set({ assignedToId })
      .where(eq(participants.id, id))
      .returning();
    return participant;
  }

  async createWishlistItem(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    const [item] = await db
      .insert(wishlistItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getWishlistItems(participantId: string): Promise<WishlistItem[]> {
    return await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.participantId, participantId));
  }

  async deleteWishlistItem(id: string): Promise<void> {
    await db
      .delete(wishlistItems)
      .where(eq(wishlistItems.id, id));
  }
}

export const storage = new DatabaseStorage();
