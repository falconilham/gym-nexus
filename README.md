# GymNexus Monorepo

A monorepo containing the GymNexus mobile app, admin panel, and backend API.

## Project Structure

```
gym-nexus-mobile/
├── client/          # React Native mobile app (Expo)
├── admin/           # Next.js admin web panel
├── backend/         # Express.js API server
├── packages/        # Shared packages (optional)
└── package.json     # Root workspace configuration
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Getting Started

### Install Dependencies

Install all dependencies for all workspaces from the root:

```bash
npm install
```

### Development

Run all projects in development mode:

```bash
npm run dev
```

Or run individual projects:

```bash
# Mobile app
npm run dev:client

# Admin panel
npm run dev:admin

# Backend API
npm run dev:backend
```

### Building

Build all projects:

```bash
npm run build
```

Or build individual projects:

```bash
npm run build:client
npm run build:admin
```

## Workspace Commands

### Installing Dependencies

```bash
# Install a dependency in a specific workspace
npm install <package> --workspace=client
npm install <package> --workspace=admin
npm install <package> --workspace=backend

# Install a dev dependency
npm install <package> -D --workspace=admin
```

### Running Scripts

```bash
# Run a script in a specific workspace
npm run <script> --workspace=<workspace-name>

# Run a script in all workspaces that have it
npm run <script> --workspaces --if-present
```

### Cleaning

```bash
# Clean all node_modules
npm run clean
```

## Workspaces

### Client (Mobile App)
- **Location:** `./client`
- **Tech:** React Native + Expo
- **Dev:** `npm run dev:client`

### Admin (Web Panel)
- **Location:** `./admin`
- **Tech:** Next.js + React
- **Dev:** `npm run dev:admin`

### Backend (API)
- **Location:** `./backend`
- **Tech:** Express.js + Sequelize + PostgreSQL
- **Dev:** `npm run dev:backend`

## Shared Packages

You can create shared packages in the `packages/` directory to share code between workspaces:

```bash
mkdir -p packages/shared
cd packages/shared
npm init -y
```

Then reference it in other workspaces:

```json
{
  "dependencies": {
    "@gym-nexus/shared": "*"
  }
}
```

## Tips

- All dependencies are hoisted to the root `node_modules` when possible
- Each workspace maintains its own `package.json`
- Use `--workspace` flag to target specific projects
- The root `package.json` should remain `"private": true`
