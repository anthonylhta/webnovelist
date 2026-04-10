#!/bin/bash
echo "🧹 Cleaning .next cache..."
rm -rf .next
echo "🚀 Starting dev server..."
npm run dev