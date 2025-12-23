import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  email: text("email"), // Optional for now to avoid breaking existing rows if any, or make it required if I can reset DB. I'll make it optional for safety but intended to be populated.
  password: text("password").notNull(),
  nickname: text("nickname").notNull(),
  avatar: text("avatar").notNull().default("elf"), // Default avatar
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  hostName: text("host_name").notNull(),
  hostEmail: text("host_email").notNull(),
  hostUserId: integer("host_user_id").references(() => users.id), // Link to user if logged in
  status: text("status").notNull().default("active"),
  endDate: timestamp("end_date"), // Added duration/end date
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: integer("user_id").references(() => users.id), // Link to user if registered
  name: text("name").notNull(),
  email: text("email").notNull(),
  isHost: boolean("is_host").default(false).notNull(),
  hasAccepted: boolean("has_accepted").default(false).notNull(),
  magicToken: varchar("magic_token").default(sql`gen_random_uuid()`),
  assignedToId: varchar("assigned_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").notNull().references(() => participants.id),
  title: text("title").notNull(),
  description: text("description"),
  link: text("link"),
  price: text("price"), // Added price
  imageUrl: text("image_url"), // Added image url
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  nickname: true,
  avatar: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  hostName: true,
  hostEmail: true,
  hostUserId: true,
  endDate: true,
}).extend({
  hostUserId: z.number().optional(),
  endDate: z.date().optional(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  eventId: true,
  userId: true,
  name: true,
  email: true,
  isHost: true,
}).extend({
  isHost: z.boolean().optional().default(false),
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).pick({
  participantId: true,
  title: true,
  description: true,
  link: true,
  price: true,
  imageUrl: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
