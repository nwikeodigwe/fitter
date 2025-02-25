#!/bin/sh
MAX_RETRIES=10
RETRY_DELAY=2
RETRY_COUNT=0

echo "Applying database schema..."
if ! npx prisma db push; then
  echo "Database schema push failed! Exiting."
  exit 1
fi

echo "Running migrations..."
RETRY_COUNT=0

until echo "yes" | npx prisma migrate dev; do
  echo "Migration failed. Retrying in $RETRY_DELAY seconds..."
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Migration failed after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  sleep $RETRY_DELAY
done

echo "Migrations complete! Starting app..."
exec npm start