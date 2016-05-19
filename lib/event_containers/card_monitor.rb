# file: lib/event_containers/card_monitor.rb

require 'reverse_markdown'
require 'yaml'

require_relative '../services/hearthstone_api'

module CardMonitor
    extend Discordrb::EventContainer

    HS_CARD_REGEX = Regexp.new('\[(.+?)\]')
    CARD_SET_BLACKLIST = [ 'Credits', 'Debug', 'Missions', 'System', 'Hero Skins', 'Tavern Brawl' ]
    CARD_TYPE_WHITELIST = [ 'Minion', 'Spell', 'Weapon' ]

    def self.get_hs_api
        config = YAML.load(File.open 'config/config.yml')
        Services::HearthstoneApi.new(config[:hearthstone_api][:mashape_key])
    end

    @@hearthstone_api = self.get_hs_api

    message(contains: HS_CARD_REGEX) do |event|
        card_names = event.message.content.scan(HS_CARD_REGEX).flatten

        card_names.each do |card_name|
            cards = @@hearthstone_api.get_cards_by_name(card_name)
            cards.select! { |card| CARD_TYPE_WHITELIST.include?(card['type']) && !CARD_SET_BLACKLIST.include?(card['cardSet']) }

            cards = @@hearthstone_api.get_cards_by_partial_name(card_name) if cards.empty?
            cards.select! { |card| CARD_TYPE_WHITELIST.include?(card['type']) && !CARD_SET_BLACKLIST.include?(card['cardSet']) }

            if cards.empty?
                event.respond "Sorry, I couldn't find any cards like '#{card_names.join(', ')}'"
            elsif cards.count > 1
                result_card_names = cards.map { |card| card['name'] }
                event.respond "I found several matches, did you mean one of these?\r\n#{result_card_names.join ', '}"
            else
                card = cards.first
                reply = "#{card['name']} - #{card['cardSet']}"
                reply += "\n#{card['cost']} Mana"
                reply += " #{card['attack']}/#{card['health']}" if card['type'] === 'Minion'
                reply += " #{card['attack']}/#{card['durability']}" if card['type'] === 'Weapon'
                reply += " #{card['type']}"
                reply += "\n#{ReverseMarkdown.convert(card['text'])}"
                # reply += "\n#{card['img']}"
                event.respond(reply)
            end
        end
    end
end
