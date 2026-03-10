import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth/routes";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { insertTribeSchema, insertVideoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // Tribes
  app.get("/api/tribes", async (req, res) => {
    const tribes = await storage.getTribes();
    res.json(tribes);
  });

  app.post("/api/tribes", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const input = insertTribeSchema.parse(req.body);
      const tribe = await storage.createTribe({ ...input, createdBy: userId });
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

  app.post("/api/tribes/:id/join", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeId = Number(req.params.id);
    const member = await storage.joinTribe(userId, tribeId);
    res.json(member);
  });

  // Videos
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

  // Tribe Messages
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

  // Direct Messages
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

  // Users list (for DM user search)
  app.get("/api/users", isAuthenticated, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    res.json(allUsers);
  });

  // Bestowal
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

  return httpServer;
}
