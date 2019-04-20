FROM node:lts-alpine

WORKDIR /app
COPY . /app

RUN yarn

EXPOSE 9000
CMD ["yarn", "run", "serve"]
