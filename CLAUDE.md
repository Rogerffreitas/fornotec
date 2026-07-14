# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Forno App — Expo (Expo Router) app, responsive for web, deployed to Netlify. Manages lojas (stores), fornos (ovens), peças (parts), ordens de serviço (work orders) and manutenções (maintenance), with profile-based login (técnico/cliente). Domain language and UI copy are in Portuguese.

Every resource belongs to a company (`enterpriseId`, uuid) — multi-tenant. Login (`User`) calls a real API (`POST {EXPO_PUBLIC_API_URL}/auth/signin`), which returns `{ accessToken: { token, type } }`; the JWT is decoded client-side to get `user.enterpriseId`/`role` and `enterprise.name` (see `infra/security/decodeJwt.ts`). Every other resource (Store/Oven/Part/WorkOrder/Maintenance) still lives in memory (mock repositories with simulated latency) but every read/write is scoped by that `enterpriseId`, first parameter of every use-case/gateway method. The architecture is intentionally structured so swapping each remaining mock for a real API doesn't require touching any screen.

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

Login calls a real API — set `EXPO_PUBLIC_API_URL` (see `.env.example`) before running. There's no
mocked login anymore; credentials must exist on the real backend.

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
                        HttpClient implementations ready for when the
                        *RepositoryGatewayImpl start calling a real API

infra/
  ioc/container.ts -> composition root: wires which implementation each
                        interface uses today (in-memory) and will use later (API);
                        User already uses UserRepositoryGatewayApi (real API)
  repositories/      -> *RepositoryGatewayImpl, in-memory (array + delay simulating
                        latency), filtered/stamped by enterpriseId; UserRepositoryGatewayApi
                        calls the real backend
  security/          -> BcryptEncrypter (bcryptjs), decodeJwt.ts (manual JWT payload decode)
  pdf/               -> PdfLibPdfGenerator (pdf-lib)

context/            -> AuthContext (logged-in user session, incl. enterpriseId)
components/         -> shared UI (theme, button, field, list, etc.)
app/                -> screens, routed by folder (Expo Router)
```

Dependency flow: `app/` screens call use-cases exported from `infra/ioc/container.ts`, always passing `user.enterpriseId` (from `useAuth()`) as the first argument; interactors depend only on gateway *interfaces* from `domain/application/gateway`, never on a concrete `*GatewayImpl`. `WorkOrderInteractor` and `UserInteractor` show cross-cutting composition — they take other use-cases/infra (e.g. `ovenUseCase`, `BcryptEncrypter`) as constructor args in `container.ts`.

### Swapping the mock for a real API

Each interactor only knows the Gateway *interface* (port), never the implementation. To plug in a real backend:

1. Create, e.g., `infra/repositories/StoreRepositoryGatewayApi.ts implements StoreRepositoryGateway`, using `FetchHttpClientAdapter` or `AxiosHttpClientAdapter` (`domain/adapters`).
2. In `infra/ioc/container.ts`, swap `new StoreRepositoryGatewayImpl()` for `new StoreRepositoryGatewayApi(new FetchHttpClientAdapter(API_URL))`.

No screen under `app/` needs to change.

## Recorded technical decisions

- **`bcrypt` → `bcryptjs`**: the native `bcrypt` package doesn't build on Expo/React Native/web (depends on a node-gyp compiled binary). `bcryptjs` is pure JS, same API, works in any bundle (native or web).
- **PdfGenerator → `pdf-lib`**: chosen over pdfmake because it needs no extra font/vfs config to work on Expo web. The "Baixar PDF" button on the work-order detail screen generates a real PDF with the ovens and notes from the order — currently functional on web (uses Blob + browser download link); native iOS/Android would need `expo-sharing`/`expo-file-system` to save the file (not implemented yet).
- **Login/JWT**: `UserRepositoryGatewayApi` posts `{ username, password, role }` to `/auth/signin` and gets back `{ accessToken: { token, type } }`. `decodeJwtPayload` (in `infra/security/decodeJwt.ts`) decodes the JWT payload manually (no `atob`/`Buffer`, for Hermes compatibility) to read `user.enterpriseId`/`role` and `enterprise.name` — signature/expiry validation is the backend's job. `Role` mirrors the API casing (`'ADMIN' | 'TECHNICAL' | 'CLIENT'`); the login screen's checkbox stays lowercase (`LoginRole`) and maps via `LOGIN_ROLE_TO_ROLE` in `components/RoleToggle.tsx`.
- **Login by profile**: Técnico/Cliente checkbox + user/password; authentication requires username, password, and selected profile to all match.
- **Multi-tenant demo data**: the in-memory seed (`infra/repositories/seed.ts`) is stamped with `DEMO_ENTERPRISE_ID`, matching the enterprise of the real test account used during development. Logging in with a different real company will legitimately show empty lists for Store/Oven/Part/WorkOrder/Maintenance until those resources also move to the real API.
- **Tests**: `jest` + `jest-expo` preset, `@testing-library/react-native` for the `AuthContext` hook (pinned to v13 — v14 requires React 19, this project is on React 18). Test files live in a `__test__/` folder next to the source they cover (`infra/security/__test__/decodeJwt.test.ts`, `domain/interactors/__test__/userInteractor.test.ts`, `infra/repositories/__test__/UserRepositoryGatewayApi.test.ts`, `context/__test__/AuthContext.test.tsx`) — covers JWT decoding, the `HttpError` vs. network-error distinction in `UserInteractor.authenticate`, the real `/auth/signin` request shape, and the two different login error messages surfaced by `AuthContext`.
- **Part reference**: `${location}00${id}` (e.g. `CC005`).
- **Oven reference**: optional, free text.
- **Oven's last maintenance** is updated when a work order is finalized; next maintenance = last + `maintenanceFrequency` (days).
- **Work order status**: `pendente` (default) → `finalizada` or `cancelada`.
- **Work order notes** are tied to the (order, oven) pair — the `WorkOrderOven` entity.
- **Maintenance form** records one item per part (part + service performed + note), allowing several to be added before saving.
