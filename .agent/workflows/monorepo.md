---
description: Monorepo development workflow
---

# Monorepo Development Workflow

This workflow describes common tasks for working with the GymNexus monorepo.

## Initial Setup

1. **Install all dependencies**

```bash
npm install
```

This will install dependencies for all workspaces (client, admin, backend, and shared packages).

## Development

2. **Run all projects in development mode**

```bash
npm run dev
```

This will start:

- Client (Expo): Mobile app development server
- Admin (Next.js): Admin panel on http://localhost:3000
- Backend (Express): API server on configured port

3. **Run individual projects**

For mobile app:

```bash
npm run dev:client
```

For admin panel:

```bash
npm run dev:admin
```

For backend API:

```bash
npm run dev:backend
```

## Managing Dependencies

4. **Install a dependency in a specific workspace**

For client:

```bash
npm install <package-name> --workspace=@gym-nexus/client
```

For admin:

```bash
npm install <package-name> --workspace=@gym-nexus/admin
```

For backend:

```bash
npm install <package-name> --workspace=@gym-nexus/backend
```

5. **Install a dev dependency**

```bash
npm install <package-name> -D --workspace=@gym-nexus/admin
```

6. **Remove a dependency**

```bash
npm uninstall <package-name> --workspace=@gym-nexus/client
```

## Using Shared Packages

7. **Add shared package to a workspace**

First, ensure the shared package exists in `packages/shared/`, then:

```bash
npm install @gym-nexus/shared --workspace=@gym-nexus/client
```

8. **Import from shared package**

In your code:

```javascript
import { formatCurrency, USER_ROLES } from '@gym-nexus/shared';
```

## Building

9. **Build all projects**

```bash
npm run build
```

10. **Build specific project**

```bash
npm run build:client
npm run build:admin
```

## Cleaning

11. **Clean all node_modules and build artifacts**

```bash
npm run clean
```

Then reinstall:

```bash
npm install
```

## Running Scripts

12. **Run a script in all workspaces**

```bash
npm run <script-name> --workspaces --if-present
```

13. **Run a script in a specific workspace**

```bash
npm run <script-name> --workspace=@gym-nexus/backend
```

## Troubleshooting

14. **If dependencies are not resolving correctly**

Clear everything and reinstall:

```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
```

15. **Check workspace structure**

```bash
npm ls --workspaces
```

16. **Verify workspace configuration**

```bash
npm query .workspace
```

## Tips

- Always run `npm install` from the root directory
- Dependencies are hoisted to the root `node_modules` when possible
- Each workspace maintains its own `package.json`
- Use `--workspace` flag to target specific projects
- The shared package can be used to share code between workspaces
