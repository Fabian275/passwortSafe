FROM node:17-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY . ./
CMD ["npm", "start"]
