---
alwaysApply: true
---
# Betterperformance – Cursor Rules

## Project Overview

* Project name: **Betterperformance**
* Package manager: **pnpm**
* Framework: **Next.js 15 (App Router)**
* Architecture: **Screaming Architecture**
* Language: **TypeScript (strict)**
* Linting: **ESLint (must always pass)**
* Styling/UI: **shadcn/ui only**
* Target platform: **Windows 7 → Windows 11 optimization**
* Output: **Generated `.ps1` PowerShell blob file with selected tweaks**

This application generates a `.ps1` file by concatenating user-selected Windows tweaks. No tweak is executed inside the app. The app only generates and exports the script.

---

## Core Architecture Rules (MANDATORY)

### Screaming Architecture

* Folder names must represent **business intent**, not technical layers.
* Structure must scream *what the app does*.
* Files are grouped by **domain and responsibility**, not by type.

✅ Valid examples:

```
tweaks/
tweak-export/
windows-optimization/
user-auth/
```

❌ Invalid examples:

```
components/
utils/
hooks/
services/
```

---

## Single Responsibility Rule (EXTREMELY IMPORTANT)

* **One file = one responsibility**
* A file must do **one thing and only one thing**
* If logic starts doing something else → create a new file
* No mixed concerns
* No "god files"

Cursor must NEVER:

* Add multiple unrelated functions to the same file
* Mix UI, business logic, and data logic in the same file

---

## Naming Conventions

### Files & Folders

* **kebab-case ONLY**
* No camelCase
* No PascalCase

✅ Valid:

```
generate-ps1-blob.ts
tweak-selection-card.tsx
export-selected-tweaks.ts
```

❌ Invalid:

```
GeneratePs1.ts
useTweaks.ts
TweakCard.tsx
```

---

## Client / Server Separation (Next.js 15 Rules)

### Mandatory Separation

* Follow **Next.js 15 App Router best practices**
* Client and server logic must be **strictly separated**

#### Server-side responsibilities:

* API routes
* PowerShell blob generation
* Business logic
* Validation
* Security checks

#### Client-side responsibilities:

* UI rendering
* User interaction
* State management
* Forms
* Selection logic

### Client Components

* Use `"use client"` **only when strictly necessary**
* Never add `"use client"` for convenience

Cursor must NEVER:

* Generate `.ps1` files on the client
* Access filesystem from client code
* Put server logic in client components

---

## UI & Styling Rules (STRICT)

### shadcn/ui ONLY

* All UI must be built using **shadcn/ui components**
* No raw HTML elements styled manually
* No custom primitives (buttons, inputs, modals, etc.)

### Tailwind Usage

* Tailwind is allowed **only through shadcn/ui**
* Always use theme tokens

✅ Allowed:

```
bg-background
bg-card
bg-accent
text-foreground
border-border
```

❌ Forbidden:

```
bg-red-300
text-blue-500
bg-[#ff0000]
```

Cursor must ALWAYS:

* Respect shadcn theme variables
* Extend shadcn components if needed, never replace them

---

## TypeScript Rules (SUPER AGGRESSIVE)

* **Strict TypeScript at all times**
* Explicit typing wherever logic matters
* No implicit `any`
* No `any` at all unless explicitly approved
* Prefer `unknown` over `any`
* Strongly typed function inputs and outputs
* Strongly typed API responses
* Strongly typed domain models

Cursor must NEVER:

* Silence TypeScript errors
* Use `as any` to bypass typing
* Add unsafe type assertions

---

## ESLint Rules (MANDATORY)

* ESLint must pass **100% clean**
* No ignored rules unless explicitly stated
* No `eslint-disable` comments without strong justification

### Prompt Completion Requirement

**At the end of every prompt execution, Cursor must ensure:**

* Code passes ESLint
* No unused variables
* No unreachable code
* No rule violations

If ESLint would fail, Cursor must fix the code before finishing.

---

## PowerShell Tweaks Rules

* Tweaks are isolated PowerShell snippets
* Each tweak must be independent
* Tweaks are concatenated into a single `.ps1` blob
* No execution happens inside the app

Cursor must NEVER:

* Execute PowerShell
* Validate tweaks by running them
* Perform OS-level side effects

---

## Code Quality Rules

* TypeScript only
* Clean, production-ready code
* No console logs unless explicitly requested
* No commented-out code
* Clear, explicit intent in naming

---

## Cursor Default Behavior

When generating or modifying code, Cursor MUST:

1. Respect Screaming Architecture
2. Create new files instead of bloating existing ones
3. Enforce single responsibility per file
4. Keep client and server logic separated
5. Use shadcn/ui exclusively
6. Use kebab-case naming
7. Apply strict TypeScript typing
8. Ensure ESLint passes before completion

If rules conflict, **architecture and typing rules override everything**.





