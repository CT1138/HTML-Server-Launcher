# BEGIN NODE SERVER SETUP
    FROM node:18-alpine AS build

    # Get Dependencies
    RUN apk add --no-cache python3 make g++

    # Make working directory
    WORKDIR /app

    COPY backend/package*.json ./
    RUN npm install

    COPY backend/ ./
    COPY frontend/ /frontend-static/

# END NODE SETUP
# BEGIN NGINX SERVER SETUP
    FROM nginx:alpine

    # Move the website data and backend over
    COPY --from=build /frontend-static /usr/share/nginx/html
    COPY --from=build /app /app
    COPY start.sh /app/start.sh
# END NGINX SETUP
# Finally, expose ports and run setup script
    EXPOSE 80 2999
    CMD ["/bin/sh", "/app/start.sh"]