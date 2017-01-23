# tl;dr

Hearthstone Bot for Discord. Features commands for card information and community features.

## Longer version

Stonebot is a [node.js](https://nodejs.org/) [Discord](https://discordapp.com/) bot, built using with [discord.js](https://discord.js.org/) and [Commando](https://github.com/Gawdl3y/discord.js-commando). Hearthstone card information is obtained using the [HearthstoneJSON](http://hearthstonejson.com/) API. Sound processing is done with [FFmpeg](https://ffmpeg.org/) through the use of [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

---

# Commands

# Card Information

Stonebot uses a fuzzy search when matching card names and returns the highest scoring result, favoring collectible cards over uncollectible ones. Using `@` before `<cardName>` will search uncollectible cards only.

## card:text

Displays card text.  

**Format**: `!text <cardName>`  
**Aliases**: `card`, `txt`, `t`, `c`, `🎴`, `🃏`, `📝`, `📜`, `📃`  
**Example**: `!text frostbolt`

> **Frostbolt**  
> 2 Mana Mage Spell  
> **Text**  
> Deal $3 damage to a character and **Freeze** it.

## card:text-flavor

Displays card text and flavor text.

**Format**: `!text-flavor <cardName>`  
**Aliases**: `flavor-text`, `flavor`, `f`, `🥓`, `🍗`, `🍿`, `🍰`  
**Example**: `!text-flavor devolve`

> **Devolve**  
> 2 Mana Shaman Spell  
> **Text**  
> Transform all enemy minions into random ones that cost (1) less.  
> **Flavor**  
> Ragnaros looked down. He looked like some kind of War Golem. "WHAT HAVE YOU DONE TO ME," he yelled. But all that came out was a deep grinding sound. He began to cry.

## card:image

Displays card image.

**Format**: `!image <cardName>`  
**Aliases**: `img`, `i`, `📷`, `📸`  
**Example**: `!image firey war axe`

![](http://media.services.zam.com/v1/media/byName/hs/cards/enus/CS2_106.png)

## card:image-gold

Displays golden card image.

**Format**: `!image-gold <cardName>`  
**Aliases**: `gold-image`, `gold`, `g`, `👑`  
**Example**: `!image-gold twisting nether`

![](http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/EX1_312_premium.gif)

## card:image-art

Displays the artist and full art from the card.

**Format**: `!image-art <cardName>`  
**Aliases**: `art-image`, `art`, `a`, `🖼`, `🎨`  
**Example**: `!image-art raza`

**Raza the Chained**  
**Artist**: James Ryman  
![](https://art.hearthstonejson.com/v1/512x/CFM_020.jpg)

## card:sound

Plays card sound in your voice channel.

`[soundKind]` can be one of `play`, `attack`, `death` or `trigger`. Optional.

**Format**: `!sound [soundKind] <cardName>`  
**Aliases**: `snd`, `s`, `🔈`, `🔉`, `🔊`, `🎧`, `🎵`  
**Examples**

- `!sound tirion`
- `!sound attack jaraxxus`
- `!sound death refreshment vendor`
- `!sound trigger antonaidas`

## card:json

Displays JSON inormation for card.

**Format**: `!json <cardName>`  
**Aliases**: `dev`, `info`, `🗡`  
**Example**: `!json jade golem`

```json
{
  "artist": "Konstantin Turovec",
  "attack": 1,
  "cost": 1,
  "dbfId": 42098,
  "health": 1,
  "id": "CFM_712_t01",
  "mechanics": [
    "JADE_GOLEM"
  ],
  "name": "Jade Golem",
  "playerClass": "NEUTRAL",
  "set": "GANGS",
  "type": "MINION"
}
```

# Community

## community:villager-list

Lists community member battle.net ids.

`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.

**Format**: `!villager-list <bnetServer>`  
**Aliases**: `villagers`, `v`, `bnet-list`, `bnet`, `b`, `🏠`  
**Examples**

- `!villager-list americas`
- `!villager-list europe`
- `!villager-list asia`

## community:villager-add

Adds your battle.net id to the community list.

`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.  
`<bnetId>` is your battle.net id.

**Format**: `!villager-add <bnetServer> <bnetId>`  
**Aliases**: `villagers-add`, `v-add`, `va`, `bnet-add`, `b-add`, `ba`, `🏡`  
**Examples**

- `!villager-add americas user#1234`
- `!villager-add europe user#1234`
- `!villager-add asia user#1234`

## community:villager-remove

Removes your battle.net id from the community list.

`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.

**Format**: `!villager-remove <bnetServer>`  
**Aliases**: `villager-rm`, `villagers-remove`, `villagers-rm`, `v-remove`, `v-rm`, `vr`,
                `bnet-remove`, `bnet-rm`, `b-remove`, `b-rm`, `br`, `🏚`  
**Examples**

- `!villager-remove americas`
- `!villager-remove europe`
- `!villager-remove asia`

## community:quest-list

Lists community members with the Hearhtstone Play a Friend (aka 80g) quest.

`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.

**Format**: `!quest-list <bnetServer>`  
**Aliases**: `quests`, `quests-list`, `q`, `80g-list`, `80g`, `💰`  
**Examples**

- `!quest-list americas`
- `!quest-list europe`
- `!quest-list asia`

## community:quest-add

Adds you to the list of community members with the Hearhtstone Play a Friend (aka 80g) quest.

`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`  
`[bnetId]` is your battle.net id. Optional if you are already on the `villager-list` for `<bnetServer>`

**Format**: `!quest-add <bnetServer> [bnetId]`  
**Aliases**: `quests-add`, `q-add`, `qa`, `80g-add`, `80ga`, `🤑`  
**Examples**

- `!quest-add americas user#1234`
- `!quest-add europe user#1234`
- `!quest-add asia user#1234`

## community:quest-remove

Removes you from the list of community members with the Hearhtstone Play a Friend (aka 80g) quest.

`<bnetServer>` can be one of `americas`, `na`, `europe`, `eu`, `asia`.

**Format**: `!quest-remove <bnetServer>`  
**Aliases**: `quests-remove`, `quests-rm`, `quest-rm`, `q-rm`, `qr`, `80g-rm`, `80gr`, `💸`  
**Examples**

- `!quest-remove americas`
- `!quest-remove europe`
- `!quest-remove asia`

# Utility

## util:help

Displays a list of available commands, or detailed information for a specified command.

The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.

**Format**: `!help [command]`  
**Alias**: `commands`  
**Examples**:

- `!help`
- `!help prefix`

## util:ping

Checks the bot's ping to the Discord server.

**Format**: `!ping`

## util:prefix

Shows or sets the command prefix.

If no prefix is provided, the current prefix will be shown. If the prefix is "default", the prefix will be reset to the bot's default prefix. If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands. Only administrators may change the prefix.

**Format**: `!prefix [prefix/"default"/"none"]`  
**Examples**:

- `!prefix`
- `!prefix -`
- `!prefix omg!`
- `!prefix default`
- `!prefix none`

---

# Make Stonebot Your Friend

[![Add Stonebot to your Server][discord-add-badge]][discord-oauth-link]

[discord-oauth-link]: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456
[discord-add-badge]: https://img.shields.io/badge/Discord-Invite%20Stonebot-7289DA.svg?style=flat-square

Want to add stonebot to your server? I run a public version that you can invite to your server with the button at the top of this section, or the following url:  
https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=19456

You can also run your own version with docker, using the information below.

## Docker Instructions

```bash
# Clone the repository
git clone https://github.com/tinnvec/stonebot.git
cd stonebot

# Rename sample config file
cp src/config.json.example src/config.json

# Edit src/config.json with desired settings

# Build Docker image
docker build -t stonebot .

# Create data container for persistent settings
docker run -v /data --name stonebot-data ubuntu:16.04

# Run stonebot container
docker run -d --restart on-failure --name stonebot --volumes-from stonebot-data stonebot
```
