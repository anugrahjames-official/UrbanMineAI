# masterplan.md

## App Overview and Objectives

**App Name:** UrbanMineAI

**Overview:** UrbanMineAI is a Vertical SaaS and B2B marketplace platform designed to formalize and optimize the e-waste supply chain in Kerala, India, with a focus on recovering rare earth elements (REEs). It leverages Agentic AI to connect informal e-waste collectors with authorized recyclers and electronics manufacturers, addressing market inefficiencies like information asymmetry, value leakage, and compliance gaps. The platform uses AI for waste identification, grading, pricing, matching, and automated documentation, creating a seamless, transparent ecosystem that supports national priorities for sustainability and critical mineral sovereignty.

**Objectives:**
- **Primary:** Build a scalable startup that promotes sustainability through efficient e-waste recycling and REE recovery, driven by personal interest in tech innovation and environmental impact.
- **Secondary:** Serve as a high-scoring microproject for UCEST206, demonstrating innovation, market analysis, and IPR strategy.
- **Key Goals:** Achieve MVP traction in the Kerala Rare Earth Corridor, secure grants like KSUM's ₹2 Lakh Innovation Grant, and position for future funding from impact investors.
- **Why It Matters:** Solves real-world problems like 90% informal e-waste processing leading to environmental hazards and lost resources, while aligning with 2026 Union and Kerala Budgets for rare earth corridors and the "Silver Economy."

## Target Audience

UrbanMineAI is a multi-sided platform with segmented users:

1. **Supply Side (Sources):**
   - **Tier 1: "New Innings" Entrepreneurs** – Retired professionals (50+) via Kerala's scheme; trusted, experienced community managers for hyper-local collection.
   - **Tier 2: Informal Aggregators (Kabadiwalas)** – High-volume street-level collectors; motivated by fair pricing, instant payments, and ease of use.
   - **Tier 3: Institutional Generators** – IT parks (e.g., Technopark), schools, and government offices; need formal certificates and transparent disposal.

2. **Demand Side (Buyers):**
   - **Authorized Recyclers** (e.g., KMML) – Require consistent, pre-sorted high-grade feedstock for efficient operations.
   - **Electronics OEMs (Producers)** (e.g., Samsung, Apple) – Need EPR credits to meet 2026 recycling mandates.

**Persona Highlights:**
- **Raju the Aggregator:** 35-50, smartphone-savvy (WhatsApp/YouTube), focuses on cash flow and fair deals.
- **Sarah the Compliance Officer:** 30-40, corporate role, values traceability and audit-ready reports.

The platform prioritizes accessibility for low-tech users in Kerala, starting in districts like Ernakulam.

## Core Features and Functionality

For the MVP, focus on essential features to enable end-to-end transactions while keeping it lean:

- **AI Grading (Sorter Agent):** Mobile camera-based identification of e-waste components (e.g., PCBs, magnets) with REE/gold estimates; uses multimodal AI for instant valuation.
- **Dynamic Pricing:** Real-time rates linked to market data (via Metals.Dev API), ensuring transparency and fairness.
- **Negotiation and Deal-Making (Broker Agent):** Chat-based interface with Generative UI for simplified, vernacular negotiations; streams interactive components like deal cards.
- **Matching and Logistics:** Direct aggregator-to-recycler matching based on volume/material; demand-led "bounties" for specific REEs.
- **Compliance Automation (Compliance Officer):** Auto-generates EPR certificates (Form-6 PDFs) upon verified pickups, enabling credit trading.
- **Payments:** Instant settlements via Stripe (supporting UPI/cards).
- **Dashboards:** Dealer view for personal inventory/sales; recycler/OEM views for procurement, bidding, and analytics.
- **Core Workflow:** Dealer uploads photo → AI grades/prices → Negotiation/matching → Deal close → Payment/docs → EPR credit issuance.

These features address pain points like value blindness, compliance voids, and feedstock inconsistency, using Agentic AI for autonomous workflows.

## High-Level Technical Stack Recommendations

Aim for a zero-cost, serverless architecture to fit startup constraints and academic prototyping. Recommendations balance ease, scalability, and your sustainability focus:

- **Framework/UI:** Next.js (with React) for the core; enables Server Actions for backend logic in one codebase. Pros: Fast, SEO-friendly PWAs; auto-optimizes performance. Cons: Learning curve if new to it. Suggestion: Ideal for your PWA—unified frontend/backend reduces complexity.
- **AI/Agents:** Google Gemini (e.g., gemini-3-flash-preview) via Vercel AI SDK; handles multimodal image analysis, embeddings, and Generative UI. Pros: Free tier sufficient for MVP (1,500 requests/day), no training needed. Cons: Rate limits at scale—monitor and cache. Suggestion: Best for zero-shot grading; integrate with Zod for structured outputs.
- **Database/Storage:** Supabase (PostgreSQL with pgvector); for user data, transactions, vectors, and file storage (images/PDFs). Pros: Free tier, auto-scaling, built-in auth. Cons: Storage limits—optimize images. Suggestion: Perfect match for your needs; use for vector search to enhance AI without custom models.
- **Hosting/Deployment:** Vercel (Hobby tier); serverless for PWAs with edge functions. Pros: Free, seamless with Next.js. Cons: Build limits for large apps.
- **Integrations:** Metals.Dev for pricing, Stripe for payments, pdf-lib for docs. Pros: API-first, scalable. Suggestion: Start with these for MVP; add webhooks for real-time updates.
- **Other Tools:** TypeScript for type safety; shadcn/ui for components.

