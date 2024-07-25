#!/bin/bash

npm install

npx prisma generate

npm install uuid
npm install @types/uuid --save-dev

if [ "$USE_DEV_MODE" = "true" ]; then
    npm run start:dev
else
    npm run start
fi
