# Use a lightweight Node.js image
FROM node:20.16.0-slim

# Install necessary packages
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libu2f-udev \
    libvulkan1 \
    libxss1 \
    libgl1-mesa-glx \
    libxshmfence1 \
    xdg-utils \
    gconf-service \
    libx11-xcb1 \
    libx11-6 \
    libxss1 \
    dbus-x11 \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Install Chromium instead of Google Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port (replace with your app's port if necessary)
EXPOSE 5000


# Start the application
# CMD ["npm", "run", "dev"]

# Start the application
CMD ["npm", "start"]
