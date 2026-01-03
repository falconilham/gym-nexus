#!/bin/bash

# Remove all localhost fallbacks from TypeScript files

cd "$(dirname "$0")/admin/src"

# Replace API_URL fallbacks
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | while IFS= read -r -d '' file; do
    sed -i '' 's/process\.env\.NEXT_PUBLIC_API_URL || ["'"'"']http:\/\/localhost:5000["'"'"']/process.env.NEXT_PUBLIC_API_URL!/g' "$file"
    sed -i '' 's/(process\.env\.NEXT_PUBLIC_API_URL || ["'"'"']http:\/\/localhost:5000["'"'"'])/process.env.NEXT_PUBLIC_API_URL!/g' "$file"
done

# Replace ROOT_DOMAIN fallbacks  
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | while IFS= read -r -d '' file; do
    sed -i '' 's/process\.env\.NEXT_PUBLIC_ROOT_DOMAIN || ["'"'"']localhost:3000["'"'"']/process.env.NEXT_PUBLIC_ROOT_DOMAIN!/g' "$file"
    sed -i '' 's/(process\.env\.NEXT_PUBLIC_ROOT_DOMAIN || ["'"'"']localhost:3000["'"'"'])/process.env.NEXT_PUBLIC_ROOT_DOMAIN!/g' "$file"
done

echo "✅ Removed all localhost fallbacks"
