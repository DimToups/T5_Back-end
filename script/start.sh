#!/usr/bin/sh

npx prisma migrate deploy
node dist/prisma/seed.js
node dist/src/app.js
