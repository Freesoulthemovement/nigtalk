import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth/routes";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { insertTribeSchema, insertVideoSchema, insertProposalSchema } from "@shared/schema";
import { z } from "zod";
import { listDriveFiles, getUncachableGoogleDriveClient } from "./replit_integrations/google_drive/googleDrive";

// ── Document fallback (only entries with real static assets) ─────────────────
// Only the Living Dictionary has a bundled PDF. The other governance documents
// are not served from static assets — they require Google Drive to be configured.
const FALLBACK_DOCUMENTS = [
  { id: "fallback-dictionary", name: "Free Soul Living Dictionary", mimeType: "application/pdf", modifiedTime: "2025-10-16T00:00:00Z", isLive: false },
];

// ── Folder-scoped allowlist cache ─────────────────────────────────────────────
// Prevents the content proxy from serving arbitrary Drive files.
// Cache the set of allowed IDs for ALLOWLIST_TTL_MS to avoid a Drive listing
// on every document open while still picking up newly added files quickly.
const ALLOWLIST_TTL_MS = 5 * 60 * 1000; // 5 minutes
let allowlistCache: { ids: Set<string>; expiresAt: number } | null = null;

async function getAllowedDriveIds(): Promise<Set<string> | null> {
  const folderId = process.env.GOOGLE_DRIVE_DOCS_FOLDER_ID;
  if (!folderId) return null;

  const now = Date.now();
  if (allowlistCache && now < allowlistCache.expiresAt) {
    return allowlistCache.ids;
  }

  try {
    const result = await listDriveFiles(folderId);
    const ids = new Set<string>(((result as any).files || []).map((f: any) => f.id as string));
    allowlistCache = { ids, expiresAt: now + ALLOWLIST_TTL_MS };
    return ids;
  } catch (err) {
    console.error("[documents] Failed to refresh allowlist:", err);
    // Return stale cache rather than denying all requests on a transient error
    return allowlistCache?.ids ?? null;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  app.get("/api/tribes", async (req, res) => {
    const tribes = await storage.getTribes();
    res.json(tribes);
  });

  app.get("/api/tribes/mine", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeIds = await storage.getUserTribeIds(userId);
    const all = await storage.getTribes();
    res.json(all.filter(t => tribeIds.includes(t.id)));
  });

  app.post("/api/tribes", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const tribeCount = await storage.getUserTribeCount(userId);
      if (tribeCount >= 8) return res.status(400).json({ message: "Maximum 8 tribes per account" });
      const input = insertTribeSchema.parse(req.body);
      const tribe = await storage.createTribe({ ...input, createdBy: userId });
      await storage.joinTribe(userId, tribe.id);
      res.status(201).json(tribe);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/tribes/:id", async (req, res) => {
    const tribe = await storage.getTribe(Number(req.params.id));
    if (!tribe) return res.status(404).json({ message: "Tribe not found" });
    const members = await storage.getTribeMembers(tribe.id);
    res.json({ ...tribe, members });
  });

  app.patch("/api/tribes/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribe = await storage.getTribe(Number(req.params.id));
    if (!tribe || tribe.createdBy !== userId) return res.status(403).json({ message: "Not authorized" });
    const updated = await storage.updateTribe(tribe.id, req.body);
    res.json(updated);
  });

  app.post("/api/tribes/:id/join", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeId = Number(req.params.id);
    const member = await storage.joinTribe(userId, tribeId);
    res.json(member);
  });

  app.get("/api/videos", async (req, res) => {
    const tribeId = req.query.tribeId ? Number(req.query.tribeId) : undefined;
    const category = req.query.category as string | undefined;
    const videos = await storage.getVideos(tribeId, category);
    res.json(videos);
  });

  app.post("/api/videos", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const input = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo({ ...input, userId });
      res.status(201).json(video);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/tribes/:id/messages", async (req, res) => {
    const msgs = await storage.getMessages(Number(req.params.id));
    res.json(msgs.reverse());
  });

  app.post("/api/tribes/:id/messages", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeId = Number(req.params.id);
    try {
      const msgSchema = z.object({ content: z.string().min(1), isRadio: z.boolean().optional() });
      const input = msgSchema.parse(req.body);
      const message = await storage.createMessage({
        senderId: userId,
        tribeId,
        content: input.content,
        isRadio: input.isRadio || false,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/dm", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const conversations = await storage.getDMConversations(userId);
    res.json(conversations);
  });

  app.get("/api/dm/:userId", isAuthenticated, async (req, res) => {
    const myId = (req.user as any).claims.sub;
    const otherId = req.params.userId as string;
    const msgs = await storage.getDMMessages(myId, otherId);
    res.json(msgs);
  });

  app.post("/api/dm/:userId", isAuthenticated, async (req, res) => {
    const myId = (req.user as any).claims.sub;
    const otherId = req.params.userId as string;
    try {
      const dmSchema = z.object({ content: z.string().min(1) });
      const input = dmSchema.parse(req.body);
      const msg = await storage.createDM(myId, otherId, input.content);
      res.status(201).json(msg);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/users", isAuthenticated, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    res.json(allUsers);
  });

  app.patch("/api/users/me", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const updated = await storage.updateUser(userId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/bestowal", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    let bestowal = await storage.getBestowal(userId);
    if (!bestowal) {
      bestowal = await storage.upsertBestowal(userId, "0.00");
    }
    res.json(bestowal);
  });

  app.post("/api/bestowal", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const { monthlyAmount, password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ message: "Password required to change bestowal amount" });
    }
    try {
      const bestowal = await storage.upsertBestowal(userId, monthlyAmount);
      res.json(bestowal);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/vibes", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const schema = z.object({ videoId: z.number(), isVibe: z.boolean() });
      const input = schema.parse(req.body);
      const vibe = await storage.toggleVibe(userId, input.videoId, input.isVibe);
      res.json(vibe);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/vibes/:videoId", async (req, res) => {
    const videoId = Number(req.params.videoId);
    const vibeData = await storage.getVideoVibes(videoId);
    res.json(vibeData);
  });

  app.post("/api/blocked-users", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const { blockedUserId } = req.body;
    await storage.blockUser(userId, blockedUserId);
    res.json({ success: true });
  });

  app.delete("/api/blocked-users/:blockedUserId", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const blockedUserId = String(req.params.blockedUserId);
    await storage.unblockUser(userId, blockedUserId);
    res.json({ success: true });
  });

  app.get("/api/blocked-users", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const blocked = await storage.getBlockedUsers(userId);
    res.json(blocked);
  });

  app.post("/api/shield-cases", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const shieldCase = await storage.createShieldCase({ ...req.body, userId });
      res.status(201).json(shieldCase);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/shield-cases", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const mine = req.query.mine === "true";
    const cases = await storage.getShieldCases(mine ? userId : undefined);
    res.json(cases);
  });

  app.patch("/api/shield-cases/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const cases = await storage.getShieldCases(userId);
      const caseId = Number(req.params.id);
      const ownsCase = cases.some(c => c.id === caseId);
      if (!ownsCase) return res.status(403).json({ message: "Not authorized to modify this case" });
      const updated = await storage.updateShieldCase(caseId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/shield-cases/:id/witness", isAuthenticated, async (req, res) => {
    await storage.witnessShieldCase(Number(req.params.id));
    res.json({ success: true });
  });

  // ── Governance ─────────────────────────────────────────────────────────────

  app.get("/api/proposals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const userTribeIds = await storage.getUserTribeIds(userId);
      const status = (req.query.status as string) || undefined;
      const scope = (req.query.scope as string) || undefined;
      let tribeId: number | undefined;
      if (req.query.tribeId) {
        tribeId = Number(req.query.tribeId);
        // Enforce membership: reject if user is not a member of the requested tribe
        if (!userTribeIds.includes(tribeId)) {
          return res.status(403).json({ message: "Not a member of this tribe" });
        }
      }
      const proposals = await storage.getProposals({ tribeId, status, scope, userTribeIds });
      // Enrich each proposal with the caller's vote for correct toggle behavior on list cards
      const myVotes = await storage.getUserVotesForProposals(userId, proposals.map((p: any) => p.id));
      const enriched = proposals.map((p: any) => ({ ...p, myVote: myVotes[p.id] || null }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.post("/api/proposals", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const input = insertProposalSchema.parse(req.body);
      // If tribe-scoped, require membership before allowing creation
      if (input.tribeId != null) {
        const memberTribeIds = await storage.getUserTribeIds(userId);
        if (!memberTribeIds.includes(input.tribeId)) {
          return res.status(403).json({ message: "You must be a member of this tribe to propose" });
        }
      }
      const proposal = await storage.createProposal({ ...input, proposerId: userId, status: "active" });

      // Fan out in-app notifications to all tribe members (excluding the proposer)
      if (proposal.tribeId != null) {
        const tribeMembers = await storage.getTribeMembers(proposal.tribeId);
        const tribe = await storage.getTribe(proposal.tribeId);
        const tribeName = tribe?.name || "your tribe";
        await Promise.all(
          tribeMembers
            .filter((m: any) => m.userId !== userId)
            .map((m: any) =>
              storage.createNotification({
                userId: m.userId,
                type: "new_proposal",
                tribeId: proposal.tribeId!,
                proposalId: proposal.id,
                title: `New proposal in ${tribeName}`,
                body: proposal.title,
              })
            )
        );
      }

      res.status(201).json(proposal);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/proposals/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const proposalId = Number(req.params.id);
    const canAccess = await storage.canUserAccessProposal(proposalId, userId);
    if (!canAccess) return res.status(404).json({ message: "Proposal not found" });
    const proposal = await storage.getProposal(proposalId);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    const myVote = await storage.getUserVoteOnProposal(proposal.id, userId);
    res.json({ ...proposal, myVote: myVote?.voteType || null });
  });

  app.post("/api/proposals/:id/vote", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const proposalId = Number(req.params.id);
    try {
      const canAccess = await storage.canUserAccessProposal(proposalId, userId);
      if (!canAccess) return res.status(404).json({ message: "Proposal not found" });
      const schema = z.object({ voteType: z.enum(["support", "nullify"]) });
      const { voteType } = schema.parse(req.body);
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) return res.status(404).json({ message: "Proposal not found" });
      if (proposal.status === "expired") return res.status(400).json({ message: "Cannot vote on an expired proposal" });
      if (proposal.status === "nullified") return res.status(400).json({ message: "Cannot vote on a nullified proposal" });
      await storage.upsertVote(proposalId, userId, voteType);
      const updated = await storage.getProposal(proposalId);
      const myVote = await storage.getUserVoteOnProposal(proposalId, userId);
      res.json({ ...updated, myVote: myVote?.voteType || null });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/proposals/:id/vote", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const proposalId = Number(req.params.id);
    const canAccess = await storage.canUserAccessProposal(proposalId, userId);
    if (!canAccess) return res.status(404).json({ message: "Proposal not found" });
    await storage.removeVote(proposalId, userId);
    const updated = await storage.getProposal(proposalId);
    res.json({ ...updated, myVote: null });
  });

  app.post("/api/proposals/:id/suggest", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const proposalId = Number(req.params.id);
    try {
      const canAccess = await storage.canUserAccessProposal(proposalId, userId);
      if (!canAccess) return res.status(404).json({ message: "Proposal not found" });
      const schema = z.object({
        suggestionType: z.enum(["add", "remove"]),
        content: z.string().min(1),
        effectAnalysis: z.string().optional(),
      });
      const input = schema.parse(req.body);
      const suggestion = await storage.addSuggestion({ ...input, proposalId, userId });
      res.status(201).json(suggestion);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/proposals/:id/fund", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const proposalId = Number(req.params.id);
    try {
      const canAccess = await storage.canUserAccessProposal(proposalId, userId);
      if (!canAccess) return res.status(404).json({ message: "Proposal not found" });
      const schema = z.object({ amount: z.string().regex(/^\d+(\.\d{1,2})?$/) });
      const { amount } = schema.parse(req.body);
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) return res.status(404).json({ message: "Proposal not found" });
      if (proposal.status === "nullified") return res.status(400).json({ message: "Cannot fund a nullified proposal" });
      if (proposal.status === "expired") return res.status(400).json({ message: "Cannot fund an expired proposal" });
      const bestowal = await storage.getBestowal(userId);
      const monthly = parseFloat(bestowal?.monthlyAmount || "0");
      // Cumulative check: sum all existing allocations by this user across all proposals
      const totalAllocated = await storage.getTotalAllocatedByUser(userId);
      const available = monthly - totalAllocated;
      if (parseFloat(amount) > available || available <= 0) {
        return res.status(400).json({ message: `Amount exceeds available bestowal commitment ($${available.toFixed(2)} remaining)` });
      }
      const allocation = await storage.addFundingAllocation(proposalId, userId, amount);
      res.status(201).json(allocation);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // ── Documents (Google Drive sync) ──────────────────────────────────────────

  app.get("/api/documents", async (req, res) => {
    const folderId = process.env.GOOGLE_DRIVE_DOCS_FOLDER_ID;
    if (!folderId) {
      return res.json({ documents: FALLBACK_DOCUMENTS, source: "fallback" });
    }
    try {
      const result = await listDriveFiles(folderId);
      const docs = ((result as any).files || []).map((f: any) => ({ ...f, isLive: true }));
      res.json({ documents: docs.length > 0 ? docs : FALLBACK_DOCUMENTS, source: docs.length > 0 ? "drive" : "fallback" });
    } catch (err) {
      console.error("[documents] Google Drive fetch failed, using fallback:", err);
      res.json({ documents: FALLBACK_DOCUMENTS, source: "fallback" });
    }
  });

  app.get("/api/documents/:fileId/content", async (req, res) => {
    const { fileId } = req.params;

    // Static fallback: only the dictionary has a bundled PDF asset
    if (fileId === "fallback-dictionary") {
      return res.redirect("/free-soul-living-dictionary.pdf");
    }

    // Any other fallback- ID has no static asset and Drive is not configured
    if (fileId.startsWith("fallback-")) {
      return res.status(404).json({ message: "Document not available until Google Drive is configured (GOOGLE_DRIVE_DOCS_FOLDER_ID)." });
    }

    // Drive is required for all real file IDs
    if (!process.env.GOOGLE_DRIVE_DOCS_FOLDER_ID) {
      return res.status(503).json({ message: "Document storage is not configured." });
    }

    // Validate file ID against the folder-scoped allowlist before proxying.
    // This prevents the connector from being used to serve arbitrary Drive files.
    const allowed = await getAllowedDriveIds();
    if (!allowed || !allowed.has(fileId)) {
      return res.status(403).json({ message: "Document not found in governance folder." });
    }

    try {
      const connectors = getUncachableGoogleDriveClient();

      // Fetch metadata to determine content type
      const metaRes = await connectors.proxy("google-drive", `/drive/v3/files/${fileId}?fields=mimeType,name`, { method: "GET" });
      const meta = await metaRes.json() as { mimeType: string; name: string };

      let buffer: ArrayBuffer;
      let contentType = "application/pdf";

      if ((meta.mimeType || "").includes("google-apps.document")) {
        // Google Doc → export as PDF
        const exportRes = await connectors.proxy("google-drive", `/drive/v3/files/${fileId}/export?mimeType=application/pdf`, { method: "GET" });
        buffer = await exportRes.arrayBuffer();
      } else {
        // Native file (PDF, etc.) — download media bytes
        const dlRes = await connectors.proxy("google-drive", `/drive/v3/files/${fileId}?alt=media`, { method: "GET" });
        buffer = await dlRes.arrayBuffer();
        contentType = meta.mimeType || "application/pdf";
      }

      const safeName = encodeURIComponent(meta.name || "document");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${safeName}.pdf"`);
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("[documents] Failed to fetch file content:", err);
      res.status(500).json({ message: "Failed to load document from Google Drive." });
    }
  });

  // ── Notifications ───────────────────────────────────────────────────────────

  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const notifs = await storage.getNotifications(userId);
    res.json(notifs);
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const count = await storage.getUnreadNotificationCount(userId);
    res.json({ count });
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    await storage.markNotificationRead(Number(req.params.id), userId);
    res.json({ success: true });
  });

  app.patch("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    await storage.markAllNotificationsRead(userId);
    res.json({ success: true });
  });

  app.patch("/api/notifications/read-tribe/:tribeId", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeId = Number(req.params.tribeId);
    await storage.markTribeNotificationsRead(userId, tribeId);
    res.json({ success: true });
  });

  return httpServer;
}
