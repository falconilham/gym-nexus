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
echo "1. Backend (API)"
echo "2. Admin Panel"
echo "3. Both"
echo ""
read -p "Enter your choice (1-3): " choice

deploy_backend() {
    echo ""
    echo "📦 Backend Deployment Options:"
    echo "1. Railway (Recommended)"
    echo "2. Render"
    echo "3. Heroku"
    echo ""
    read -p "Choose platform (1-3): " platform
    
    case $platform in
        1)
            echo ""
            echo "🚂 Deploying to Railway..."
            echo ""
            
            if ! command -v railway &> /dev/null; then
                echo "Installing Railway CLI..."
                npm install -g @railway/cli
            fi
            
            cd backend
            
            echo "Logging in to Railway..."
            railway login
            
            echo ""
            echo "Initializing project..."
            railway init
            
            echo ""
            read -p "Do you want to add PostgreSQL database? (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                railway add
            fi
            
            echo ""
            echo "Deploying backend..."
            railway up
            
            echo ""
            echo "✅ Backend deployed!"
            echo "Get your URL with: railway domain"
            
            cd ..
            ;;
        2)
            echo ""
            echo "📝 Deploying to Render..."
            echo ""
            echo "Please follow these steps:"
            echo "1. Go to https://render.com"
            echo "2. Click 'New +' → 'Web Service'"
            echo "3. Connect your GitHub repository: gym-nexus"
            echo "4. Configure:"
            echo "   - Root Directory: backend"
            echo "   - Build Command: npm install"
            echo "   - Start Command: npm start"
            echo "5. Add PostgreSQL database from dashboard"
            echo "6. Set environment variables"
            echo ""
            read -p "Press Enter when done..."
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
echo "📚 For more details, see DEPLOYMENT.md"
echo ""
