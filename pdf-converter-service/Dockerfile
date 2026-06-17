# 1. Start with an official lightweight Node.js runtime as the base image
FROM node:25.5.0-slim

# 2. Install Ghostscript and GraphicsMagick on the Linux container
# Because we are using 'slim' Debian, we use 'apt-get' to install OS-level packages
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy package.json and package-lock.json first
COPY package*.json ./

# 5. Install Node.js dependencies inside the container
RUN npm install

# 6. Copy the rest of the application source code
COPY . .

# 7. Compile TypeScript code into JavaScript (dist/ folder)
RUN npm run build

# 8. Expose the port our app runs on
EXPOSE 4000

# 9. Start the server
CMD ["npm", "start"]