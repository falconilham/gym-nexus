# GymNexus Monorepo - Quick Reference

## Project Structure

```
gym-nexus/
├── client/              # @gym-nexus/client - React Native mobile app
├── admin/               # @gym-nexus/admin - Next.js admin panel
├── backend/             # @gym-nexus/backend - Express API
├── packages/
│   └── shared/          # @gym-nexus/shared - Shared utilities
├── package.json         # Root workspace config
├── .npmrc              # npm configuration
└── README.md           # Main documentation
```

## Quick Commands

### Development

```bash
npm run dev              # Run all projects
npm run dev:client       # Run mobile app only
npm run dev:admin        # Run admin panel only
npm run dev:backend      # Run backend only
```

### Install Dependencies

```bash
npm install                                    # Install all
npm install <pkg> --workspace=@gym-nexus/client    # Add to client
npm install <pkg> --workspace=@gym-nexus/admin     # Add to admin
npm install <pkg> --workspace=@gym-nexus/backend   # Add to backend
```

### Build

```bash
npm run build            # Build all
npm run build:client     # Build client
npm run build:admin      # Build admin
```

### Clean

```bash
npm run clean            # Clean all workspaces
```

## Workspace Names

- **Client**: `@gym-nexus/client`
- **Admin**: `@gym-nexus/admin`
- **Backend**: `@gym-nexus/backend`
- **Shared**: `@gym-nexus/shared`

## Using Shared Code

1. Add to workspace:

```bash
npm install @gym-nexus/shared --workspace=@gym-nexus/client
```

2. Import in code:

```javascript
import { formatCurrency, USER_ROLES } from '@gym-nexus/shared';
```

## Troubleshooting

**Dependencies not found?**

```bash
npm run clean && npm install
```

**Workspace not recognized?**

```bash
npm ls --workspaces
```

**Need to update all dependencies?**

```bash
npm update --workspaces
```
