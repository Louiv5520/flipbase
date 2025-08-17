#!/bin/bash

echo "========================================"
echo "    Auto GitHub Update Script"
echo "========================================"
echo ""

echo "Adding all changes to git..."
git add .

echo ""
echo "Committing changes..."
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Auto update: $timestamp"

echo ""
echo "Pushing to GitHub..."
git push origin main

echo ""
echo "========================================"
echo "    Update Complete!"
echo "========================================"
echo ""
read -p "Press Enter to continue"
