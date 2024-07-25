
FROM node:21-alpine3.17

WORKDIR /app

RUN apk add bash

RUN npm update npm -g
RUN npm install nodemon -g
RUN npm install knex -g
RUN npm install @nestjs/core -g
RUN npm install nestjs -g
RUN npm install uuid -g

ENTRYPOINT (sed -i 's/\r$//' ./run.sh) ; (chmod +x ./run.sh) ; ./run.sh
