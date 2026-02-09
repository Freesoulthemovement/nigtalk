import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth/routes";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { api } from "@shared/routes";
import { isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Setup Object Storage Routes (for uploads)
  registerObjectStorageRoutes(app);

  // API Routes
  
  // Tribes
  app.get(api.tribes.list.path, async (req, res) => {
    const tribes = await storage.getTribes();
    res.json(tribes);
  });

  app.post(api.tribes.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub; // From Replit Auth
    try {
      const input = api.tribes.create.input.parse(req.body);
      const tribe = await storage.createTribe({ ...input, createdBy: userId });
      res.status(201).json(tribe);
    } catch (error) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.tribes.get.path, async (req, res) => {
    const tribe = await storage.getTribe(Number(req.params.id));
    if (!tribe) return res.status(404).json({ message: "Tribe not found" });
    const members = await storage.getTribeMembers(tribe.id);
    res.json({ ...tribe, members });
  });

  app.post(api.tribes.join.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeId = Number(req.params.id);
    const member = await storage.joinTribe(userId, tribeId);
    res.json(member);
  });

  // Videos
  app.get(api.videos.list.path, async (req, res) => {
    const tribeId = req.query.tribeId ? Number(req.query.tribeId) : undefined;
    const videos = await storage.getVideos(tribeId);
    res.json(videos);
  });

  app.post(api.videos.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    try {
      const input = api.videos.create.input.parse(req.body);
      const video = await storage.createVideo({ ...input, userId });
      res.status(201).json(video);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Messages
  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages(Number(req.params.id));
    res.json(messages.reverse()); // Oldest first for chat
  });

  app.post(api.messages.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tribeId = Number(req.params.id);
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage({ ...input, userId, tribeId });
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}
