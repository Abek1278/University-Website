FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server ./server

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install

COPY client ./

RUN npm run build

WORKDIR /app

EXPOSE 5000

CMD ["node", "server/index.js"]
