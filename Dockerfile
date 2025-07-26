# BEGIN NODE SERVER SETUP
    FROM node:18-alpine as build

    WORKDIR /backend

    COPY package*.json ./
    RUN npm install

    COPY . .

    # Environment Variables... 
    # SRVPORT needs to be 3001 unless you edit /frontend/public/script/statistics.js
    ARG SRVPORT=3001
    ARG SRVHOST=localhost
    ENV SRVPORT=$SRVPORT
    ENV SRVHOST=$SRVHOST

# END NODE SETUP
# BEGIN NGINX SERVER SETUP
    FROM nginx:alpine

    # Move the website data over
    COPY --from=build /app/public /usr/share/nginx/html
    COPY /frontend/nginx.conf /etc/nginx/nginx.conf
    COPY --from=build /app /app

# END NGINX SETUP
# Finally, expose ports and run setup script
    EXPOSE 80 3001
    CMD ["/bin/sh", "/app/start.sh"]