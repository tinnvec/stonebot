FROM ubuntu:16.04

# Add dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_7.x | bash && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y build-essential ffmpeg nodejs python yarn && \
    apt-get autoremove -y

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json \
    yarn.lock \
    .yarnclean \
    gulpfile.js \
    tsconfig.json \
    ./
RUN yarn

# Copy app source
COPY src ./src

CMD yarn start
