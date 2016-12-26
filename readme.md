[![Add Stonebot to your Server][discord-add-badge]][discord-oauth-link]
[![Join Chatrealm][discord-chatrealm-badge]][discord-chatrealm-link]
[![Chatrealm IRC][chatrealm-badge]][chatrealm-link]

# Stonebot
Reacts to one or more `::card name::` with the card information.

Want to add stonebot to your server?  
I run a public version that you can invite to your server with the button at the top of this readme, or the following url: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456

You can also run your own version with docker, using the information at the end of this readme.

## Usage

Double colons `::` around `card name` for default output
```
::frostbolt::

Frostbolt - 2 Mana Mage Spell
Deal $3 damage to a character and Freeze it.
```

**Addons**  
Single question mark `?` followed by `addon` after `card name`  
Where `addon` is one of `flavor`, `art`, `image`, or `gold`
```
::frostbolt?flavor::

Frostbolt - 2 Mana Mage Spell
Deal $3 damage to a character and Freeze it.
It is customary to yell "Chill out!" or "Freeze!" or "Ice ice, baby!" when you play this card.

::frostbolt?art::

https://art.hearthstonejson.com/v1/512x/CS2_024.jpg

::frostbolt?image::

http://media.services.zam.com/v1/media/byName/hs/cards/enus/CS2_024.png

::frostbolt?gold::

http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/CS2_024_premium.gif
```

## Docker Instructions
```bash
# Clone the repository
git clone https://github.com/tinnvec/stonebot.git
cd stonebot

# Rename sample config file
cp src/config/config.sample.js src/config/config.js

# Edit src/config/config.js with desired settings

# Build and run docker image
docker build -t stonebot .
docker run -d --name stonebot stonebot
```

[discord-oauth-link]: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456
[discord-add-badge]: https://img.shields.io/badge/Discord-Invite%20Stonebot-7289DA.svg?style=flat-square

[discord-chatrealm-link]: https://discord.gg/0vQgQWIkKVUryD0z
[discord-chatrealm-badge]: https://img.shields.io/badge/Discord-Chatrealm-7289DA.svg?style=flat-square

[chatrealm-link]: https://irc.chatrealm.net
[chatrealm-badge]: https://img.shields.io/badge/IRC-Chatrealm-orange.svg?style=flat-square