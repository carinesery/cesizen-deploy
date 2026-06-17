#!/bin/sh
set -e

echo "🚀 Running database migrations..."

npx prisma migrate deploy \
  --config=src/prisma.config.ts \
  --schema=src/prisma/schema.prisma

echo "✅ Migrations done"

echo "▶️ Starting application..."

exec "$@"