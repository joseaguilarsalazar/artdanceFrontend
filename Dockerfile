FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the server and the public directory
COPY . .

EXPOSE 3000

CMD ["npm", "start"]