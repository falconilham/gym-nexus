#!/bin/bash

# GymNexus - Push to GitHub Script
# This script helps you push your monorepo to GitHub

echo "🚀 GymNexus Monorepo - GitHub Push Helper"
echo "=========================================="
echo ""

# Check if we already have a remote
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote 'origin' already configured:"
    git remote get-url origin
    echo ""
    read -p "Do you want to push to this remote? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 Pushing to GitHub..."
        git push -u origin main
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 View your repository at: $(git remote get-url origin | sed 's/\.git$//')"
    fi
else
    echo "⚠️  No remote repository configured yet."
    echo ""
    echo "Choose an option:"
    echo "1. Use GitHub CLI (recommended if logged in)"
    echo "2. Add remote manually"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    echo ""
    
    if [ "$choice" = "1" ]; then
        # Check if gh is installed and authenticated
        if ! command -v gh &> /dev/null; then
            echo "❌ GitHub CLI (gh) is not installed."
            echo "Install it from: https://cli.github.com/"
            exit 1
        fi
        
        if ! gh auth status &> /dev/null; then
            echo "🔐 Please login to GitHub first:"
            gh auth login
        fi
        
        echo ""
        read -p "Repository name (default: gym-nexus): " repo_name
        repo_name=${repo_name:-gym-nexus}
        
        echo ""
        read -p "Make repository private? (y/n, default: n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            visibility="--private"
        else
            visibility="--public"
        fi
        
        echo ""
        echo "📦 Creating repository '$repo_name' and pushing..."
        gh repo create "$repo_name" $visibility --source=. --remote=origin --push
        
        echo ""
        echo "✅ Repository created and code pushed!"
        echo "🌐 View at: https://github.com/$(gh api user -q .login)/$repo_name"
        
    elif [ "$choice" = "2" ]; then
        echo "Please enter your GitHub repository URL"
        echo "Example: https://github.com/username/gym-nexus.git"
        read -p "URL: " repo_url
        
        if [ -z "$repo_url" ]; then
            echo "❌ No URL provided. Exiting."
            exit 1
        fi
        
        echo ""
        echo "📝 Adding remote origin..."
        git remote add origin "$repo_url"
        
        echo "📤 Pushing to GitHub..."
        git push -u origin main
        
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 View your repository at: $(echo $repo_url | sed 's/\.git$//')"
    else
        echo "❌ Invalid choice. Exiting."
        exit 1
    fi
fi

echo ""
echo "📊 Repository stats:"
echo "   - Commits: $(git rev-list --count HEAD)"
echo "   - Files: $(git ls-files | wc -l | xargs)"
echo "   - Branch: $(git branch --show-current)"
echo ""
echo "🎉 All done!"
