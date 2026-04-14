import { users, tribes, tribeMembers, videos, messages, userBestowals, vibes, blockedUsers, tribalShieldCases, type User, type Tribe, type Video, type Message, type UserBestowal, type Vibe, type TribalShieldCase } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  createTribe(tribe: any): Promise<Tribe>;
  getTribes(): Promise<Tribe[]>;
  getTribe(id: number): Promise<Tribe | undefined>;
  updateTribe(id: number, data: any): Promise<Tribe>;
  joinTribe(userId: string, tribeId: number): Promise<any>;
  getTribeMembers(tribeId: number): Promise<any[]>;
  getUserTribeCount(userId: string): Promise<number>;
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
  toggleVibe(userId: string, videoId: number, isVibe: boolean): Promise<Vibe>;
  getVideoVibes(videoId: number): Promise<{ vibes: number; notVibes: number }>;
  getUserVibe(userId: string, videoId: number): Promise<Vibe | undefined>;
  blockUser(userId: string, blockedUserId: string): Promise<void>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  getBlockedUsers(userId: string): Promise<string[]>;
  createShieldCase(data: any): Promise<TribalShieldCase>;
  getShieldCases(userId?: string): Promise<TribalShieldCase[]>;
  updateShieldCase(id: number, data: any): Promise<TribalShieldCase>;
  witnessShieldCase(caseId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return updated;
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

  async updateTribe(id: number, data: any): Promise<Tribe> {
    const [updated] = await db.update(tribes).set(data).where(eq(tribes.id, id)).returning();
    return updated;
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

  async getUserTribeCount(userId: string): Promise<number> {
    const result = await db.select({ cnt: count() }).from(tribes).where(eq(tribes.createdBy, userId));
    return result[0]?.cnt || 0;
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
    const result = await db.select().from(users).where(or(...uniqueIds.map(id => eq(users.id, id))));
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

  async toggleVibe(userId: string, videoId: number, isVibe: boolean): Promise<Vibe> {
    const existing = await db.select().from(vibes).where(and(eq(vibes.userId, userId), eq(vibes.videoId, videoId)));
    if (existing.length > 0) {
      const [updated] = await db.update(vibes).set({ isVibe }).where(eq(vibes.id, existing[0].id)).returning();
      return updated;
    }
    const [created] = await db.insert(vibes).values({ userId, videoId, isVibe }).returning();
    return created;
  }

  async getVideoVibes(videoId: number): Promise<{ vibes: number; notVibes: number }> {
    const results = await db.select().from(vibes).where(eq(vibes.videoId, videoId));
    return {
      vibes: results.filter(v => v.isVibe).length,
      notVibes: results.filter(v => !v.isVibe).length,
    };
  }

  async getUserVibe(userId: string, videoId: number): Promise<Vibe | undefined> {
    const [v] = await db.select().from(vibes).where(and(eq(vibes.userId, userId), eq(vibes.videoId, videoId)));
    return v;
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    const existing = await db.select().from(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
    if (existing.length === 0) {
      await db.insert(blockedUsers).values({ userId, blockedUserId });
    }
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await db.delete(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const results = await db.select().from(blockedUsers).where(eq(blockedUsers.userId, userId));
    return results.map(r => r.blockedUserId);
  }

  async createShieldCase(data: any): Promise<TribalShieldCase> {
    const [created] = await db.insert(tribalShieldCases).values(data).returning();
    return created;
  }

  async getShieldCases(userId?: string): Promise<TribalShieldCase[]> {
    if (userId) {
      return await db.select().from(tribalShieldCases).where(eq(tribalShieldCases.userId, userId)).orderBy(desc(tribalShieldCases.createdAt));
    }
    return await db.select().from(tribalShieldCases).orderBy(desc(tribalShieldCases.createdAt));
  }

  async updateShieldCase(id: number, data: any): Promise<TribalShieldCase> {
    const [updated] = await db.update(tribalShieldCases).set(data).where(eq(tribalShieldCases.id, id)).returning();
    return updated;
  }

  async witnessShieldCase(caseId: number): Promise<void> {
    await db.update(tribalShieldCases).set({ witnessCount: sql`${tribalShieldCases.witnessCount} + 1` }).where(eq(tribalShieldCases.id, caseId));
  }
}

export const storage = new DatabaseStorage();
