FROM node:18 as base

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update && apt-get upgrade -y

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "node", "index.js" ]