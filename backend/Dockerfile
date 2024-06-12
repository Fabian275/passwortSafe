FROM node:17-alpine
RUN npm install -g nodemon
WORKDIR /backend
COPY package.json package-lock.json ./
RUN npm ci            
COPY . .              
CMD ["node", "Backend.js"]
