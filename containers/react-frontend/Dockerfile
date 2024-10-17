FROM node:22-bookworm-slim


WORKDIR /app

COPY ./package.json package.json

RUN npm install

COPY ./src/ src/

# RUN npm run build

EXPOSE 8002

# Start the application
CMD [ "npm", "run", "start" ]
