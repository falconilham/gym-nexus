# GymNexus Mobile - Environment Configuration

## Environment Files

The mobile app uses different environment configurations for development and production.

### Files

- **`.env.example`** - Template for environment variables (committed to git)
- **`.env`** - Development environment (not committed)
- **`.env.production`** - Production environment (not committed)

### Configuration

#### Development (.env)

```env
API_URL=http://localhost:5000
APP_NAME=GymNexus (Dev)
APP_VERSION=1.0.0
```

#### Production (.env.production)

```env
API_URL=https://gym-nexus-backend-production.up.railway.app
APP_NAME=GymNexus
APP_VERSION=1.0.0
```

## Usage in Code

### Import the configuration:

```javascript
import config, { API_URL, API_ENDPOINTS } from './src/config/env';

// Use the API URL
console.log(API_URL);
// Development: http://localhost:5000
// Production: https://gym-nexus-backend-production.up.railway.app

// Use predefined endpoints
fetch(API_ENDPOINTS.client.trainers)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Available Exports:

```javascript
// Default export (all config)
import config from './src/config/env';

// Named exports
import {
  API_URL, // Base API URL
  APP_NAME, // Application name
  APP_VERSION, // Application version
  API_ENDPOINTS, // Predefined API endpoints
} from './src/config/env';
```

## API Endpoints

The configuration provides predefined endpoints:

### Admin Endpoints

- `API_ENDPOINTS.admin.trainers` - Manage trainers
- `API_ENDPOINTS.admin.members` - Manage members
- `API_ENDPOINTS.admin.classes` - Manage classes
- `API_ENDPOINTS.admin.equipment` - Manage equipment

### Client Endpoints

- `API_ENDPOINTS.client.trainers` - Get trainers list
- `API_ENDPOINTS.client.classes` - Get classes
- `API_ENDPOINTS.client.schedule` - Get schedule

## Setup

### First Time Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Update values if needed for local development

3. For production builds, the app will automatically use `.env.production`

### Switching Environments

The app automatically detects the environment:

- **Development mode** (`__DEV__ === true`): Uses `.env` settings
- **Production mode** (`__DEV__ === false`): Uses `.env.production` settings

## Testing Different Environments

### Test with local backend:

```bash
# Make sure backend is running on localhost:5000
npm start
```

### Test with production backend:

```bash
# Build for production
npm run build
```

## Important Notes

1. **Never commit `.env` or `.env.production`** - They are in `.gitignore`
2. **Always commit `.env.example`** - This is the template for other developers
3. **Update `.env.example`** when adding new environment variables
4. The `__DEV__` flag is automatically set by React Native/Expo

## Troubleshooting

### API calls failing?

1. Check the API_URL in your environment file
2. Verify the backend is running
3. Check network connectivity
4. Look for CORS issues in backend logs

### Wrong environment being used?

1. Check if you're running in development or production mode
2. Verify the correct `.env` file exists
3. Restart the Expo dev server

## Advanced: Using react-native-dotenv

For better environment variable management, you can integrate `react-native-dotenv`:

```bash
npm install react-native-dotenv
```

Then update `babel.config.js`:

```javascript
module.exports = {
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
      },
    ],
  ],
};
```

Usage:

```javascript
import { API_URL } from '@env';
```

## Related Documentation

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native Config](https://github.com/luggit/react-native-config)
- [Backend API Documentation](../backend/README.md)
