#!/bin/bash

# GitHub Actions SSH Key Generator
# This script helps you generate SSH keys for GitHub Actions deployment

set -e

echo "🔑 GitHub Actions SSH Key Generator"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Key filename
KEY_NAME="github_actions_fitflow"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
    echo -e "${YELLOW}⚠️  SSH key already exists at: $KEY_PATH${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Generate SSH key
echo -e "${BLUE}📝 Generating SSH key pair...${NC}"
ssh-keygen -t ed25519 -C "github-actions@fitflow.id" -f "$KEY_PATH" -N ""

echo ""
echo -e "${GREEN}✅ SSH key pair generated!${NC}"
echo ""

# Display public key
echo -e "${BLUE}📋 PUBLIC KEY (add this to Plesk):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$KEY_PATH.pub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copy public key to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    cat "$KEY_PATH.pub" | pbcopy
    echo -e "${GREEN}✅ Public key copied to clipboard!${NC}"
fi

echo ""
echo -e "${YELLOW}📌 Next steps:${NC}"
echo "1. Add the public key to Plesk:"
echo "   Plesk → SSH Access → Authorized Keys → Add Key"
echo ""
echo "2. Or upload via SSH:"
echo "   ssh-copy-id -i $KEY_PATH.pub your-username@your-server.com"
echo ""

# Display private key
echo -e "${BLUE}🔐 PRIVATE KEY (add this to GitHub Secret):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$KEY_PATH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copy private key to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    echo -e "${YELLOW}Copy private key to clipboard? (y/N):${NC}"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat "$KEY_PATH" | pbcopy
        echo -e "${GREEN}✅ Private key copied to clipboard!${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📌 Add to GitHub:${NC}"
echo "1. Go to: https://github.com/falconilham/gym-nexus/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: SSH_PRIVATE_KEY"
echo "4. Value: Paste the private key (including -----BEGIN and -----END)"
echo ""

echo -e "${GREEN}🎉 Done! Your SSH keys are ready for GitHub Actions.${NC}"
echo ""
echo "Key files:"
echo "  Private: $KEY_PATH"
echo "  Public:  $KEY_PATH.pub"
echo ""
