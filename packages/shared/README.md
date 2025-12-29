# @gym-nexus/shared

Shared utilities, constants, and types for the GymNexus monorepo.

## Usage

Install in any workspace:

```bash
npm install @gym-nexus/shared --workspace=client
```

Then import:

```javascript
import { formatCurrency, validateEmail, USER_ROLES } from '@gym-nexus/shared';

// Use the utilities
const price = formatCurrency(99.99);
const isValid = validateEmail('user@example.com');
```

## What to Put Here

- **Constants**: API endpoints, user roles, status codes
- **Utilities**: Date formatting, validation, string manipulation
- **Types**: TypeScript types/interfaces (if using TypeScript)
- **Configurations**: Shared config objects
- **Helpers**: Common helper functions used across projects

## Adding New Utilities

1. Add your function/constant to `index.js`
2. Export it properly
3. Document it with JSDoc comments
4. The changes will be immediately available to all workspaces
