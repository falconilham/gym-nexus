#!/bin/bash

# Add safe fallbacks for production deployment

cd "$(dirname "$0")/admin/src"

# Fix ROOT_DOMAIN with Vercel fallback
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/process\.env\.NEXT_PUBLIC_ROOT_DOMAIN!/process.env.NEXT_PUBLIC_ROOT_DOMAIN || '"'"'gym-nexus-admin.vercel.app'"'"'/g' {} +

# Fix API_URL with Vercel fallback  
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/process\.env\.NEXT_PUBLIC_API_URL!/process.env.NEXT_PUBLIC_API_URL || '"'"'https:\/\/gym-nexus-backend.vercel.app'"'"'/g' {} +

echo "✅ Added production fallbacks"
