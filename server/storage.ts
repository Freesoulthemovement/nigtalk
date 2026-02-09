import { users, tribes, tribeMembers, videos, messages, comments, type User, type InsertUser, type Tribe, type InsertTribe, type Video, type InsertVideo, type Message, type InsertMessage, type Comment, type InsertComment, type TribeMember } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users (handled by auth storage mostly, but maybe read access)
  getUser(id: string): Promise<User | undefined>;

  // Tribes
  createTribe(tribe: InsertTribe): Promise<Tribe>;
  getTribes(): Promise<Tribe[]>;
  getTribe(id: number): Promise<Tribe | undefined>;
  joinTribe(userId: string, tribeId: number): Promise<TribeMember>;
  getTribeMembers(tribeId: number): Promise<(TribeMember & { user: User })[]>;

  // Videos
  createVideo(video: InsertVideo): Promise<Video>;
  getVideos(tribeId?: number): Promise<(Video & { user: User })[]>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(tribeId: number): Promise<(Message & { user: User })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createTribe(tribe: InsertTribe): Promise<Tribe> {
    const [newTribe] = await db.insert(tribes).values(tribe).returning();
    return newTribe;
  }

  async getTribes(): Promise<Tribe[]> {
    return await db.select().from(tribes).orderBy(desc(tribes.createdAt));
  }

  async getTribe(id: number): Promise<Tribe | undefined> {
    const [tribe] = await db.select().from(tribes).where(eq(tribes.id, id));
    return tribe;
  }

  async joinTribe(userId: string, tribeId: number): Promise<TribeMember> {
    const [member] = await db.insert(tribeMembers).values({ userId, tribeId }).returning();
    return member;
  }

  async getTribeMembers(tribeId: number): Promise<(TribeMember & { user: User })[]> {
    const members = await db.select().from(tribeMembers)
      .innerJoin(users, eq(tribeMembers.userId, users.id))
      .where(eq(tribeMembers.tribeId, tribeId));
    
    return members.map(({ tribe_members, users }) => ({ ...tribe_members, user: users }));
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getVideos(tribeId?: number): Promise<(Video & { user: User })[]> {
    const query = db.select().from(videos).innerJoin(users, eq(videos.userId, users.id));
    
    if (tribeId) {
      query.where(eq(videos.tribeId, tribeId));
    }

    const results = await query.orderBy(desc(videos.createdAt));
    return results.map(({ videos, users }) => ({ ...videos, user: users }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(tribeId: number): Promise<(Message & { user: User })[]> {
    const results = await db.select().from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.tribeId, tribeId))
      .orderBy(desc(messages.createdAt))
      .limit(50); // Limit to last 50 messages
    
    return results.map(({ messages, users }) => ({ ...messages, user: users }));
  }
}

export const storage = new DatabaseStorage();
