import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

export const tribes = pgTable("tribes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tribeMembers = pgTable("tribe_members", {
  id: serial("id").primaryKey(),
  tribeId: integer("tribe_id").references(() => tribes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: text("role").default("member"), // admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  tribeId: integer("tribe_id").references(() => tribes.id), // Optional, if private to tribe
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  tribeId: integer("tribe_id").references(() => tribes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const tribesRelations = relations(tribes, ({ one, many }) => ({
  members: many(tribeMembers),
  messages: many(messages),
  videos: many(videos),
  creator: one(users, {
    fields: [tribes.createdBy],
    references: [users.id],
  }),
}));

export const tribeMembersRelations = relations(tribeMembers, ({ one }) => ({
  tribe: one(tribes, {
    fields: [tribeMembers.tribeId],
    references: [tribes.id],
  }),
  user: one(users, {
    fields: [tribeMembers.userId],
    references: [users.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  comments: many(comments),
  tribe: one(tribes, {
    fields: [videos.tribeId],
    references: [tribes.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  tribe: one(tribes, {
    fields: [messages.tribeId],
    references: [tribes.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
}));

// Schemas
export const insertTribeSchema = createInsertSchema(tribes).omit({ id: true, createdAt: true, createdBy: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true, userId: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, userId: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, userId: true });

// Types
export type Tribe = typeof tribes.$inferSelect;
export type InsertTribe = z.infer<typeof insertTribeSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type TribeMember = typeof tribeMembers.$inferSelect;
