# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application (if applicable, e.g., for Next.js)
RUN pnpm build 

# Expose the port your application runs on (e.g., 3000 for Next.js)
EXPOSE 3000

# Define the command to run your application
CMD ["pnpm", "start"]
