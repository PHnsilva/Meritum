#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding admin user..."
npm run prisma:seed || echo "[entrypoint] seed falhou ou foi ignorado (app continua subindo)"

echo "Starting application..."
exec npm run start
