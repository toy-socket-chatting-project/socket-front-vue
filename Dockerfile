FROM node:16-alpine3.18

WORKDIR /app
COPY . .

RUN npm ci

RUN npm run build

ENTRYPOINT npm run start