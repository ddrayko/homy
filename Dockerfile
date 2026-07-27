FROM node:20-alpine

RUN apk upgrade --no-cache && \
    npm install -g npm@latest

WORKDIR /app
COPY package.json package-lock.json .
RUN npm install --production
COPY . .
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "server.js"]
