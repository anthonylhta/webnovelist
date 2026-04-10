#!/bin/bash

# Check if a commit message was provided
if [ -z "\$1" ]; then
  echo "❌ Please provide a commit message"
  echo "Usage: ./commit.sh \"your commit message\""
  exit 1
fi

git add .
git commit -m "\$1"
git push

echo "✅ Committed and pushed!"