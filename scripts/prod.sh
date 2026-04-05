#!/bin/bash
# scripts/prod.sh
# Usage: ./scripts/prod.sh "npx prisma migrate deploy"
# Usage: ./scripts/prod.sh "ADMIN_EMAIL=me@email.com npx tsx prisma/make-admin.ts"

# Load prod environment variables from .env.prod
set -a
source .env.prod
set +a

# Run whatever command was passed
eval "$@"