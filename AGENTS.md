# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the TypeScript backend:
  - `src/index.ts` starts the Express server and defines `/api/*` routes.
  - `src/mcpClient.ts` manages MCP SSE connection, tool listing, and tool calls.
- `public/index.html` is the frontend UI served by Express.
- `img/` stores README screenshots and static documentation assets.
- `dist/` is generated build output from TypeScript (`tsc`); do not edit manually.
- Container files are in `Dockerfile`, `.dockerignore`, and `docker-compose.yml`.

## Build, Test, and Development Commands
- `npm install` — install project dependencies.
- `npm run dev` — run the server directly from TypeScript via `ts-node`.
- `npm run build` — compile `src/` into `dist/` using `tsc`.
- `npm start` — run the compiled server (`dist/index.js`).
- `docker-compose up -d --build` — build and run the app in Docker (mapped as `9527:3001`).

## Coding Style & Naming Conventions
- Use TypeScript with `strict` mode assumptions (`tsconfig.json`).
- Follow existing style: 2-space indentation, semicolons, and double quotes.
- Prefer `camelCase` for variables/functions (`connectToMcpServer`), and descriptive names.
- Keep modules focused: routing and HTTP concerns in `src/index.ts`; protocol/client logic in `src/mcpClient.ts`.
- Keep API responses predictable (`{ success, message }` or structured error payloads).

## Testing Guidelines
- No automated test framework is currently configured.
- For each change, at minimum run `npm run build` and verify core flows manually:
  - connect/disconnect to an MCP server,
  - list tools,
  - execute a tool call from the UI.
- If adding tests, prefer `*.test.ts` naming and keep tests near source or under `src/__tests__/`.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style seen in history: `feat:`, `fix:`, `style:`, `refactor:`.
- Keep commit messages short, imperative, and scoped to one logical change.
- PRs should include:
  - a clear summary,
  - manual verification steps,
  - linked issue/task (if any),
  - UI screenshots for frontend-visible changes.

## Security & Configuration Tips
- Do not commit secrets or real authorization tokens.
- Pass MCP auth headers at runtime; avoid hardcoding credentials.
- Be careful with logging request headers or sensitive tool output.
