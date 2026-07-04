FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
# The port that your backend runs on internally
EXPOSE 8096 
CMD ["npm", "start"]
