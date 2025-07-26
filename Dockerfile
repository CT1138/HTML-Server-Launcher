# BEGIN NODE SERVER SETUP
    FROM node:18-alpine as build

    # Get Dependencies
    RUN apk add --no-cache python3 make g++

    # Make working directory
    WORKDIR /app

    COPY backend/package*.json ./
    RUN npm install

    COPY backend/ ./
    COPY frontend/public/ /usr/share/nginx/html
    # Environment Variables... 
    # SRVPORT needs to be 3001 unless you edit /frontend/public/script/statistics.js
    ARG SRVPORT=3001
    ARG SRVHOST=localhost
    ENV SRVPORT=$SRVPORT
    ENV SRVHOST=$SRVHOST

# END NODE SETUP
# BEGIN NGINX SERVER SETUP
    FROM nginx:alpine

    # Move the website data and backend over
    COPY --from=build /frontend-static /usr/share/nginx/html
    COPY --from=build /app /app

# END NGINX SETUP
# Finally, expose ports and run setup script
    EXPOSE 80 3001
    CMD ["/bin/sh", "/app/start.sh"]