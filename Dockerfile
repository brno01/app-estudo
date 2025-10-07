FROM node:latest-alpine

# Upgrade Alpine packages to fix vulnerabilities
RUN apk upgrade --no-cache

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]