# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Forno App — Expo (Expo Router) app, responsive for web, deployed to Netlify. Manages lojas (stores), fornos (ovens), peças (parts), ordens de serviço (work orders) and manutenções (maintenance), with profile-based login (técnico/cliente). Domain language and UI copy are in Portuguese.

Every resource belongs to a company (`enterpriseId`, uuid) — multi-tenant. Every resource, including login, calls the real backend (`forno-api`, a separate NestJS + Prisma/MySQL repo — see `/config/workspace/forno-api` in this environment) at `EXPO_PUBLIC_API_URL`. Login (`POST {EXPO_PUBLIC_API_URL}/auth/signin`) returns `{ accessToken: { token, type } }`; the JWT is decoded client-side to get `user.enterpriseId`/`role` and `enterprise.name` (see `infra/security/decodeJwt.ts`). Store/Oven/Part/WorkOrder/Maintenance all go through `*RepositoryGatewayApi` implementations that call `forno-api` — every read/write is scoped by `enterpriseId`, the first parameter of every use-case/gateway method on the client (the server actually derives the tenant from the verified JWT, not from this parameter — see `infra/security/session.ts`). The old in-memory `*RepositoryGatewayImpl` classes and `infra/repositories/seed.ts` are unused now (nothing in `container.ts` references them) but left in place for reference.

## Commands

```bash
npm install
npx expo install --fix   # align native lib versions with the Expo SDK
npx expo start           # press "w" to open in the browser

npm run typecheck        # tsc --noEmit
npm run lint              # eslint . --ext .js,.jsx,.ts,.tsx
npm run lint:fix
npm run format             # prettier --write .
npm run format:check

npm run build:web        # expo export --platform web -> dist/

npm test                 # jest — currently covers the login flow only
npm run test:watch
```

Every resource calls the real API (`forno-api`) — set `EXPO_PUBLIC_API_URL` (see `.env.example`,
defaults to `http://localhost:3001/api/v1` for local dev) and have `forno-api` running
(`npm run start:dev` in that repo) before running this app. There's no mocked login or
data anymore; credentials/data must exist on the real backend (`npm run seed` there creates
demo data).

### Netlify deploy

