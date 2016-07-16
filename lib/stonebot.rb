# frozen_string_literal: true
require 'discordrb'
require 'yaml'

require_relative 'event_containers/card_monitor.rb'
require_relative 'services/hearthstone_api'

# Stonebot
class Stonebot
  def initialize(config_file)
    @config = YAML.load(File.open(config_file))

    @hearthstone_api = Services::HearthstoneApi
                       .new(@config[:hearthstone_api][:mashape_key])

    @discord_bot = Discordrb::Bot.new(
      token:			config[:discord][:token],
      application_id:	config[:discord][:application_id]
    )
  end

  def start
    @discord_bot.include! CardMonitor
    @discord_bot.run
  end

  private

  attr_accessor :config, :discord_bot, :hearthstone_api
end
