# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Reset database
npm run db:reset
```

## Environment

Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. If the key is empty, the app falls back to a `MockLanguageModel` defined in `src/lib/provider.ts`.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in chat, Claude generates code via tool calls, and a live preview updates in real-time.

### Request Flow

1. User submits a message in `ChatInterface` → `ChatContext` sends it to `/api/chat`
2. The API route streams a response using Vercel AI SDK with two tools: `str_replace_editor` (edits files) and `file_manager` (creates/deletes/renames files)
3. Tool results update the virtual file system via `FileSystemContext`
4. `PreviewFrame` transpiles the virtual FS contents with Babel (in-browser) and renders the component in an iframe

### Key Layers

**Virtual File System** (`src/lib/file-system.ts`, `src/lib/contexts/file-system-context.tsx`)
- Purely in-memory — no disk I/O. Files live in React state.
- Serialized to JSON for project persistence in the database.

**AI Integration** (`src/app/api/chat/route.ts`, `src/lib/tools/`)
- Uses `@ai-sdk/anthropic` with streaming. The system prompt is in `src/lib/prompts/generation.tsx`.
- `str_replace_editor` tool: targeted line-range replacements (like a text editor's find-and-replace).
- `file_manager` tool: create, delete, rename files in the virtual FS.

**Live Preview** (`src/components/preview/PreviewFrame.tsx`, `src/lib/transform/jsx-transformer.ts`)
- Transpiles JSX/TSX in the browser using Babel standalone.
- Renders inside a sandboxed iframe.

**Authentication** (`src/lib/auth.ts`, `src/actions/index.ts`)
- JWT sessions stored in cookies; passwords hashed with bcrypt.
- Anonymous users are tracked via localStorage (`src/lib/anon-work-tracker.ts`).

**Database** (`prisma/schema.prisma`)
- SQLite via Prisma. Two models: `User` and `Project`.
- `Project.messages` and `Project.data` store the full chat history and file system as JSON blobs.
- `prisma/schema.prisma` is the source of truth for all table and data schemas — reference it whenever you need to understand what is stored in the database.

### Path Alias

`@/*` maps to `src/*` — use this for all imports.

### UI Stack

- shadcn/ui (new-york style) + Radix UI + Tailwind CSS v4
- Monaco Editor for the code editor pane
- Resizable panels (`react-resizable-panels`) for the main layout in `src/app/main-content.tsx`

## Coding Guidelines

- Add comments sparingly only when the implementation has a certain level of complexity which the user needs to be explained via comments.
- Do not add unnecessary assumptions or fallbacks, help me see error messages clearly even if the app breaks. I want clear visibility into bugs.
