# stage 1

ARG skipBuild=false

FROM node:16 as builder

ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

COPY ./api/package.json .
COPY ./api/yarn.lock .
RUN node -v

RUN yarn install

COPY ./api .
COPY ./app/src/app/models/ws-event-definitions.model.ts ./src/models

RUN yarn build

# stage 2

FROM node:16.14.2-alpine3.15

COPY --from=builder /app /app

EXPOSE 80

ENV PORT 80

CMD yarn start:prod
