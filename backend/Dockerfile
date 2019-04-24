FROM node:lts-alpine

EXPOSE 9001

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY . /app
RUN yarn build

CMD ["yarn", "run", "serve"]