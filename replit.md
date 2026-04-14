# NigTalk — Free Soul The Movement

## Overview
NigTalk is a sovereign community social media platform for the Free Soul Ecclesiastical Movement. It features TikTok-style vertical video feeds, tribal messaging, Bluetooth mesh Radio/Push-to-Talk, tribe management, Free Soul Coin (FSC) attention-based bestowal system, Community Standards onboarding, Free Soul Living Dictionary (88 entries), Tribal Shield interface, and Vibe/Not-the-Vibe interaction system.

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
2. **Explore Screen** — Tribes horizontal scroll (with join type badge), Frequencies (Sovereign Tech, Food & Agriculture, Energy Freedom, Music & Dance, Comedy), Sports cards, Tribal Combat section, Important Events, Blueprints hub
3. **Stream Mode** — TikTok-style vertical video feed with expanded category tabs (All/Tribes/Sports/Tribal Combat/Frequencies/Music & Dance/Comedy/Events/Nonprofits)
4. **Tribes** — Create/join tribes with open/approval join type option, group chat with real-time polling
5. **Radio/Push-to-Talk** — Bluetooth Mesh mode, Online/Mesh toggle, broadcast notifications with 1hr mute cap, long press PTT (3s) for schedule/record, swap tribe slots, audio/video broadcast mode toggle
6. **Bestowal** — "Pay Attention! Creators Blessing.", platform sustenance (not "platform fee"), FSC Blueprint Proof-of-Work section, direct gift selection with search, ban/block users from bestowal, 7 Layers of Mutual Bestowal
7. **Library** — 3 tabs: Documents (Charter/Constitution/PMA/Trust dated 2025-08-16), Dictionary (88 entries dated 2025-10-16, entries 0-88 with Official + True definitions), Tribal Shield (OCR scan, charge selection, affidavit generation, 30-day cure countdown, default confirmation, Wall of Truth victory feed with witness function)
8. **Blueprints** — Separate educational content hub for community PDFs/videos of designs
9. **Direct Messaging** — User-to-user DMs with conversation list
10. **Video Upload** — Category-tagged content with location field, hashtags input, tribe selection for tribe category, blueprint tagging
11. **Content Interactions** — Vibe (green wave) / Not the Vibe (red wave-canceled) replacing likes, Gift button, location/hashtag display
12. **Profile** — User profile with stats, messages link, settings, logout
13. **Settings** — Edit Profile (API-connected), Add Link, Add Ministry/Charity, Donation Tracker (links to /bestowal), Profile Layout Mode (grid/list/gallery), Customize Algorithm (6 sliders with minimums)
14. **Free Soul Flower Emblem** — SVG component with 8 purple petals and golden center

## Database Schema
- `users` — Replit Auth managed (id, email, firstName, lastName, profileImageUrl)
- `tribes` — Community groups (name, description, category, joinType [open/approval], createdBy)
- `tribe_members` — Membership (userId, tribeId, role, hasAcceptedTerms)
- `videos` — Content (userId, title, videoUrl, category, tribeId, location, hashtags, linkedBlueprintId)
- `messages` — Chat (senderId, receiverId, tribeId, content, isRadio)
- `user_bestowals` — Bestowal tracking (userId, monthlyAmount, fscBalance)
- `comments` — Video comments
- `vibes` — Vibe/Not-the-Vibe interactions (userId, videoId, isVibe)
- `blocked_users` — User blocking (userId, blockedUserId)
- `tribal_shield_cases` — Shield cases (userId, agentName, charge, claimAmount, affidavitGenerated, cureDeadline, defaultConfirmed, witnessCount, status)
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
    landing.tsx      — Pre-login landing page
    onboarding.tsx   — Community Standards with NIGTALK branding
    explore.tsx      — Tribes, Frequencies, Sports, Tribal Combat, Events, Blueprints + stream mode
    tribes.tsx       — Tribe list + create dialog
    tribe-detail.tsx — Tribe chat + member management
    radio.tsx        — Push-to-talk with Bluetooth Mesh, notifications, schedule, video broadcast
    bestowal.tsx     — FSC balance, platform sustenance, blueprint PoW, gift/block
    library.tsx      — Documents + Living Dictionary (88 entries) + Tribal Shield
    blueprints.tsx   — Educational content hub
    settings.tsx     — Profile settings and preferences
    messaging.tsx    — Direct messages
    upload.tsx       — Content upload with location, hashtags, tribe selection, blueprint tagging
    profile.tsx      — User profile with tabs
  components/
    nav-bar.tsx      — Bottom navigation
    video-card.tsx   — Full-screen video with Vibe/Not-the-Vibe system
    free-soul-emblem.tsx — Free Soul Flower SVG emblem
  hooks/
    use-auth.ts      — Auth hook
    use-tribes.ts    — Tribe CRUD + messages hooks
    use-videos.ts    — Video CRUD hooks
```

## FSC (Free Soul Coin) Logic
- 1% of platform sustenance converted to FSC per user
- 90% of monthly contribution goes to Creator Pool
- 5% platform sustenance, 5% Needs Fund (community support pool)
- Self-bestowal cap: 5%, Max 100 creators/month
- Sessions count after 5 seconds, qualifying threshold 1% of attention
- Do NOT show FSC-to-dollar conversion on UI
- Blueprint Proof-of-Work: FSC earned from blueprint engagement/views

## Important Notes
- Platform fee is called "platform sustenance" (never "platform fee")
- Food Sovereignty renamed to "Food & Agriculture"
- Dictionary dates: 2025-10-16, all other documents: 2025-08-16
- Vibe system replaces like/repost (wave = Vibe, wave-canceled = Not the Vibe)

## Support Contact
nigtalksupport@freesoulthemovement
