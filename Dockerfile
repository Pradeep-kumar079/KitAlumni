# Use Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose backend port (change if needed)
EXPOSE 5000

# Start server
CMD ["npm", "start"]