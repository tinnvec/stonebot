Monitors Text Channels for `::card name::` in messages and responds with the card information.

# [](#usage)Usage

Double colons `::` around `card name` for default output.  
Collectible cards will be favored over uncollectible ones in the results.

`::frostbolt::`

> **Frostbolt**  
> 2 Mana Mage Spell  
> **Text**  
> Deal $3 damage to a character and **Freeze** it.

Using `@` before `card name` will search uncollectible cards only

`::@jaraxxus::`

> **Lord Jaraxxus**  
> Warlock Hero

## [](#add-ons)Add-ons

Additional information about cards can be obtained using add-ons.  
To use an add-on, after the card name, add a question mark `?` followed by the add-on name

### Flavor

`::devolve?flavor::`

> **Devolve**  
> 2 Mana Shaman Spell  
> **Text**  
> Transform all enemy minions into random ones that cost (1) less.  
> **Flavor**  
> Ragnaros looked down. He looked like some kind of War Golem. "WHAT HAVE YOU DONE TO ME," he yelled. But all that came out was a deep grinding sound. He began to cry.

### Art

`::raza?art::`

> **Raza the Chained**  
> 5 Mana 5/5 Priest Minion  
> **Text**  
> [x] Battlecry: If your deck has no duplicates, your Hero Power costs (0) this game.  
> ![](https://art.hearthstonejson.com/v1/512x/CFM_020.jpg)

### Image

`::firey win axe?image::`

> ![](http://media.services.zam.com/v1/media/byName/hs/cards/enus/CS2_106.png)

### Gold

`::twisting nether?gold::`

> ![](http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/EX1_312_premium.gif)

### Sound

In addition to printing the default output, if you are in a voice channel, stonebot will join your voice channel and play the requested sound of the card.

There are 3 variations to the sound addon:

* `?sound` or `?sound-play`: The play sound
* `?sound-attack`: The attack sound
* `?sound-trigger`: The trigger sound
* `?sound-death`: The death sound

# [](#make-stonebot-your-friend)Make Stonebot Your Friend

[![Add Stonebot to your Server][discord-add-badge]][discord-oauth-link]

[discord-oauth-link]: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456
[discord-add-badge]: https://img.shields.io/badge/Discord-Invite%20Stonebot-7289DA.svg?style=flat-square

Want to add stonebot to your server? I run a public version that you can invite to your server with the button at the top of this section, or the following url: [https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456](https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456)

You can also run your own version with docker, using the information below.

# [](#make-stonebot-your-friend)Make Stonebot Your Friend

[![Add Stonebot to your Server][discord-add-badge]][discord-oauth-link]

[discord-oauth-link]: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456
[discord-add-badge]: https://img.shields.io/badge/Discord-Invite%20Stonebot-7289DA.svg?style=flat-square

Want to add stonebot to your server? I run a public version that you can invite to your server with the button at the top of this section, or the following url: [https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456](https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456)

You can also run your own version with docker, using the information below.

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


