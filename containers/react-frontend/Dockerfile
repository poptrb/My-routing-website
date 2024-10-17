FROM node:22-bookworm-slim


WORKDIR /app

RUN npm install create-react-app && \
    npx create-react-app temp && \
    cp -apr temp/* . && \
    rm -rf temp

RUN npm install

COPY ./src src

# RUN npm run build

EXPOSE 8002

# Start the application
CMD [ "npm", "run", "start" ]
