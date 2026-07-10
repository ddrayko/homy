FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "server.js"]
