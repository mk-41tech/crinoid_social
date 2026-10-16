# Crinoid Social — Product Requirements & Architectural Record

## 1. Specification Baseline & Documents Tracing

### A. Document 1: `SMM Product Full Modules.pdf`
- **Module Structure**:
  - `Home`: 0 (Overview)
  - `PUBLISH`: 5 sub-features (`Composer`, `Calendar`, `Posts`, `Content Library`, `Approval`)
  - `ENGAGE`: 6 sub-features (`Inbox`, `Comments`, `Messages`, `Mentions`, `Reviews`, `Saved Replies`)
  - `LISTEN`: 7 sub-features (`Overview`, `Brand Monitoring`, `Keywords`, `Hashtags`, `Competitors`, `Trends`, `Alerts`)
  - `ANALYTICS`: 6 sub-features (`Overview`, `Publishing`, `Engagement`, `Listening`, `Audience`, `Reports`)
  - `WORKSPACE`: 4 sub-features (`Social Accounts`, `Team`, `Clients`, `Settings`)
- **Total Operational Sub-Features**: **28 sub-items**.
- **Scope Rule**: Only `Publish -> Composer` is active in Phase 1. All other 27 sub-items are represented as clean navigation placeholders in Home and the sidebar.

### B. Document 2: `PUBLISH — Module Features.pdf`
- **Approved Channel Scope**:
  - Instagram, Facebook, LinkedIn, TikTok, YouTube.
  - Excluded: X/Twitter and WhatsApp.
- **Composer Functional Requirements**:
  1. *Channel Selector*: Multi-select chips with brand account indicators.
  2. *Content Editor*:
     - Caption/text editor.
     - Character counter and platform limit enforcement.
     - Categorized emoji picker.
     - Hashtag and mention insertion tools.
     - URL insertion & Link attachment preview card.
     - Image & video upload with preview.
     - Carousel ordering (reorder slides left/right, delete slide).
     - Alt text modal for accessibility.
     - Video thumbnail selector for YouTube and TikTok.
     - First comment field where supported (Instagram, Facebook, LinkedIn).
     - Autosave with visible timestamp.
  3. *Platform-Specific Customizations*:
     - Common post fallback.
     - Platform variant tab switches without overwriting other variants.
     - YouTube required title (100 char limit).
  4. *Live Previews*:
     - Native-style mockup for all 5 platforms.
     - Formatted hashtags and mentions.
     - Truncated text ("...more" / "less").
     - Carousel controls.
     - Approximate preview disclaimer badge.
  5. *Publishing Actions*:
     - Save Draft (Local storage persistence).
     - Submit for Approval (Brand user reviewer assignment).
     - Schedule (Date, time, timezone selection).
     - Publish Now (Validation + simulated progress modal).
     - *Excluded*: Queue publishing / SmartQ.

---

## 2. Architectural Decisions

1. **Organization Layer Removal**:
   - The hierarchy `Organization -> Brands -> Social Accounts -> Users` is removed.
   - Simplified to: `Brands -> Brand Users`.
   - Brand Switcher toggles brand context directly in the topbar.

2. **Frontend-Only Mock Interactions**:
   - LocalStorage is used for draft state persistence.
   - No external OAuth or social network credentials required.
   - Clear indicators that publishing and scheduling actions are simulations.

3. **Client Review Gate**:
   - No development of Calendar, Posts, Content Library, Approval, Engage, Listen, Analytics, or Workspace will commence until the Composer module is reviewed and approved by the client.
