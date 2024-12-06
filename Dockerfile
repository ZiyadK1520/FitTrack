# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or just package.json if you don't use the lock file)
COPY backend/package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "backend/main.js"]
