FROM arm64v8/node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app


FROM base AS prod-deps
COPY ./package.json /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod 


FROM base AS build
COPY ./src ./package.json ./public /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY ./src ./src
COPY ./public /public
COPY ./package.json ./package.json
RUN pnpm build


FROM nginx:alpine

COPY --from=build /app/build/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
