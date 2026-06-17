#!/bin/sh
set -e

echo "🚀 Running database migrations..."

npx prisma migrate deploy --config=src/prisma.config.ts

echo "✅ Migrations done"

echo "▶️ Starting application..."

exec "$@"