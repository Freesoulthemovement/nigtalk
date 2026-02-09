import { db } from "./db";
import { users } from "@shared/schema";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth";

async function seed() {
  console.log("Seeding database...");

  // Create System User
  // Note: We use a fixed ID for the system user so we don't duplicate it if we run seed multiple times
  // ideally, but upsertUser handles conflicts on ID.
  const systemUser = await authStorage.upsertUser({
    id: "system",
    email: "system@nigtalk.app",
    firstName: "System",
    lastName: "Admin",
  });
  console.log("System user created:", systemUser.id);

  // Check if tribe exists
  const existingTribes = await storage.getTribes();
  if (existingTribes.length === 0) {
    // Create Tribe
    const tribe = await storage.createTribe({
      name: "The Free Soul Movement",
      description: "Official tribe for the Free Soul Ecclesiastical Movement.",
      createdBy: systemUser.id,
    });
    console.log("Tribe created:", tribe.name);

    // Create Welcome Message
    await storage.createMessage({
      tribeId: tribe.id,
      userId: systemUser.id,
      content: "Welcome to the tribe! Be kind and bestowed.",
    });
    console.log("Welcome message created.");
  } else {
    console.log("Tribes already exist, skipping tribe creation.");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
