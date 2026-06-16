#!/bin/sh
set -e

echo "🚀 Running database migrations..."

npx prisma migrate deploy

echo "✅ Migrations done"

echo "▶️ Starting application..."

exec "$@"