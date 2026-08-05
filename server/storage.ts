import { users, tribes, tribeMembers, videos, messages, userBestowals, vibes, blockedUsers, tribalShieldCases, proposals, proposalVotes, proposalSuggestions, fundingAllocations, notifications, userAcceptances, type User, type Tribe, type Video, type Message, type UserBestowal, type Vibe, type TribalShieldCase, type Proposal, type ProposalVote, type ProposalSuggestion, type FundingAllocation } from "@shared/schema";
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
  getUserTribeIds(userId: string): Promise<number[]>;
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
  getShieldCase(id: number): Promise<TribalShieldCase | undefined>;
  getShieldCases(userId?: string): Promise<TribalShieldCase[]>;
  updateShieldCase(id: number, data: any): Promise<TribalShieldCase>;
  witnessShieldCase(caseId: number): Promise<void>;
  createProposal(data: any): Promise<Proposal>;
  getProposals(opts: { tribeId?: number; status?: string; scope?: string; userTribeIds?: number[] }): Promise<any[]>;
  getProposal(id: number): Promise<any | undefined>;
  upsertVote(proposalId: number, userId: string, voteType: string): Promise<void>;
  removeVote(proposalId: number, userId: string): Promise<void>;
  getUserVoteOnProposal(proposalId: number, userId: string): Promise<ProposalVote | undefined>;
  addSuggestion(data: any): Promise<ProposalSuggestion>;
  getSuggestions(proposalId: number): Promise<any[]>;
  addFundingAllocation(proposalId: number, userId: string, amount: string): Promise<FundingAllocation>;
  getUserAllocatedFunds(proposalId: number, userId: string): Promise<string>;
  getTotalAllocatedByUser(userId: string): Promise<number>;
  getUserVotesForProposals(userId: string, proposalIds: number[]): Promise<Record<number, string>>;
  createNotification(data: { userId: string; type: string; tribeId?: number; proposalId?: number; title: string; body?: string }): Promise<void>;
  getNotifications(userId: string): Promise<any[]>;
  markNotificationRead(id: number, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  markTribeNotificationsRead(userId: string, tribeId: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  hasAcceptedTerms(userId: string): Promise<boolean>;
  acceptTerms(userId: string): Promise<void>;
  expireOverdueProposals(): Promise<number>;
}

function computeNullification(supportCount: number, nullifyCount: number) {
  const total = supportCount + nullifyCount;
  if (total === 0) return { pct: 0, isNullified: false };
  const pct = (nullifyCount / total) * 100;
  // Use exact integer ratio to avoid floating-point edge cases at exactly 2/3:
  // 2 nullify / 3 total → nullifyCount*3=6, total*2=6 → 6>=6 → true (correctly nullified)
  const isNullified = nullifyCount * 3 >= total * 2;
  return { pct, isNullified };
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

  async getUserTribeIds(userId: string): Promise<number[]> {
    const rows = await db.select({ tribeId: tribeMembers.tribeId }).from(tribeMembers).where(eq(tribeMembers.userId, userId));
    return rows.map(r => r.tribeId);
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

  async getShieldCase(id: number): Promise<TribalShieldCase | undefined> {
    const [c] = await db.select().from(tribalShieldCases).where(eq(tribalShieldCases.id, id));
    return c;
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

  // ── Governance ────────────────────────────────────────────────────────────

  async createProposal(data: any): Promise<Proposal> {
    const [created] = await db.insert(proposals).values(data).returning();
    return created;
  }

  async getProposals(opts: { tribeId?: number; status?: string; scope?: string; userTribeIds?: number[] }): Promise<any[]> {
    const rows = await db.select().from(proposals).orderBy(desc(proposals.createdAt));
    const userTribes = opts.userTribeIds ?? [];
    const now = new Date();

    // Step 1: Scope filter (access control, no status dependency)
    const scopeFiltered = rows.filter(p => {
      if (opts.tribeId != null) return p.tribeId === opts.tribeId;
      if (opts.scope === "platform") return p.tribeId === null;
      if (opts.scope === "tribe") {
        if (!userTribes.length) return false;
        return p.tribeId !== null && userTribes.includes(p.tribeId!);
      }
      return p.tribeId === null || (userTribes.length > 0 && userTribes.includes(p.tribeId!));
    });

    // Step 2: Compute derived status for each, persist changes, THEN apply status filter
    const enriched = await Promise.all(scopeFiltered.map(async (p) => {
      const [votes, suggRows] = await Promise.all([
        db.select().from(proposalVotes).where(eq(proposalVotes.proposalId, p.id)),
        db.select().from(proposalSuggestions).where(eq(proposalSuggestions.proposalId, p.id)).orderBy(desc(proposalSuggestions.createdAt)),
      ]);
      const supportCount = votes.filter(v => v.voteType === "support").length;
      const nullifyCount = votes.filter(v => v.voteType === "nullify").length;
      const { pct, isNullified } = computeNullification(supportCount, nullifyCount);

      // Derive status: expiry beats nullification; nullification beats active
      let derivedStatus = p.status;
      if (p.expiresAt && new Date(p.expiresAt) <= now && derivedStatus === "active") {
        derivedStatus = "expired";
        await db.update(proposals).set({ status: "expired" }).where(eq(proposals.id, p.id));
      } else if (isNullified && derivedStatus === "active") {
        derivedStatus = "nullified";
        await db.update(proposals).set({ status: "nullified" }).where(eq(proposals.id, p.id));
      } else if (!isNullified && derivedStatus === "nullified") {
        // Votes shifted back below threshold — reactivate
        derivedStatus = "active";
        await db.update(proposals).set({ status: "active" }).where(eq(proposals.id, p.id));
      }

      const [proposer] = await db.select().from(users).where(eq(users.id, p.proposerId));
      let tribe: Tribe | undefined;
      if (p.tribeId) {
        const [t] = await db.select().from(tribes).where(eq(tribes.id, p.tribeId));
        tribe = t;
      }
      const suggestions = await Promise.all(suggRows.map(async (s) => {
        const [u] = await db.select().from(users).where(eq(users.id, s.userId));
        return { ...s, user: u };
      }));

      return { ...p, status: derivedStatus, supportCount, nullifyCount, nullifyPct: pct, proposer, tribe, suggestions };
    }));

    // Step 3: Apply status filter against derived status (correct order)
    if (opts.status && opts.status !== "all") {
      return enriched.filter(p => p.status === opts.status);
    }
    return enriched;
  }

  // Check if a user has visibility access to a proposal (platform-wide or in their tribes)
  async canUserAccessProposal(proposalId: number, userId: string): Promise<boolean> {
    const [p] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
    if (!p) return false;
    if (p.tribeId === null) return true; // Platform-wide: accessible to all
    // Tribe-scoped: user must be a member
    const membership = await db.select().from(tribeMembers).where(and(eq(tribeMembers.tribeId, p.tribeId), eq(tribeMembers.userId, userId)));
    return membership.length > 0;
  }

  async getProposal(id: number): Promise<any | undefined> {
    const [p] = await db.select().from(proposals).where(eq(proposals.id, id));
    if (!p) return undefined;

    const votes = await db.select().from(proposalVotes).where(eq(proposalVotes.proposalId, id));
    const suggRows = await db.select().from(proposalSuggestions).where(eq(proposalSuggestions.proposalId, id)).orderBy(desc(proposalSuggestions.createdAt));
    const allocs = await db.select().from(fundingAllocations).where(eq(fundingAllocations.proposalId, id));

    const supportCount = votes.filter(v => v.voteType === "support").length;
    const nullifyCount = votes.filter(v => v.voteType === "nullify").length;
    const { pct, isNullified } = computeNullification(supportCount, nullifyCount);
    const now = new Date();

    let status = p.status;
    if (p.expiresAt && new Date(p.expiresAt) <= now && status === "active") {
      await db.update(proposals).set({ status: "expired" }).where(eq(proposals.id, id));
      status = "expired";
    } else if (isNullified && status === "active") {
      await db.update(proposals).set({ status: "nullified" }).where(eq(proposals.id, id));
      status = "nullified";
    } else if (!isNullified && status === "nullified") {
      await db.update(proposals).set({ status: "active" }).where(eq(proposals.id, id));
      status = "active";
    }

    const suggestionsWithUsers = await Promise.all(suggRows.map(async (s) => {
      const [u] = await db.select().from(users).where(eq(users.id, s.userId));
      return { ...s, user: u };
    }));

    return { ...p, status, supportCount, nullifyCount, nullifyPct: pct, votes, suggestions: suggestionsWithUsers, allocations: allocs };
  }

  async upsertVote(proposalId: number, userId: string, voteType: string): Promise<void> {
    const existing = await db.select().from(proposalVotes).where(and(eq(proposalVotes.proposalId, proposalId), eq(proposalVotes.userId, userId)));
    if (existing.length > 0) {
      await db.update(proposalVotes).set({ voteType }).where(eq(proposalVotes.id, existing[0].id));
    } else {
      await db.insert(proposalVotes).values({ proposalId, userId, voteType });
    }
    const allVotes = await db.select().from(proposalVotes).where(eq(proposalVotes.proposalId, proposalId));
    const s = allVotes.filter(v => v.voteType === "support").length;
    const n = allVotes.filter(v => v.voteType === "nullify").length;
    const { isNullified } = computeNullification(s, n);
    if (isNullified) {
      await db.update(proposals).set({ status: "nullified" }).where(eq(proposals.id, proposalId));
    } else {
      const [p] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
      if (p?.status === "nullified") {
        await db.update(proposals).set({ status: "active" }).where(eq(proposals.id, proposalId));
      }
    }
  }

  async removeVote(proposalId: number, userId: string): Promise<void> {
    await db.delete(proposalVotes).where(and(eq(proposalVotes.proposalId, proposalId), eq(proposalVotes.userId, userId)));
    const allVotes = await db.select().from(proposalVotes).where(eq(proposalVotes.proposalId, proposalId));
    const s = allVotes.filter(v => v.voteType === "support").length;
    const n = allVotes.filter(v => v.voteType === "nullify").length;
    const { isNullified } = computeNullification(s, n);
    if (!isNullified) {
      const [p] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
      if (p?.status === "nullified") {
        await db.update(proposals).set({ status: "active" }).where(eq(proposals.id, proposalId));
      }
    }
  }

  async getUserVoteOnProposal(proposalId: number, userId: string): Promise<ProposalVote | undefined> {
    const [v] = await db.select().from(proposalVotes).where(and(eq(proposalVotes.proposalId, proposalId), eq(proposalVotes.userId, userId)));
    return v;
  }

  async addSuggestion(data: any): Promise<ProposalSuggestion> {
    const [created] = await db.insert(proposalSuggestions).values(data).returning();
    return created;
  }

  async getSuggestions(proposalId: number): Promise<any[]> {
    const rows = await db.select().from(proposalSuggestions).where(eq(proposalSuggestions.proposalId, proposalId)).orderBy(desc(proposalSuggestions.createdAt));
    return Promise.all(rows.map(async (s) => {
      const [u] = await db.select().from(users).where(eq(users.id, s.userId));
      return { ...s, user: u };
    }));
  }

  async addFundingAllocation(proposalId: number, userId: string, amount: string): Promise<FundingAllocation> {
    const [created] = await db.insert(fundingAllocations).values({ proposalId, userId, amount }).returning();
    return created;
  }

  async getUserAllocatedFunds(proposalId: number, userId: string): Promise<string> {
    const rows = await db.select().from(fundingAllocations).where(and(eq(fundingAllocations.proposalId, proposalId), eq(fundingAllocations.userId, userId)));
    const total = rows.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
    return total.toFixed(2);
  }

  async getTotalAllocatedByUser(userId: string): Promise<number> {
    const rows = await db.select().from(fundingAllocations).where(eq(fundingAllocations.userId, userId));
    return rows.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
  }

  async getUserVotesForProposals(userId: string, proposalIds: number[]): Promise<Record<number, string>> {
    if (!proposalIds.length) return {};
    const rows = await db.select().from(proposalVotes).where(
      and(eq(proposalVotes.userId, userId))
    );
    const result: Record<number, string> = {};
    for (const row of rows) {
      if (proposalIds.includes(row.proposalId)) {
        result[row.proposalId] = row.voteType;
      }
    }
    return result;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  async createNotification(data: { userId: string; type: string; tribeId?: number; proposalId?: number; title: string; body?: string }): Promise<void> {
    await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      tribeId: data.tribeId ?? null,
      proposalId: data.proposalId ?? null,
      title: data.title,
      body: data.body ?? null,
    });
  }

  async getNotifications(userId: string): Promise<any[]> {
    const rows = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return rows;
  }

  async markNotificationRead(id: number, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async markTribeNotificationsRead(userId: string, tribeId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.tribeId, tribeId),
          eq(notifications.isRead, false)
        )
      );
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ cnt: count() }).from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.cnt || 0;
  }

  async hasAcceptedTerms(userId: string): Promise<boolean> {
    const rows = await db.select().from(userAcceptances).where(eq(userAcceptances.userId, userId));
    return rows.length > 0;
  }

  async acceptTerms(userId: string): Promise<void> {
    await db.insert(userAcceptances)
      .values({ userId })
      .onConflictDoNothing();
  }

  async expireOverdueProposals(): Promise<number> {
    const result = await db
      .update(proposals)
      .set({ status: "expired" })
      .where(
        and(
          eq(proposals.status, "active"),
          sql`${proposals.expiresAt} IS NOT NULL`,
          sql`${proposals.expiresAt} <= NOW()`
        )
      )
      .returning({ id: proposals.id });
    return result.length;
  }
}


export const storage = new DatabaseStorage();
