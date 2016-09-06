FROM ruby:2.3.1-alpine

RUN apk --update add --virtual build-dependencies ruby-dev build-base
RUN gem install bundler --no-ri --no-rdoc

RUN mkdir /usr/stonebot 
WORKDIR /usr/stonebot

COPY Gemfile Gemfile
RUN bundle install --without development test

RUN apk del build-dependencies

COPY startup.rb startup.rb
COPY lib lib
COPY config config

CMD bundle exec ruby startup.rb