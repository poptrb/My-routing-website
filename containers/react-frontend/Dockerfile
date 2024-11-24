FROM arm64v8/node:22-slim

WORKDIR /app

COPY ./package.json package.json

RUN corepack enable pnpm

RUN pnpm install


COPY ./public public/
COPY ./src/ src/
# COPY ./craco.config.js craco.config.js
# RUN npm run build

EXPOSE 8002

# Start the application
CMD [ "npm", "run", "start" ]
