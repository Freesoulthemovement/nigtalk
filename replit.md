# NigTalk — Free Soul The Movement

## Overview
NigTalk is a social media platform for the Free Soul Ecclesiastical Movement. It combines TikTok-style vertical video feeds, Discord/Telegram-style tribal messaging, Radio/Push-to-Talk live communication, tribe management, Free Soul Coin (FSC) bestowal system (1 FSC = $100), and a Community Standards onboarding screen.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (session-based)
- **Storage**: Replit Object Storage for media uploads

## Key Features
1. **Community Standards Onboarding** — Checkboxes + Terms/Privacy before entering app
2. **Explore Screen** — Categories: Tribes, Frequencies, Sports, Blueprints, Random
3. **Stream Mode** — TikTok-style vertical video feed per category
4. **Tribes** — Create/join tribes, group chat with real-time polling
5. **Radio/Push-to-Talk** — Online/offline status, hold-to-broadcast button
6. **Bestowal** — FSC balance display, monthly bestowal adjustment (password-protected)
7. **Direct Messaging** — User-to-user DMs with conversation list
8. **Video Upload** — Category-tagged video publishing
9. **Profile** — User profile with stats and settings

## Database Schema
- `users` — Replit Auth managed (id, email, firstName, lastName, profileImageUrl)
- `tribes` — Community groups (name, description, category, createdBy)
- `tribe_members` — Membership (userId, tribeId, role, hasAcceptedTerms)
- `videos` — Content (userId, title, videoUrl, category, tribeId)
- `messages` — Chat (senderId, receiverId, tribeId, content, isRadio)
- `user_bestowals` — Bestowal tracking (userId, monthlyAmount, fscBalance)
- `comments` — Video comments
- `sessions` — Auth sessions

## File Structure
```
shared/
  schema.ts          — Drizzle schema, types, insert schemas
  routes.ts          — API route definitions with Zod validation
  models/auth.ts     — Auth table definitions
server/
  routes.ts          — Express API route handlers
  storage.ts         — Database CRUD operations
  db.ts              — Database connection
  index.ts           — Server entry point
client/src/
  App.tsx            — Router with auth + onboarding flow
  pages/
    landing.tsx      — Pre-login landing page
    onboarding.tsx   — Community Standards checkboxes
    explore.tsx      — Category grid + stream mode
    tribes.tsx       — Tribe list + create
    tribe-detail.tsx — Tribe chat + member management
    radio.tsx        — Push-to-talk interface
    bestowal.tsx     — FSC balance + monthly bestowal settings
    messaging.tsx    — Direct messages
    upload.tsx       — Video upload with category selection
    profile.tsx      — User profile
  components/
    nav-bar.tsx      — Bottom navigation (Explore, Radio, Upload, Bestowal, Profile)
    video-card.tsx   — Full-screen video player for stream mode
  hooks/
    use-auth.ts      — Auth hook
    use-tribes.ts    — Tribe CRUD + messages hooks
    use-videos.ts    — Video CRUD hooks
```

## FSC (Free Soul Coin) Logic
- 1 FSC = $100
- 1% of platform contributions converted to FSC
- Platform privately matches 1/5 of needs contributions
- FSC will eventually be land-backed

## Support Contact
nigtalksupport@freesoulthemovement
