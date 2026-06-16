#!/bin/sh
set -e

echo "🚀 Running database migrations..."

npx prisma migrate deploy --schema=src/prisma/schema.prisma

echo "✅ Migrations done"

echo "▶️ Starting application..."

exec "$@"