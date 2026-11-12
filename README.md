# Movie Memory

Sign in with Google, save your favorite movie, and get a fun fact about it from OpenAI.

**Variant chosen: B, Frontend/API-focused (client orchestration and API contracts).**

Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, Postgres, Prisma 6, Auth.js v5 (Google), OpenAI, TanStack Query 5, Zod 4, Vitest, and React Testing Library.

---

## Setup

Requirements: Node 22+ and Docker.

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in the values below
npm run db:up               # Postgres 16 in Docker on localhost:5433
npm run db:migrate          # applies prisma/migrations
npm run dev                 # http://localhost:3000
```

Other scripts: `npm test` (Vitest), `npm run typecheck`, `npm run lint`, `npm run build`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. The default matches `docker-compose.yml`. |
| `AUTH_SECRET` | Encrypts Auth.js cookies. Generate one with `npx auth secret`. |
| `AUTH_TRUST_HOST` | `true` for local `next start`. Behind a real domain, set `AUTH_URL` instead. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`. |
| `OPENAI_API_KEY` | Used only on the server to generate facts. |

None of these use the `NEXT_PUBLIC_` prefix, so none reach the browser bundle.

### Database migrations

The schema lives in `prisma/schema.prisma` and the migrations live in `prisma/migrations/`.

- Development: `npm run db:migrate` (`prisma migrate dev`) applies existing migrations and creates new ones.
- Production or CI: `npx prisma migrate deploy`.

---

## Architecture overview
I designed the architecture manually before feeding it to an AI agent to implement and document. I gave it specific instructions and libraries to use. I also designed the contracts for components + DB schemas and provided them to the agent to use.

**Separation of concerns.** Separate UI, feature logic, server services, and data access.

**Component architecture.** Next.js Server Components render the page shell, and Client Components handle the movie editor and fact card. Only the interactive parts need browser state and event handlers. This also improves performance by rendering components on the server whenever possible.

**State management.** The draft title lives in `useState`, and the saved movie lives in TanStack Query. Save updates the displayed title immediately and rolls it back if the request fails. I did not use a state management library solely for simplicities sake. If the application grew, it would be wise to implement a library like Zustand or Redux to ensure strict patterns and improve performance by reducing unnecessary re-renders.

**Data fetching.** Native `fetch` sits behind a typed API client, which is called through TanStack Query. All three endpoints get the same response handling, and the UI can show loading and save status. 

**Project structure.** Folders are organized by feature: routes in `app/`, movie components and hooks in `features/movie/`, and shared schemas in `contracts/`. Related code lives together, so the edit flow is easy to trace. This structure allows the project to scale gracefully without having large folders with unrelated files. 

**Type safety and contracts.** Zod schemas are shared between server and client, with TypeScript types inferred from them. The server validates movie input, and the client checks API responses at runtime. No need to automatically generate contracts using something like openAPI + tooling as the backend and frontend live together in Next.js.

**Error handling.** The fetch wrapper throws a shared `ApiError`, and the affected component decides how to recover. An expired session sends the user to sign-in. A failed save restores the previous title and keeps the draft so the user can retry.

**Testing.** Vitest and React Testing Library cover API errors, Save and Cancel, optimistic rollback, and cache invalidation.

**Accessibility.** The app uses native forms and buttons, visible labels, focus management, and a live status region. Editing works from the keyboard, and save results are announced to screen readers. 

---

## Why Variant B

I chooose variant B simply because I am more interested in frontend developement than backend, however I would feel comfortable doing either. I also thought building out the optimistic update feature would be fun as I have not had to do that for quite some time.

**I choose TanStack Query** instead of hand-rolled React state or SWR because it handles optimistic updates with rollback , per-key caching, pausing a query, and explicit refetching. A custom version would mostly re-implement those features with more edge cases. SWR could do it too, but its mutation and rollback features are less explicit.

## Key tradeoffs
- **Shared Zod schemas instead of OpenAPI + tooling.** Three endpoints in one TypeScript repo can share schemas directly, which avoids a codegen step.
- **The client cache is per tab** (`sessionStorage`), not server-side. Two tabs can each generate a fact, and the server doesn't rate-limit. That protection is what Variant A covers.
- **The favorite movie is a column on `User`**, not a table. That's simpler for one favorite. A history or several favorites would need a `FavoriteMovie` table.
- **Simple react state management** instead of using a library like Zustand or Redux to keep things simple. In a larger application, a state management library would improve performance and establish clear patterns that must be followed.


## With 2 more hours
- Use a component library to reduce overhead while making it easier to enforce consistency across components.
- Add testing to verify access control for user data.
- Fix the layout shift when loading/refreshing the fun fact section.
- Implement a state management library like Redux or Zustand to support a more complex app while avoiding performance issues from re-renders.
- Run Playwright end-to-end tests against a seeded session, covering the all the test cases.
- Add server-side rate limiting or a short server cache for fact generation (borrowing from Variant A), and switch fact generation to `POST`.

## AI usage
- Used Cursor to turn my architecture guide, component contracts, DB schemas into a written plan, then to scaffold files and write first drafts of the code and tests.
- Reviewed and directed the key decisions myself: folder structure, who owns each value, libraries used, the query key design, pausing fact fetches during a save, and component contracts.
- Used the AI to check version-specific APIs (Next.js 16 `cacheComponents`, Zod 4, OpenAI SDK v7 Responses API, Auth.js v5 `AUTH_TRUST_HOST`) against the installed packages' docs.
- Verified everything by running the test suite, type checking, linting, a production build, and a curl smoke test of the guards and API errors against a seeded database session.
- Used Cursor to assist in writing this readme file, wrote the first draft then I read EVERY line and made changes as needed. Estimated 50% is written by AI after editing.
