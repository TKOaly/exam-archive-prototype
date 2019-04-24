FROM node:lts-alpine

WORKDIR /app
COPY . /app

RUN yarn
RUN yarn build

CMD ["yarn", "run", "serve"]