# 🏗️ Build Log

A developer journaling platform where you document your build journey — decisions, blockers, wins, and learnings — as structured log entries. When a project is done, AI generates polished artifacts from those logs. An AI chat lets you search your logs or auto-create entries straight from your latest `git diff`.

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS 4, React Router v7, Axios |
| **Backend** | Node.js (ESM), Express v5, MongoDB (Mongoose), JWT, Bcrypt |
| **AI** | Google Gemini 2.5 Flash — RAG, artifact generation, intent classification, embeddings |
| **MCP Server** | Node.js, `@modelcontextprotocol/sdk`, Express, Zod |
| **Storage** | MongoDB Atlas (vector search), Cloudinary (avatars) |

---

## Project Structure

```
Project/
├── Backend/           # Express REST API
├── Frontend/          # React SPA
└── buildlog-mcp/      # Local MCP server (git diff bridge)
```

---

## Core Features

### 📁 Projects
Create projects with name, tech stack, and start date. Toggle between **private** and **public** — public projects enter an admin approval queue before appearing in the feed. Mark a project **complete** to unlock artifact generation.

### 📝 Log Entries
Each log is categorized as one of four types:

| Type | Use case |
|---|---|
| `Decision` | Architectural choices, library picks, trade-offs |
| `Blocker` | Bugs, errors, roadblocks |
| `Win` | Milestones, shipped features, breakthroughs |
| `Learn` | Insights, best practices, how something works |

Every log gets a **768-dim vector embedding** (via `gemini-embedding-001`) stored in MongoDB for semantic search.

### 🤖 AI Artifact Generation
Once a project is **complete**, generate AI-written documents from your logs:

`readme` · `interview-qa` · `study-summary` · `progress-report` · `work-summary` · `lesson-reflection`

Max 3 artifacts per type per project. All artifacts are editable after generation.

### 💬 Ask AI (3 Modes)
Every query is automatically classified into one of:

- **SEARCH** — RAG over your own logs (*"What blockers did I face last week?"*). Runs MongoDB Atlas vector search → feeds top 8 logs to Gemini as context.
- **GENERAL** — General dev Q&A (*"What is Redis?"*). Goes straight to Gemini with conversation history.
- **CREATE** — Auto-create a log from your git diff (*"create a log from git for Build Log"*). Coordinates a 4-step flow with the local MCP server.

Any AI response can be saved as a structured log entry with one click — Gemini classifies it and suggests tags.

### 🛡️ Admin Dashboard
- Platform stats (users, projects, pending approvals, reports)
- Approve / reject / hide / revoke projects
- Delete users (cascades to all their data)

---

## MCP Server

A locally-running server that bridges AI with your git repo. Must be started **inside your project folder**:

```bash
cd /your/project/repo
node /path/to/buildlog-mcp/index.js
```

**Tools:** `get_git_diff` · `create_log` · `list_projects`

**For Cursor/IDE use**, add to your MCP config:
```json
{ "mcpServers": { "buildlog": { "url": "http://localhost:3210/mcp" } } }
```
Then set `BUILDLOG_TOKEN` in `buildlog-mcp/.env` (copy JWT from browser localStorage).

---

## Getting Started

### Prerequisites
- Node.js v18+, MongoDB Atlas account, Gemini API key, Cloudinary account

### Setup

```bash
# Backend
cd Backend && npm install && node index.js

# Frontend
cd Frontend && npm install && npm run dev

# MCP Server (optional — needed for AI git log creation)
cd buildlog-mcp && npm install
```

### Environment Variables

**`Backend/.env`**
```env
PORT=5701
MONGO_URI=mongodb+srv://...
SECRET_TOKEN_KEY=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**`Frontend/.env`**
```env
VITE_API_URL=http://localhost:5701
VITE_MCP_URL=http://localhost:3210
```

**`buildlog-mcp/.env`** *(only needed for IDE/Cursor)*
```env
BUILDLOG_API_URL=http://localhost:5701
BUILDLOG_TOKEN=your-jwt-token
```

---

## API Overview

| Group | Base Path | Key Operations |
|---|---|---|
| Users | `/api/users` | Register, Login, Get/Update Profile |
| Projects | `/api/projects` | CRUD, visibility toggle, public feed, reporting |
| Logs | `/api/logs` | CRUD per project |
| Artifacts | `/api/artifacts` | Generate, view, edit AI artifacts |
| Ask AI | `/api/ask` | RAG search, intent, general Q&A, MCP tool flow |
| Admin | `/api/admin` | Stats, user/project management |

All protected routes require `Authorization: <JWT>` header.

---

## Role System

| Role | Access |
|---|---|
| `user` | Own projects, logs, artifacts; public feed; can report |
| `admin` | Everything above + full admin dashboard |
