#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'lib/stonebot'

stonebot = Stonebot.new('config/config.yml')

stonebot.start

# Invite link
# https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456