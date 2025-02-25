FROM node:21-alpine

WORKDIR /app

RUN apk add --no-cache openssl libssl3
ENV OPENSSL_DIR=/usr/lib/ssl

COPY package*.json ./

RUN npm install
COPY . .
RUN npm install -g nodemon

RUN adduser -D -u 1010 theia && chown -R theia /app
USER theia

RUN chmod +x entrypoint.sh

EXPOSE 3000
