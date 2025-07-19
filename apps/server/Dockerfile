FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:dev"] 