require 'httparty'
require 'fuzzy_match'

module Services
	class HearthstoneApi
		include HTTParty

		base_uri 'https://omgvamp-hearthstone-v1.p.mashape.com'

		def initialize(mashape_key, locale='enUS')
			@locale = locale
			@mashape_key = mashape_key

			populate_card_names
		end

		def find_gold_card(name)
			found_name = FuzzyMatch.new(@card_names).find(name)
			return "No card found for \"#{name}\"" if found_name == nil
			return request_gold_card_image URI.encode(found_name)
		end

		private

			attr_accessor :locale, :mashape_key, :card_names

			def populate_card_names
				@card_names = Array.new
				sets = request_all_card_sets
				sets.each do |set_name, cards|
					cards.each do |card|
						@card_names << card['name']
					end
				end
			end

			def request_all_card_sets
				set_names_blacklist = ['Credits', 'Debug', 'Missions', 'System', 'Hero Skins', 'Tavern Brawl']
				all_card_sets = make_request('/cards')
				all_card_sets.reject! { |set_name, cards| set_names_blacklist.include?(set_name) }
				return all_card_sets
			end

			def request_gold_card_image(name)
				response = request_single_card(name)
				return response['imgGold'] if response.is_a?(Hash)
				return response
			end

			def request_single_card(name)
				data = make_request("/cards/#{name}")[0]
				return data
			end

			def make_request(path, options={})
				options = options.merge({
					headers: {
						'X-Mashape-Key': @mashape_key,
						Accept: 'application/json'
					}
				})
				response = self.class.get(path, options)
				JSON.parse(response.body)
			end
	end
end

# [
# 	{
# 		'mechanics': [
# 			{
# 				'name': 'Overload'
# 			}
# 		],
# 		'collectible': True,
# 		'race': 'Totem',
# 		'name': 'Totem Golem',
# 		'img': 'http://wow.zamimg.com/images/hearthstone/cards/enus/original/AT_052.png',
# 		'artist': u'Steve Prescott',
# 		'locale': u'enUS',
# 		u'text': u'<b>Overload: (1)</b>',
# 		u'rarity': u'Common',
# 		u'attack': 3,
# 		u'cost': 2,
# 		u'health': 4,
# 		u'cardId': u'AT_052',
# 		u'imgGold': u'http://wow.zamimg.com/images/hearthstone/cards/enus/animated/AT_052_premium.gif',
# 		u'flavor': u'What happens when you glue a buncha totems together.',
# 		u'type': u'Minion',
# 		u'playerClass': u'Shaman',
# 		u'cardSet':
# 		u'The Grand Tournament'
# 	}
#]
