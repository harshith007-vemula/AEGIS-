# AEGIS AI: Autonomous Emergency & Intelligent Governance System
> Tagline: "AI That Thinks. Plans. Acts."

AEGIS AI is a next-generation crisis governance platform designed for governments, NGOs, emergency dispatchers, and hospitals. Using a dark-mode cybernetic "AI Operating System" dashboard, it coordinates **9 specialized agents** powered by the Gemini API to analyze, plan, and automate disaster response.

---

## 🛠️ System Architecture

AEGIS is built using a modern monorepo design:
- **Frontend**: Next.js App Router (TypeScript, Tailwind CSS, Framer Motion, Leaflet maps, Chart.js).
- **Backend**: Express.js (TypeScript, REST APIs, JSON Web Tokens, PDFKit report exports).
- **Orchestrator**: Multi-Agent swarming engine running sequential analysis (Coordinator, Vision, Research, Planning, Risk, Voice, Communication, Automation, Memory).
- **Data Layers**: Supabase PostgreSQL client with an adaptive local stateful fallback (loaded with mock ambulances, hospitals, and resource registries).

---

## 📦 Getting Started

### 1. Environment Configurations

Create a `.env` file in the `backend` folder (or edit the root variables) and configure keys:
```env
PORT=5000
JWT_SECRET=aegis_jwt_secret_token_123
GEMINI_API_KEY=your_gemini_api_key

# Optional Supabase (If blank, local stateful database fallback is activated)
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### 2. Local Installation & Run

Open two separate terminals and launch:

**Terminal 1: Express API Backend Gateway**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2: Next.js Frontend Client**
```bash
cd frontend
npm install
npm run dev
```

The application will run at:
- Frontend Dashboard: `http://localhost:3000`
- Backend API Endpoint: `http://localhost:5000`

---

## 🔐 Operator Login Credentials

To bypass database integrations during testing or evaluation:
- **Email ID**: `admin@aegis.ai`
- **Password**: `admin123`

---

## 🐳 Running with Docker Compose

To launch the entire platform inside container blocks in one command:
```bash
docker-compose up --build
```
This boots both ports `3000` (Next.js client) and `5000` (Express API server) concurrently.

---

## 🤖 Meet the 9 Agents

1. **Coordinator Agent**: Decrypts user files/logs, determines incident category, allocates subtasks.
2. **Vision Sentinel**: Evaluates field imagery and satellite feeds for damage assessment.
3. **Protocol Researcher**: Searches FEMA databases and government emergency SOP guidelines.
4. **Logistics Planner**: Finds nearest hospitals, coordinates vehicle dispatches, and routes.
5. **Risk Analyzer**: Calculates risk indices (0-100) and population affected estimates.
6. **Voice Agent**: Transcribes distress voice broadcasts.
7. **Alert Communicator**: Drafts SMS, Email, and WhatsApp public warnings.
8. **Action Automator**: Syncs database dispatches, logs audits, and triggers briefs.
9. **Memory Agent**: Matches incident to historic archives to extract lessons learned.
