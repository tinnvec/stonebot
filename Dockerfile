FROM node:latest

# Add FFMPEG
RUN apt-get update && apt-get install -y libav-tools

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
RUN npm install -g yarn
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn

# Copy app source
COPY . /usr/src/app

CMD yarn start