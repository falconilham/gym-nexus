#!/bin/bash

# GymNexus Quick Deployment Script
# This script helps you deploy backend and admin to popular platforms

echo "🚀 GymNexus Deployment Helper"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the gym-nexus root directory"
    exit 1
fi

echo "What would you like to deploy?"
echo "1. Backend (API) + Database (Supabase)"
echo "2. Admin Panel (Vercel)"
echo "3. Everything"
echo ""
read -p "Enter your choice (1-3): " choice

deploy_backend() {
    echo ""
    echo "📦 Backend & DB Deployment Options:"
    echo "1. Supabase (Database) + Render (API) - [Recommended]"
    echo "2. Supabase (Database) + Railway (API)"
    echo "3. Heroku (API + DB)"
    echo ""
    read -p "Choose platform (1-3): " platform
    
    case $platform in
        1)
            echo ""
            echo "🔥 Setting up Supabase + Render..."
            echo ""
            echo "Step 1: Database (Supabase)"
            echo "1. Create a project at supabase.com"
            echo "2. Get your Connection String (URI) from Settings > Database"
            echo "3. Make sure to replace [YOUR-PASSWORD] with your actual password"
            echo ""
            echo "Step 2: Backend API (Render)"
            echo "1. Create a Web Service at render.com"
            echo "2. Connect this repo and set Root Directory to 'backend'"
            echo "3. Set Environment Variables:"
            echo "   - DATABASE_URL = (Your Supabase URI)"
            echo "   - DB_SSL = true"
            echo "   - NODE_ENV = production"
            echo ""
            read -p "Press Enter once you have configured these steps..."
            ;;
        2)
            echo ""
            echo "🚂 Deploying to Railway with Supabase DB..."
            echo ""
            
            if ! command -v railway &> /dev/null; then
                echo "Installing Railway CLI..."
                npm install -g @railway/cli
            fi
            
            cd backend
            railway login
            railway init
            
            echo ""
            echo "Set your Supabase Connection String:"
            read -p "DATABASE_URL: " db_url
            railway variables set DATABASE_URL="$db_url"
            railway variables set DB_SSL="true"
            railway variables set NODE_ENV="production"
            
            railway up
            cd ..
            ;;
        3)
            echo ""
            echo "📦 Deploying to Heroku..."
            echo ""
            
            if ! command -v heroku &> /dev/null; then
                echo "Please install Heroku CLI first:"
                echo "brew tap heroku/brew && brew install heroku"
                exit 1
            fi
            
            heroku login
            
            echo ""
            read -p "Enter app name (e.g., gym-nexus-backend): " app_name
            
            heroku create $app_name
            heroku addons:create heroku-postgresql:essential-0 -a $app_name
            
            echo ""
            echo "Deploying..."
            git subtree push --prefix backend heroku main
            
            echo ""
            echo "✅ Backend deployed!"
            echo "URL: https://$app_name.herokuapp.com"
            ;;
    esac
}

deploy_admin() {
    echo ""
    echo "⚙️ Admin Panel Deployment Options:"
    echo "1. Vercel (Recommended)"
    echo "2. Netlify"
    echo ""
    read -p "Choose platform (1-2): " platform
    
    case $platform in
        1)
            echo ""
            echo "▲ Deploying to Vercel..."
            echo ""
            
            if ! command -v vercel &> /dev/null; then
                echo "Installing Vercel CLI..."
                npm install -g vercel
            fi
            
            cd admin
            
            echo "Logging in to Vercel..."
            vercel login
            
            echo ""
            echo "Deploying admin panel..."
            vercel
            
            echo ""
            read -p "Deploy to production? (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                vercel --prod
            fi
            
            echo ""
            echo "✅ Admin panel deployed!"
            
            cd ..
            ;;
        2)
            echo ""
            echo "📝 Deploying to Netlify..."
            echo ""
            echo "Please follow these steps:"
            echo "1. Go to https://netlify.com"
            echo "2. Click 'Add new site' → 'Import an existing project'"
            echo "3. Connect to GitHub and select gym-nexus"
            echo "4. Configure:"
            echo "   - Base directory: admin"
            echo "   - Build command: npm run build"
            echo "   - Publish directory: .next"
            echo "5. Click 'Deploy site'"
            echo ""
            read -p "Press Enter when done..."
            ;;
    esac
}

case $choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_admin
        ;;
    3)
        deploy_backend
        deploy_admin
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📚 For more details, see SUPABASE_DEPLOYMENT.md"
echo ""
