# frozen_string_literal: true
# file: lib/event_containers/card_monitor.rb

require 'hearthstone_json'
require 'fuzzy_match'
require 'reverse_markdown'


# CardMonitor module
module CardMonitor
  extend Discordrb::EventContainer

  HS_CARD_REGEX = Regexp.new('\[(.+?)\]')
  
  @cards_fz = FuzzyMatch.new(HearthstoneJSON.new.cards, read: 'name')
  @updated_at = DateTime.now

  def self.card_image_url(id, gold=false)
    result = 'https://wow.zamimg.com/images/hearthstone/cards/enus/'
    if gold
      result += "animated/#{id}_premium.gif"
    else 
      result += "original/#{id}.png"
    end
    result
  end

  message(contains: HS_CARD_REGEX) do |event|
    card_names = event.message.content.scan(HS_CARD_REGEX).flatten

    @cards_fz = FuzzyMatch.new(HearthstoneJSON.new.cards, read: 'name') if DateTime.now - @updated_at > (1/24)

    card_names.each do |card_name|
      card = @cards_fz.find(card_name)
      if card.nil?
        event.respond "Sorry, I couldn't find any cards like '#{card_name}'"
      else
        # reply = "#{card['name']} - #{card['set']}"
        # reply += "\n#{card['cost']} Mana"
        # reply += " #{card['attack']}/#{card['health']}" if card['type'] == 'MINION'
        # reply += " #{card['attack']}/#{card['durability']}" if card['type'] == 'WEAPON'
        # reply += " #{card['rarity']} #{card['type']}"
        # event.respond(reply)
        # event.respond("#{ReverseMarkdown.convert(card['text'])}") if card['text'] != ''
        # event.respond("#{ReverseMarkdown.convert(card['flavor'])}") if card['flavor'] != ''
        event.respond("#{card_image_url(card['id'])}")
      end
    end
  end
end
