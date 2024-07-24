#!/bin/bash

npm install

if [ "$USE_DEV_MODE" = "true" ]; then
    npm run start:dev
else
    npm run start
fi

