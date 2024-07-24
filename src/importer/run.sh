#!/bin/bash

npm install

npm i axios -g
npm i cookie-parser -g
npm i nodemon -g
npm i cors -g
npm i axios -g
npm i express -g
npm i js-sha256 -g
npm i jsonwebtoken -g
npm i knex -g
npm i pg -g
npm i uuid -g

if [ "$USE_DEV_MODE" = "true" ]; then
    npm run watch
else
    npm run start
fi

