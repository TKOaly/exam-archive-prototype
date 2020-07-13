FROM node:12-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 9001

CMD ["node", "dist/index.js"]