`netlify.toml` already sets `command = "npm run build:web"` and `publish = "dist"`. `public/_redirects` makes Expo Router (SPA) routes work on reload (e.g. reloading `/lojas` doesn't 404).

## Architecture (Clean Architecture)

```
domain/
  entities/        -> User, Store, Part, Oven, OvenPart, WorkOrder, Maintenance,
                        DecodedToken (JWT payload shape)
  types/            -> shared enums/types (Role, WorkOrderStatus, ServiceType, Location)
  application/
    gateway/        -> data-access interfaces, one per resource (output ports);
                        every method takes enterpriseId as its first parameter
    infra/          -> infra interfaces: HttpClient, Encrypter, PdfGenerator,
                        DocumentDefinitions
  use-case/         -> use-case contracts (what the app does)
  interactors/      -> use-case implementations; receive the Gateway
                        (and other use-cases) via constructor
  adapters/         -> AxiosHttpClientAdapter / FetchHttpClientAdapter,
                        HttpClient implementations used by every *RepositoryGatewayApi

infra/
  ioc/container.ts -> composition root: every use-case is wired to its
                        *RepositoryGatewayApi, calling forno-api via EXPO_PUBLIC_API_URL
  repositories/      -> *RepositoryGatewayApi (real backend, current) and the older
                        in-memory *RepositoryGatewayImpl + seed.ts (unused, kept for
                        reference)
  security/          -> BcryptEncrypter (bcryptjs), decodeJwt.ts (manual JWT payload decode),
                        session.ts (holds the current JWT outside React so the
                        *RepositoryGatewayApi classes — built once in container.ts,
                        before any login — can attach `Authorization: Bearer <token>`)
  pdf/               -> PdfLibPdfGenerator (pdf-lib)

context/            -> AuthContext (logged-in user session, incl. enterpriseId)
components/         -> shared UI (theme, button, field, list, etc.)
app/                -> screens, routed by folder (Expo Router)
```

Dependency flow: `app/` screens call use-cases exported from `infra/ioc/container.ts`, always passing `user.enterpriseId` (from `useAuth()`) as the first argument; interactors depend only on gateway *interfaces* from `domain/application/gateway`, never on a concrete `*GatewayImpl`. `WorkOrderInteractor` and `UserInteractor` show cross-cutting composition — they take other use-cases/infra (e.g. `ovenUseCase`, `BcryptEncrypter`) as constructor args in `container.ts`.

### Backend

`forno-api` (separate repo, NestJS + Prisma/MySQL) implements every resource's REST API,
plus its own `auth`/`Enterprise`/`User` (independent of any other backend). Each interactor
only knows the Gateway *interface* (port), never the implementation — the `*RepositoryGatewayApi`
classes in `infra/repositories/` are the only pieces that know `forno-api`'s HTTP contract.
Two contract mismatches worth knowing if touching these files: `WorkOrderRepositoryGateway.create`/
`createOvens` are two separate calls on the client but map to `POST /work-orders` then
`POST /work-orders/:id/ovens` (the backend never accepts ovens in the same call as the order);
`MaintenanceRepositoryGateway.createMany` takes a flat array but the backend expects
`{ orderId, ovenId, items: [...] }` — the adapter derives `orderId`/`ovenId` from the first
item (all items in a single call always share them, since `MaintenanceInteractor.register`
constructs the array that way).

The server derives `enterpriseId`/`role` from the verified JWT, never from what the client
sends — so the `enterpriseId` parameter every Gateway method takes is not actually forwarded
in the HTTP request; it stays purely as the existing interface contract.

## Recorded technical decisions

- **`bcrypt` → `bcryptjs`**: the native `bcrypt` package doesn't build on Expo/React Native/web (depends on a node-gyp compiled binary). `bcryptjs` is pure JS, same API, works in any bundle (native or web).
- **PdfGenerator → `pdf-lib`**: chosen over pdfmake because it needs no extra font/vfs config to work on Expo web. The "Baixar PDF" button on the work-order detail screen generates a real PDF with the ovens and notes from the order — currently functional on web (uses Blob + browser download link); native iOS/Android would need `expo-sharing`/`expo-file-system` to save the file (not implemented yet).
- **Login/JWT**: `UserRepositoryGatewayApi` posts `{ username, password, role }` to `/auth/signin` and gets back `{ accessToken: { token, type } }`. `decodeJwtPayload` (in `infra/security/decodeJwt.ts`) decodes the JWT payload manually (no `atob`/`Buffer`, for Hermes compatibility) to read `user.enterpriseId`/`role` and `enterprise.name` — signature/expiry validation is the backend's job. `Role` mirrors the API casing (`'ADMIN' | 'TECHNICAL' | 'CLIENT'`); the login screen's checkbox stays lowercase (`LoginRole`) and maps via `LOGIN_ROLE_TO_ROLE` in `components/RoleToggle.tsx`.
- **Login by profile**: Técnico/Cliente checkbox + user/password; authentication requires username, password, and selected profile to all match.
- **Multi-tenant demo data**: `forno-api`'s seed script (`prisma/seed.ts` in that repo) creates an `Enterprise` stamped with the same `DEMO_ENTERPRISE_ID` the old in-memory seed used, plus `admin.demo`/`fornotec` (técnico, name "Fornotec")/`emporio` (cliente, name "Empório do pão") test users — kept consistent so demo data lines up across both repos. Logging in with a different real company shows empty lists until that company has its own data in `forno-api`.
- **Tests**: `jest` + `jest-expo` preset, `@testing-library/react-native` for the `AuthContext` hook (pinned to v13 — v14 requires React 19, this project is on React 18). Test files live in a `__test__/` folder next to the source they cover (`infra/security/__test__/decodeJwt.test.ts`, `domain/interactors/__test__/userInteractor.test.ts`, `infra/repositories/__test__/UserRepositoryGatewayApi.test.ts`, `context/__test__/AuthContext.test.tsx`) — covers JWT decoding, the `HttpError` vs. network-error distinction in `UserInteractor.authenticate`, the real `/auth/signin` request shape, and the two different login error messages surfaced by `AuthContext`.
- **Part reference**: `${location}00${id}` (e.g. `CC005`).
- **Oven reference**: optional, free text.
- **Oven's last maintenance** is updated when a work order is finalized; next maintenance = last + `maintenanceFrequency` (days).
- **Work order status**: `pendente` (default) → `finalizada` or `cancelada`.
- **Work order notes** are tied to the (order, oven) pair — the `WorkOrderOven` entity.
- **Maintenance form** records one item per part (part + service performed + note), allowing several to be added before saving.
