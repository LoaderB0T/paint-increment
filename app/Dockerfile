# stage 1

ARG skipBuild=false

FROM node:16.14.2-alpine3.15 AS builder

# ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

RUN npm i -g pnpm

COPY ./app/package.json .
COPY ./app/pnpm-lock.yaml .
RUN pnpm i

COPY ./app .
COPY ./api/swagger.json .

RUN pnpm run codegen-docker
RUN pnpm run build

# stage 2

FROM nginx:alpine

COPY ./app/config/angular.conf /etc/nginx/angular.conf
COPY ./app/config/nginx.conf /etc/nginx/nginx.conf
COPY ./app/config/security-headers.conf /etc/nginx/security-headers.conf

COPY --from=builder /app/dist/paint-increment-client /usr/share/nginx/html

EXPOSE 80
