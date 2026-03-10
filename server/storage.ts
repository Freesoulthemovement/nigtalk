import { users, tribes, tribeMembers, videos, messages, userBestowals, type User, type Tribe, type Video, type Message, type UserBestowal } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createTribe(tribe: any): Promise<Tribe>;
  getTribes(): Promise<Tribe[]>;
  getTribe(id: number): Promise<Tribe | undefined>;
  joinTribe(userId: string, tribeId: number): Promise<any>;
  getTribeMembers(tribeId: number): Promise<any[]>;
  createVideo(video: any): Promise<Video>;
  getVideos(tribeId?: number, category?: string): Promise<any[]>;
  createMessage(msg: any): Promise<Message>;
  getMessages(tribeId: number): Promise<any[]>;
  getDMMessages(userId1: string, userId2: string): Promise<any[]>;
  createDM(senderId: string, receiverId: string, content: string): Promise<Message>;
  getDMConversations(userId: string): Promise<User[]>;
  getBestowal(userId: string): Promise<UserBestowal | undefined>;
  upsertBestowal(userId: string, monthlyAmount: string): Promise<UserBestowal>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createTribe(tribe: any): Promise<Tribe> {
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

  async joinTribe(userId: string, tribeId: number): Promise<any> {
    const existing = await db.select().from(tribeMembers)
      .where(and(eq(tribeMembers.userId, userId), eq(tribeMembers.tribeId, tribeId)));
    if (existing.length > 0) return existing[0];
    const [member] = await db.insert(tribeMembers).values({ userId, tribeId }).returning();
    return member;
  }

  async getTribeMembers(tribeId: number): Promise<any[]> {
    const members = await db.select().from(tribeMembers)
      .innerJoin(users, eq(tribeMembers.userId, users.id))
      .where(eq(tribeMembers.tribeId, tribeId));
    return members.map(({ tribe_members, users: u }) => ({ ...tribe_members, user: u }));
  }

  async createVideo(video: any): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getVideos(tribeId?: number, category?: string): Promise<any[]> {
    let query = db.select().from(videos).innerJoin(users, eq(videos.userId, users.id));

    const conditions = [];
    if (tribeId) conditions.push(eq(videos.tribeId, tribeId));
    if (category) conditions.push(eq(videos.category, category));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(videos.createdAt));
    return results.map(({ videos: v, users: u }) => ({ ...v, user: u }));
  }

  async createMessage(msg: any): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(msg).returning();
    return newMessage;
  }

  async getMessages(tribeId: number): Promise<any[]> {
    const results = await db.select().from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.tribeId, tribeId))
      .orderBy(desc(messages.createdAt))
      .limit(50);
    return results.map(({ messages: m, users: u }) => ({ ...m, user: u }));
  }

  async getDMMessages(userId1: string, userId2: string): Promise<any[]> {
    const results = await db.select().from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          sql`${messages.tribeId} IS NULL`,
          or(
            and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
            and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
          )
        )
      )
      .orderBy(messages.createdAt)
      .limit(100);
    return results.map(({ messages: m, users: u }) => ({ ...m, user: u }));
  }

  async createDM(senderId: string, receiverId: string, content: string): Promise<Message> {
    const [msg] = await db.insert(messages).values({ senderId, receiverId, content }).returning();
    return msg;
  }

  async getDMConversations(userId: string): Promise<User[]> {
    const sent = await db.select({ id: messages.receiverId }).from(messages)
      .where(and(eq(messages.senderId, userId), sql`${messages.tribeId} IS NULL`));
    const received = await db.select({ id: messages.senderId }).from(messages)
      .where(and(eq(messages.receiverId, userId), sql`${messages.tribeId} IS NULL`));

    const allIds = [...sent.map(s => s.id), ...received.map(r => r.id)].filter(Boolean) as string[];
    const uniqueIds = Array.from(new Set(allIds));
    if (uniqueIds.length === 0) return [];

    const result = await db.select().from(users).where(
      or(...uniqueIds.map(id => eq(users.id, id)))
    );
    return result;
  }

  async getBestowal(userId: string): Promise<UserBestowal | undefined> {
    const [b] = await db.select().from(userBestowals).where(eq(userBestowals.userId, userId));
    return b;
  }

  async upsertBestowal(userId: string, monthlyAmount: string): Promise<UserBestowal> {
    const existing = await this.getBestowal(userId);
    const monthlyNum = parseFloat(monthlyAmount);
    const fscEarned = (monthlyNum * 0.01 * 0.2).toFixed(8);

    if (existing) {
      const newFsc = (parseFloat(existing.fscBalance || "0") + parseFloat(fscEarned)).toFixed(8);
      const [updated] = await db.update(userBestowals)
        .set({ monthlyAmount, fscBalance: newFsc, updatedAt: new Date() })
        .where(eq(userBestowals.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userBestowals)
        .values({ userId, monthlyAmount, fscBalance: fscEarned })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
