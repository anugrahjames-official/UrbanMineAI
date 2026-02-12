# Product Requirements Document (PRD) for UrbanMineAI

## 1. Document Information
- **Product Name:** UrbanMineAI
- **Version:** 1.0 (MVP)
- **Date:** February 10, 2026
- **Author:** Anugrah (Developer/Founder), with input from CTO consultation
- **Stakeholders:** Academic evaluators (UCEST206), Kerala Startup Mission (KSUM), potential investors (e.g., Aavishkaar), end-users (informal collectors, recyclers, OEMs)
- **Purpose of PRD:** This document outlines the detailed requirements for building UrbanMineAI, a platform leveraging Agentic AI to formalize the e-waste supply chain. It serves as a blueprint for development, ensuring alignment with startup goals in sustainability and tech innovation, while supporting academic objectives under the KTU 2024 Scheme. Based on the strategic blueprint provided in `UrbanMineAI.docx`, `materplan.md`, and `design.json`.

## 2. Executive Summary
UrbanMineAI is a Vertical SaaS and B2B marketplace aggregator designed to bridge the informal e-waste collection network (controlling 90% of India's e-waste) with formal recyclers and electronics manufacturers. By using Agentic AI for autonomous waste grading, pricing, matching, and compliance, the platform addresses structural market failures: value leakage from unidentified rare earth elements (REEs), compliance voids under Extended Producer Responsibility (EPR) regulations, and feedstock inconsistencies for recyclers.

**Key Value Proposition:**
- **For Suppliers:** Instant, fair valuation and payments, unlocking "hidden" REE value.
- **For Buyers:** Consistent, compliant feedstock and EPR credits.
- **Broader Impact:** Supports India's 2026 Union Budget priorities for rare earth corridors (₹42,000 Crore investment in Kerala) and the "Silver Economy," reducing environmental toxicity and promoting circular economy.

**Business Model:** Transaction commissions (10% on GMV), EPR credit fees (15%), future SaaS subscriptions (₹999/month for pro features) and data monetization.
**MVP Scope:** Pilot in Ernakulam district, targeting 50 dealers and 2,500 tonnes of e-waste in Year 1, with zero fixed costs via serverless stack.
**Success Metrics:** 50 transactions/month for break-even; 5% market share in Kerala's e-waste aggregation (₹20 Crores GMV potential); high UCEST206 scores in innovation and viability.

## 3. Problem Statement and Market Opportunity
### 3.1 Problem Statement
India generates 1.75 million metric tonnes of e-waste annually (growing 30% YoY), but 90% is handled informally, leading to:
- **Value Blindness:** Collectors sell high-value REE-rich components (e.g., Neodymium magnets) as scrap, losing revenue.
- **Compliance Paradox:** OEMs need EPR credits but can't source from undocumented informal chains.
- **Feedstock Inefficiency:** Formal recyclers (e.g., KMML) underutilize plants due to unsorted, inconsistent supply.

Validated via empathy mapping and interviews: Dealers prioritize "price per kg and immediate payment," not environmental metrics.

### 3.2 Market Analysis
- **TAM:** Indian e-waste market at $1.66B (2023), projected to $5.2B by 2032 (CAGR 13.52%).
- **SAM:** Kerala Rare Earth Ecosystem: ₹42,000 Crore investments; feedstock aggregation market ~₹500 Crores annually.
- **SOM:** 5% of Kerala's e-waste flow (2,500 tonnes/Year 1) = ₹20 Crores GMV.
- **Growth Drivers:** 2026 Budgets for rare earth corridors in Kerala, Tamil Nadu, etc.; EV/defense demand for 6,000 tonnes REE magnets annually.
- **Competitive Landscape:**
  | Competitor | Model | Strengths | Weaknesses | UrbanMineAI Edge |
  |-------------|-------|-----------|------------|------------------|
  | Attero/Recykal | Full-stack EPR | Corporate ties, capacity | Weak informal links | AI-first "first mile" aggregation |
  | Local Scrap Networks | Informal brokers | Instant cash, relationships | No compliance | Formal premiums via EPR |
  | Generic Pickup Apps | B2C household | User-friendly | Low volume, no REE focus | B2B vertical, high-value transactions |

- **SWOT:**
  - **Strengths:** AI grading, asset-light model, "New Innings" integration.
  - **Weaknesses:** Initial AI data hurdle, informal partner reliability.
  - **Opportunities:** Regulatory tailwinds, global REE supply shifts.
  - **Threats:** Commodity price volatility, data privacy risks.

## 4. Objectives and Success Criteria
### 4.1 Business Objectives
- Secure KSUM Innovation Grant (₹2 Lakhs) for MVP.
- Achieve ₹5 Lakhs revenue in Year 1 via commissions/grants.
- Scale to ₹1.5 Crores by Year 3 with statewide coverage.
- Social Impact: Employ 100+ "New Innings" seniors; recover 500kg Neodymium annually.

### 4.2 Product Objectives
- MVP: Functional PWA with AI agents, integrations, and compliance.
- User Adoption: 80% retention for pilot dealers via intuitive UX.
- Technical: Zero downtime, handle 1,000 daily requests.

### 4.3 KPIs
- **Acquisition:** 50 onboarded dealers in Phase 1.
- **Engagement:** 5 transactions/dealer/month.
- **Financial:** Break-even at 50 transactions/month (₹200 commission avg.).
- **Academic:** "Excellent" in UCEST206 rubrics (e.g., Innovation Originality).

## 5. Target Users and Personas
### 5.1 User Segments
- **Supply:** "New Innings" (trusted franchises), Kabadiwalas (volume-driven), Institutions (compliance-focused).
- **Demand:** Recyclers (feedstock needs), OEMs (EPR credits).

### 5.2 Personas
- **Raju the Aggregator:** Male, 35-50, Kochi outskirts; goals: Maximize cash; frustrations: Price fluctuations; tech: WhatsApp-savvy.
- **Sarah the Compliance Officer:** Female, 30-40, Technopark; goals: Meet EPR targets; frustrations: Informal opacity; tech: Dashboard-preferring.

**Requirements:** Vernacular support (Malayalam), mobile-first for 80% users.

## 6. Functional Requirements
### 6.1 Core Features (MVP)
Prioritized using MoSCoW.

#### Must-Haves:
1.  **User Onboarding/Authentication:**
    -   Email-based signup/login (Supabase Auth).
    -   Role assignment (Dealer, Recycler, OEM).
    -   Profile setup: Location, tier (e.g., New Innings verification).

2.  **AI Waste Grading (Sorter Agent):**
    -   Mobile camera upload for e-waste photos.
    -   Multimodal analysis via Gemini: Identify components (PCB, HDD, magnets), estimate REE/content/value.
    -   Output: Structured JSON (category, subType, estimatedValue).
    -   Vector search for similarity (pgvector on bootstrapped dataset).

3.  **Dynamic Pricing:**
    -   Integrate Metals.Dev API for real-time LME-linked rates.
    -   Adjust for REE premiums; display "Live Rate Card."

4.  **Negotiation (Broker Agent):**
    -   Chat interface with Generative UI (Vercel AI SDK).
    -   AI negotiates based on LME/offer; streams interactive components (e.g., Deal Card).

5.  **Matching and Bounties:**
    -   Algorithmic direct matching by volume/type.
    -   Recyclers post bounties (e.g., "500kg Neodymium"); alerts to suppliers.

6.  **Payments:**
    -   Instant via Stripe (UPI support).
    -   10% commission deduction.

7.  **Compliance (Compliance Officer):**
    -   Auto-generate Form-6/EPR PDFs (pdf-lib) post-deal.
    -   Hash for verifiability; EPR credit trading with 15% fee.

8.  **Dashboards:**
    -   Dealer: Inventory, sales history, chat.
    -   Recycler: Bidding, procurement analytics.
    -   OEM: EPR reports.

#### Should-Haves:
-   Offline queuing for uploads (PWA service workers).
-   Basic analytics (e.g., price trends).

#### Could-Haves:
-   Gamification (badges for dealers) aligned with "New Innings".
-   Inventory management SaaS preview.

#### Won't-Haves (for MVP):
-   Full logistics routing; blockchain DAO.

### 6.2 Non-Functional Requirements
-   **Performance:** <2s for AI grading; handle 1,000 users/day.
-   **Scalability:** Auto-scale via Vercel/Supabase; monitor for 10,000 deals/day future.
-   **Availability:** 99.9% uptime.
-   **Accessibility:** WCAG 2.1; vernacular fonts (Inter/Malayalam).
-   **Compatibility:** Android 8+ (low-end); modern browsers.

## 7. Technical Requirements
### 7.1 Architecture
-   **Type:** Serverless PWA (Progressive Web App).
-   **Stack:**
    -   **Frontend/Backend:** Next.js 16 (App Router, TypeScript), React 19.
    -   **UI Library:** shadcn/ui; PWA via next-pwa.
    -   **AI:** Vercel AI SDK 6.0, Google Gemini (gemini-3-flash-preview) – no training; zero-shot prompting with few-shot via vectors.
    -   **Database:** Supabase (PostgreSQL, pgvector for embeddings).
    -   **Hosting:** Vercel Hobby (free).
    -   **Integrations:** Metals.Dev (pricing), Stripe (payments), pdf-lib (docs).

-   **Data Flow:** User photo → Server Action → Gemini analysis → Vector query → Pricing/matching → PDF generation.

### 7.2 Data Model
-   **Tables:**
    -   `Users`: id, email, role, location, tier.
    -   `Items`: id, user_id, image_url, metadata (JSON from AI), vector_embedding.
    -   `Transactions`: id, supplier_id, buyer_id, item_ids, price, status, payment_ref.
    -   `Docs`: id, transaction_id, pdf_url, hash.
-   **Indexes:** HNSW on vectors for fast similarity search.

### 7.3 Security
-   **Auth:** Email (no OTP for cost).
-   **RBAC:** RLS in Supabase (dealers own-data only).
-   **Encryption:** Sensitive fields (transactions) at rest.
-   **Compliance:** GDPR-like; NDAs for trade secrets (AI dataset).

## 8. UI/UX Requirements
Based on `design.json` ("Eco-Futurism"):

-   **Design Aesthetic:** "Eco-Futurism / High-Tech Sustainability".
    -   **Primary Color:** Electric Green (`#19e66b`) for high-impact actions (e.g., "Scan Now", "Accept Deal").
    -   **Backgrounds:** Deep Green/Black (`#112117`) for OLED efficiency and "premium tech" feel.
    -   **Typography:** `Inter` for clean readability; `Material Icons` for universal symbols.
-   **Key Principles:**
    -   **Mobile-First:** Navigation via fixed bottom bar; large touch targets (>44px).
    -   **Glassmorphism:** Use translucent panels (`rgba(26, 47, 35, 0.7)`) for overlays to maintain context.
    -   **Generative UI:** Chat interfaces should feel dynamic, streaming custom UI components (e.g., interactive "Deal Cards") rather than just text.
-   **Key Screens:**
    -   **Login/Dashboard:** Vernacular toggle prominent.
    -   **Camera Overlay:** Real-time bounding boxes with AI confidence scores (simulated).
    -   **Chat Negotiation:** WhatsApp-style interface but richer.
    -   **Bidding Interface:** Live ticker style for prices.
-   **Wireframes:** Reference Appendix C in documentation.
-   **Testing:** Usability with 10 kabadiwalas; A/B testing for vernacular phrasing.

## 9. Intellectual Property Strategy
-   **Patent:** Provisional for "System for Non-Invasive Spectrographic Estimation" (focus on technical effect to bypass Section 3(k)).
-   **Copyright:** Source Code, GUI Design.
-   **Trade Secrets:** AI training dataset (50,000+ proprietary images).
-   **Trademark:** "UrbanMineAI" in Classes 9 (Software) and 35 (Business Management).

## 10. Development Plan
Based on `materplan.md` (8-week timeline):

-   **Phase 1: Setup & Core (Weeks 1-2):**
    -   Initialize Next.js 16/Supabase project.
    -   Implement Authentication (RBAC) and basic PWA shell.
    -   **Milestone:** Functional Login and Dashboard skeleton.

-   **Phase 2: AI Integration (Weeks 3-4):**
    -   Build Sorter Agent (Vision API) and Broker Agent (Chat UI).
    -   Bootstrap Vector DB with open datasets (Roboflow).
    -   **Milestone:** End-to-end grading and negotiation flow prototyped.

-   **Phase 3: Features & Integrations (Weeks 5-6):**
    -   Integrate Metals.Dev (Pricing) and Stripe (Payments).
    -   Implement Compliance Doc generation (PDFs).
    -   **Milestone:** Simulated end-to-end transaction pilot.

-   **Phase 4: Testing & Polish (Weeks 7-8):**
    -   Human-in-the-loop verification trials.
    -   Scalability load testing (100 mock concurrent users).
    -   Refine Vernacular UI based on pilot feedback.
    -   **Milestone:** MVP ready for UCEST206 demo and KSUM grant application.

-   **Phase 5: Launch & Iterate (Post-MVP):**
    -   Live pilot in Ernakulam district.
    -   Data collection for proprietary model fine-tuning.

## 11. Risks and Mitigations
-   **AI Accuracy:** Mitigate with guardrails, open datasets, and manual overrides in MVP.
-   **Data Privacy:** Strict RLS enforcement and encryption.
-   **Scalability:** Serverless architecture with auto-scaling; monitor free tier limits.
-   **Adoption:** Leverage "New Innings" ambassadors for community trust building.
-   **Costs:** "Default Alive" model using free tiers; secure grants early.

## 12. Appendices
-   **Market Data:** From UrbanMineAI.docx Appendix A.
-   **Architecture Diagrams:** As in Appendix B.
-   **Code Snippets:** Reference implementation guidelines.
-   **Works Cited:** As in original documentation.
