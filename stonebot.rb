# Invite link
# https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456

require 'discordrb'

require_relative 'lib/services/hearthstone_api'

bot = Discordrb::Bot.new(
	token: 'MTgxMDQyMTY0NDkzNDUxMjY0.ChjAJw.TBLiJ1UuLLxJ6-O5rjI1fGrBFkI',
	application_id: 181042164493451264)

hearthstone_api = Services::HearthstoneApi.new('DwEDGfQK1Kmshu4zl0nRQ73WYf0Vp1uPb04jsnZ4JeqrI8Kdaf')

bot.message(contains: /.*\[(.*)\].*/) do |event|
	cardname = /.*\[(.*)\].*/.match(event.message.content)[1]
	event.respond hearthstone_api.find_gold_card(cardname)
end

bot.run
