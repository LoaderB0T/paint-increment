# stage 1

ARG skipBuild=false

FROM node:16

# ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

RUN npm i -g pnpm

COPY ./api/package.json .
COPY ./api/pnpm-lock.yaml .
RUN node -v

RUN pnpm i

COPY ./api .
COPY ./app/src/app/models/ws-event-definitions.model.ts ./src/models

RUN pnpm run build

EXPOSE 80

ENV PORT 80

CMD pnpm run start:prod
