FROM node:19

LABEL maintainer "Informatie Vlaanderen <informatievlaanderen@vlaanderen.be>"

COPY / /app
WORKDIR /app/dependencies/wait-for-postgres

# RUN npm install
# If you are building your code for production
RUN npm ci
WORKDIR /app
RUN npm ci

RUN npm run build

CMD [ "node", "lib/api.js" ]
