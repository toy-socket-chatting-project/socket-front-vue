FROM node:16-alpine3.18

# WORKDIR /app

RUN npm -v
COPY . .
# COPY package.json .
# RUN chmod +x package.json

RUN npm i

COPY . /app/
RUN npm run build

ENTRYPOINT npm run start
# ENTRYPOINT echo start