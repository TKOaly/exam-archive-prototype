FROM node:10.16-alpine as build-deps

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn

COPY tsconfig.json ./
COPY public/ ./public/
COPY src/ ./src/

RUN ["yarn", "build"]

# Run with Nginx
FROM nginx:1.17-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html

EXPOSE 80
CMD ["sh", "-c", "nginx -g 'daemon off;'"]
