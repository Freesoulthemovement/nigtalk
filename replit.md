# NigTalk — Free Soul The Movement

## Overview
NigTalk is a sovereign community social media platform for the Free Soul Ecclesiastical Movement. It features TikTok-style vertical video feeds, tribal messaging, Bluetooth mesh Radio/Push-to-Talk, tribe management, Free Soul Coin (FSC) attention-based bestowal system, and a Community Standards onboarding screen.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (session-based)
- **Storage**: Replit Object Storage for media uploads

## Visual Design
- Deep dark navy/purple gradient background (222° 47% 5% → 265° 30% 7%)
- Glass-morphism cards with subtle borders (rgba blue/purple tints)
- Purple gradient accent (from-purple-600 to-indigo-600)
- Cyan accent for upload FAB and secondary highlights
- Outfit font for headings, Inter for body text
- "NIGTALK" gradient text branding, "Tune In. Speak Freely." tagline

## Key Features
1. **Community Standards Onboarding** — NIGTALK branding, 3 feature icons, Tribal Code bullet points, 2 checkboxes, gradient Continue button
2. **Explore Screen** — Tribes horizontal scroll cards, Frequencies pills with member counts, Sports category cards, Important Events, Blueprints link
3. **Stream Mode** — TikTok-style vertical video feed with category tabs (All/Tribes/Sports/Events/Nonprofits), engagement buttons
4. **Tribes** — Create/join tribes, group chat with real-time polling
5. **Radio/Push-to-Talk** — Bluetooth Mesh mode, Online/Mesh toggle, Channels (NigTalk/Random/Mental Health), My Tribes slots, Now Tuned live card, hold-to-talk bar
6. **Bestowal** — "Pay Attention! Creators Blessing.", date/period badge, 5 stat cards (Monthly Contribution, Creator Pool 90%, FSC, Creators Supported, Time Watched), How Bestowal Works rules, Supported Creators 0/100, Send Direct Gift, 7 Layers of Mutual Bestowal
7. **Library** — Governance documents: Free Soul Charter, Free Soul Living Dictionary (28+ searchable entries), Constitution, PMA Agreement, Trust Indenture (verified, versioned). Accessible from Settings → Official PMA Documents.
8. **Blueprints** — Separate educational content hub for community PDFs/videos of designs. Accessible from Explore and /blueprints route.
9. **Direct Messaging** — User-to-user DMs with conversation list
10. **Video Upload** — Category-tagged content publishing with type support (camera, photo, video, audio, blueprint)
11. **Profile** — User profile with stats, messages link, settings, logout
12. **Settings** — Edit Profile, Add Link, Add Ministry/Charity, Donation Tracker, Official PMA Documents, Change Profile Layout, Customize Algorithm
13. **Free Soul Flower Emblem** — SVG component with 8 purple petals and golden center, used as movement seal throughout app

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
server/
  routes.ts          — Express API route handlers
  storage.ts         — Database CRUD operations
  db.ts              — Database connection
  index.ts           — Server entry point
client/src/
  App.tsx            — Router with auth + onboarding flow
  index.css          — Global theme (navy/purple gradient, glass-card, stat-card, gradient-text)
  pages/
    landing.tsx      — Pre-login landing page with feature cards
    onboarding.tsx   — Community Standards with NIGTALK branding
    explore.tsx      — Tribes, Frequencies, Sports, Events, Blueprints + stream mode
    tribes.tsx       — Tribe list + create dialog
    tribe-detail.tsx — Tribe chat + member management
    radio.tsx        — Push-to-talk with Bluetooth Mesh mode
    bestowal.tsx     — FSC balance + 7 layers + supported creators
    library.tsx      — Governance documents + Living Dictionary
    blueprints.tsx   — Educational content hub (PDFs/designs)
    settings.tsx     — Profile settings and preferences
    messaging.tsx    — Direct messages
    upload.tsx       — Content upload with type support
    profile.tsx      — User profile with tabs
  components/
    nav-bar.tsx      — Bottom navigation (Explore, Radio, Upload, Bestowal, Profile)
    video-card.tsx   — Full-screen video player for stream mode
    free-soul-emblem.tsx — Free Soul Flower SVG emblem
  hooks/
    use-auth.ts      — Auth hook
    use-tribes.ts    — Tribe CRUD + messages hooks
    use-videos.ts    — Video CRUD hooks
```

## FSC (Free Soul Coin) Logic
- 1% of platform fee converted to FSC per user
- 90% of monthly contribution goes to Creator Pool
- 5% platform fee, 5% Needs Fund (community support pool)
- Self-bestowal cap: 5%, Max 100 creators/month
- Sessions count after 5 seconds, qualifying threshold 1% of attention
- Do NOT show FSC-to-dollar conversion on UI

## Support Contact
nigtalksupport@freesoulthemovement
