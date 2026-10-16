# Crinoid Social — Frontend Composer Module

Crinoid Social is a modern social media management SaaS platform built with **React 19**, **TypeScript**, and **Vite**.

This phase delivers **ONLY the frontend Composer module**, a **minimal Home navigation hub**, **Brand context** (with the Organization concept completely removed), and a **clean dummy login flow**.

---

## 🚀 Quick Start & Run Instructions

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Development Server
Run the local dev server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build & Type Check
```bash
npm run build
```
Builds the production bundle into `/dist` with full TypeScript type validation.

---

## 🔑 Development Dummy Login Credentials

The authentication screen runs entirely on the frontend with pre-configured dummy credentials and one-click quick-fill buttons:

| Name | Role | Email | Password |
|---|---|---|---|
| **Alex Morgan** | Social Lead | `creator@crinoid.social` | `crinoid2025` |
| **Priya Sharma** | Content Creator | `priya@crinoid.social` | `crinoid2025` |
| **Marcus Vance** | Approver | `approver@crinoid.social` | `crinoid2025` |

> **Login Flow**: Upon entering valid dummy credentials, the user is navigated **directly to the Publish Composer** (`/composer`), bypassing any onboarding steps.

---

## 📐 Architecture & Scope Verification

### 1. Brand Hierarchy (Organization Completely Removed)
Per product instructions, the legacy hierarchy (`Organization -> Brands -> Social Accounts -> Users`) has been replaced with:
$$\text{Brands} \longrightarrow \text{Brand Users}$$
- **Brands**: `Crinoid Tech` (primary), `Nexus Lifestyle`, and `Horizon Studio`.
- **Brand Users**: Assigned directly to their respective brand.
- **Brand Switcher**: Topbar allows switching active brand context and social accounts at any time.

### 2. Home Page Navigation (Verified from `SMM Product Full Modules.pdf`)
The Home navigation hub and sidebar display the exact headers and feature counts verified from the PDF:
- 🏠 **Home** (Overview Hub)
- 🚀 **PUBLISH** (**5 features**): `Composer` (*Active*), `Calendar`, `Posts`, `Content Library`, `Approval`
- 💬 **ENGAGE** (**6 features**): `Inbox`, `Comments`, `Messages`, `Mentions`, `Reviews`, `Saved Replies`
- 👂 **LISTEN** (**7 features**): `Overview`, `Brand Monitoring`, `Keywords`, `Hashtags`, `Competitors`, `Trends`, `Alerts`
- 📊 **ANALYTICS** (**6 features**): `Overview`, `Publishing`, `Engagement`, `Listening`, `Audience`, `Reports`
- 🏢 **WORKSPACE** (**4 features**): `Social Accounts`, `Team`, `Clients`, `Settings`

*Total sub-features: 28 features across 5 operational modules. Other modules remain navigation placeholders reserved for future phases.*

### 3. Composer Module (`PUBLISH — Module Features.pdf`)
- **Approved Channels (5 Platforms)**: Instagram, Facebook, LinkedIn, TikTok, YouTube. *(X/Twitter and WhatsApp excluded)*.
- **Content Variations**: Common post editor + dedicated tabbed variant editors for each selected platform.
- **Platform-Specific Fields**:
  - *YouTube*: Video Title (required), Description, Thumbnail selector.
  - *TikTok*: Short-form vertical video (required), audio sound indicator.
  - *Instagram*: First comment, hashtag helpers, media carousel ordering.
  - *Facebook & LinkedIn*: Professional copy, link attachment preview card.
- **Live Native-Style Previews**: Real-time rendering for all 5 platforms with hashtag/mention formatting, carousel slide navigation, text truncation ("...more"), and validation warnings.
- **Publishing Actions (Mock Frontend Interactions)**:
  - `Save Draft`: Persists to `localStorage` with autosave timestamp.
  - `Submit for Approval`: Assigns reviewer from Brand Users with review note.
  - `Schedule`: Date/time/timezone modal with local scheduled state.
  - `Publish Now`: Runs full validation checklist with simulated multi-channel publishing animation.

---

## 🛡️ Limitations & Next Steps
- **Frontend Mock Only**: No live social media OAuth or backend databases are connected.
- **Client Review Gate**: Next modules (`Calendar`, `Posts`, `Content Library`, `Approval`, etc.) will only be initiated after explicit client review and sign-off on the Composer.
