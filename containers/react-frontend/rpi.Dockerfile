ARG REACT_APP_BACKEND_URL
ARG REACT_APP_MAPBOX_TOKEN

FROM arm64v8/node:22-slim AS base

ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
ENV REACT_APP_MAPBOX_TOKEN=${REACT_APP_MAPBOX_TOKEN}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app


FROM base AS prod-deps
COPY ./package.json /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod 


FROM base AS build
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
ENV REACT_APP_MAPBOX_TOKEN=${REACT_APP_MAPBOX_TOKEN}
COPY ./package.json ./package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY ./public ./public
COPY ./src ./src
RUN pnpm build


FROM nginx:alpine

ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
ENV REACT_APP_MAPBOX_TOKEN=${REACT_APP_MAPBOX_TOKEN}
COPY --from=build /app/build/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
