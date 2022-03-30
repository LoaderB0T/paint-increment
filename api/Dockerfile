# stage 1

ARG skipBuild=false

FROM node:16

ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

COPY ./api/package.json .
COPY ./api/yarn.lock .
RUN node -v

RUN yarn install

COPY ./api .
COPY ./app/src/app/models/ws-event-definitions.model.ts ./src/models

RUN yarn build

EXPOSE 80

ENV PORT 80

CMD yarn start:prod
