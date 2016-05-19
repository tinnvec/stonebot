require 'httparty'

module Services
    class HearthstoneApi
        include HTTParty

        base_uri 'https://omgvamp-hearthstone-v1.p.mashape.com'

        def initialize(mashape_key, locale='enUS')
            @locale = locale
            @mashape_key = mashape_key
        end

        # /info
        # Returns a list of current patch, classes, sets, types, factions,
        # qualities, races and locales.
        def get_info
            make_request("/info")
        end

        # /cards
        # Returns all available Hearthstone cards including non collectible cards.
        def get_all_cards
            make_request("/cards")
        end

        # /cards/{name}
        # Returns card by name or ID. This may return more then one card if they
        # share the same name. Loatheb returns both the card and the boss.
        def get_cards_by_name(card_name)
            make_request("/cards/#{card_name}")
        end

        # /cards/search/{name}
        # Returns cards by partial name.
        def get_cards_by_partial_name(card_name)
            make_request("/cards/search/#{card_name}")
        end

        # /cards/sets/{set}
        # Returns all cards in a set.
        # Example values: Blackrock Mountain, Classic.
        def get_cards_by_set(set_name)
            make_request("/cards/sets/#{set_name}")
        end

        # /cards/classes/{class}
        # Returns all the cards of a class.
        # Example values: Mage, Paladin.
        def get_cards_by_class(class_name)
            make_request("/cards/classes/#{class_name}")
        end

        # /cards/races/{race}
        # Returns all the cards of a certain race.
        # Example values: Mech, Murloc.
        def get_cards_by_tribe(tribe_name)
            make_request("/cards/races/#{tribe_name}")
        end

        # /cards/qualities/{quality}
        # Returns all the cards of a certain quality.
        # Example values: Legendary, Common.
        def get_cards_by_quality(quality)
            make_request("/cards/qualities/#{quality}")
        end

        # /cards/types/{type}
        # Returns all the cards of a certain type.
        # Example values: Spell, Weapon.
        def get_cards_by_type(type_name)
            make_request("/cards/types/#{type_name}")
        end

        # /cards/factions/{faction}
        # Returns all the cards of a certain faction. Example values: Horde, Neutral.
        def get_cards_by_faction(faction_name)
            make_request("/cards/factions/#{faction_name}")
        end

        # /cardbacks
        # Returns a list of all the card backs.
        def get_all_card_backs
            make_request("/cardbacks")
        end

        private

            attr_accessor :locale, :mashape_key

            def make_request(path, options={})
                defaults = {
                    headers: {
                        'X-Mashape-Key': @mashape_key,
                        Accept: 'application/json'
                    }
                }
                options = defaults.merge(options)
                response = self.class.get(URI.escape(path), options)
                JSON.parse(response.body)
            end
    end
end
