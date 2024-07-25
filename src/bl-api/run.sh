#!/bin/bash

npm install

npx prisma generate

npm install uuid
npm install @types/uuid --save-dev
npm install @nestjs/axios
npm i cookie-parser -g

if [ "$USE_DEV_MODE" = "true" ]; then
    npm run start:dev
else
    npm run start
fi
