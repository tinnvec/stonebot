# Invite link
# https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456

require 'discordrb'
require 'yaml'

require_relative 'lib/services/hearthstone_api'

config = YAML.load(File.open 'config.yml')

bot = Discordrb::Bot.new(
	token:			config[:discord][:token],
	application_id:	config[:discord][:application_id])

hearthstone_api = Services::HearthstoneApi.new(config[:hearthstone_api][:mashape_key])

hs_card_regex = Regexp.new('.*\[(.*)\].*')
bot.message(contains: hs_card_regex) do |event|
	card_name = hs_card_regex.match(event.message.content)[1]
	event.respond hearthstone_api.find_gold_card(card_name)
end

bot.run