Overall Suggestion: Stick close to your doc's stack—it's cost-effective and MVP-ready. Alternatives like Firebase could simplify auth, but Supabase offers better vector support for AI.

## Conceptual Data Model

High-level entities and relationships (not a full ERD, but conceptual for planning):

- **Users:** Profiles with roles (Dealer, Recycler, OEM); fields like ID, email, location, tier (e.g., New Innings), trust score.
- **E-Waste Items:** Images, AI-generated metadata (category, subType, estimatedValue, REE content); linked to uploads.
- **Transactions:** Deals with status (pending, negotiated, closed); includes pricing, matching details, payment refs.
- **Compliance Docs:** PDFs with hashes; tied to transactions for EPR credits.
- **Vectors/Embeddings:** Stored for image similarity; references historical sales for calibration.
- **Relationships:** One-to-Many (User → Items/Transactions); Many-to-Many (Items → Components via AI grading).

Use relational structure (e.g., tables in Supabase) for queries like "find similar items" via pgvector. Anonymize sensitive data (e.g., dealer locations) for privacy.

## User Interface Design Principles

- **Simplicity and Accessibility:** Vernacular (Malayalam/English) support; single-tap flows for low-tech users (e.g., photo upload → instant quote).
- **Impressive Yet Intuitive:** Smooth animations for AI results (e.g., bounding boxes on camera overlay); dark mode; Generative UI for dynamic chat elements.
- **Responsive PWA:** Mobile-first for dealers (low-end Androids); desktop-friendly for recyclers (dashboards with charts).
- **Human-Centric:** Focus on "price per kg" for dealers (no eco-dashboards); traceability reports for OEMs.
- **Standards:** WCAG accessibility; progressive enhancement for offline use (e.g., queue uploads).
- **Wireframe Foundation:** Build on doc's concepts—Dealer Dashboard (inventory/chat), Camera Overlay (real-time analysis), Recycler Bidding (live bounties).

Aim for "wowing" evaluators/investors with blended chat/native UI, while ensuring 80% adoption ease for kabadiwalas.

## Security Considerations

- **Authentication:** Email-based for MVP (via Supabase); simple, cost-free.
- **Authorization:** Role-Based Access Control (RBAC) – Dealers view own data only; recyclers access aggregates/dashboards (use Supabase RLS).
- **Data Protection:** Encrypt sensitive fields (transactions, personal details) at rest; HTTPS for all; anonymize analytics.
- **Privacy:** GDPR-inspired for informal dealers (consent for data use); no unnecessary tracking.
- **Other:** Input validation against injections; rate limiting for AI APIs; audit logs for compliance docs.
- **Must-Haves:** Secure image uploads (no PII in photos); fraud checks via Stripe.

These build trust in the informal sector while scaling securely.

## Development Phases or Milestones

- **Phase 1: Setup & Core (Weeks 1-2):** Initialize Next.js/Supabase; implement auth and basic PWA skeleton. Milestone: Functional login/dashboard.
- **Phase 2: AI Integration (Weeks 3-4):** Build Sorter/Broker Agents with Gemini; bootstrap vector DB with open datasets. Milestone: End-to-end grading/negotiation flow.
- **Phase 3: Features & Integrations (Weeks 5-6):** Add pricing (Metals.Dev), payments (Stripe), compliance docs; test UI/UX. Milestone: Simulated pilot transaction.
- **Phase 4: Testing & Polish (Weeks 7-8):** Human-in-loop verification; scalability tests (e.g., 100 mock users); refine vernacular UI. Milestone: MVP ready for UCEST206 demo/KSUM grant application.
- **Phase 5: Launch & Iterate (Post-MVP):** Pilot in Ernakulam; gather feedback/data for improvements.

Total: 8 weeks for MVP, assuming 3-person team (CEO for prompts, CTO for dev, COO for data).

## Potential Challenges and Solutions

- **Data for AI:** No initial dataset. Solution: Use open e-waste datasets (e.g., Roboflow) for bootstrapping; collect via pilot users.
- **AI Accuracy:** Potential misgrading. Solution: Zero-shot prompting with guardrails; few-shot via vector retrieval; manual overrides in MVP.
- **Scalability:** Volume spikes (e.g., 1,000+ daily requests). Solution: Serverless auto-scaling; caching for pricing/AI; monitor free tiers.
- **User Adoption:** Trust issues with informal dealers. Solution: Grassroots onboarding via "New Innings" ambassadors; instant value (quotes/payments).
- **Costs:** Beyond free tiers. Solution: "Default Alive" model; use grants for marketing/legal.
- **Technical Hurdles:** Gemini implementation. Solution: Leverage Vercel SDK tutorials; test prompts iteratively.

## Future Expansion Possibilities

- **Geographic Scale:** Expand beyond Kerala to other rare earth corridors (Tamil Nadu, Andhra Pradesh).
- **Features:** Add logistics optimization (maps/routes), inventory SaaS for pro users (₹999/month), data monetization for smart cities.
- **Tech Upgrades:** Fine-tune AI with proprietary data; integrate blockchain for EPR traceability (UrbanMineDAO).
- **Monetization:** EPR trading fees, premium subscriptions; partnerships with OEMs for branded collection.
- **Impact:** Global "China-plus-one" supply chains; social features for "Silver Economy" entrepreneurs.