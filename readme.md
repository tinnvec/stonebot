# tl;dr

Hearthstone Bot for Discord. Features commands for card information and community features.

## Longer version

Stonebot is a [node.js](https://nodejs.org/) [Discord](https://discordapp.com/) bot, built using with [discord.js](https://discord.js.org/) and [Commando](https://github.com/Gawdl3y/discord.js-commando). Hearthstone card information is obtained using the [HearthstoneJSON](http://hearthstonejson.com/) API. Sound processing is done with [FFmpeg](https://ffmpeg.org/) through the use of [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

---

# Commands

# Card Information

Stonebot uses a fuzzy search when matching card names and returns the highest scoring result, favoring collectible cards over uncollectible ones. Using `@` before `<cardName>` will search uncollectible cards only.

## text

Displays card text.  

**Format**: `!text <cardName>`  
**Aliases**: txt, t, card, c  
**Examples**

- `!text frostbolt`
- `!t gadgetzan auctioneer`
- `!card yshaarj`
- `!c tinyfin`

## flavor

Displays card text and flavor text.

**Format**: `!flavor <cardName>`  
**Aliases**: f, flavor-text, flavortext  
**Examples**

- `!flavor devolve`
- `!f small time recruits`

## image

Displays card image.

**Format**: `!image <cardName>`  
**Aliases**: img, i  
**Examples**

- `!image fiery war axe`
- `!i brawl`

## gold

Displays golden card image.

**Format**: `!gold <cardName>`  
**Aliases**: g, gold-image, goldimage  
**Examples**

- `!gold twisting nether`
- `!g dragonfire potion`

## art

Displays the artist and full art from the card.

**Format**: `!art <cardName>`  
**Aliases**: a, art-image, artimage  
**Examples**

- `!art raza`
- `!a secretkeeper`

## sound

Plays card sound in your voice channel. (Usable only in servers)

`[soundKind]` can be one of `play`, `attack`, `death` or `trigger`. Optional.

**Format**: `!sound [soundKind] <cardName>`  
**Aliases**: snd, s  
**Examples**

- `!sound tirion`
- `!sound attack jaraxxus`
- `!snd death refreshment vendor`
- `!s trigger antonaidas`

## json

Displays JSON inormation for card.

**Format**: `!json <cardName>`  
**Example**: `!json jade golem`

# Community

## villager

List of community members with battle.net ids. (Usable only in servers)

You'll be are removed from the list if you leave the discord server.  
Responses from this command will be removed automatically after 10 minutes.  
`[action]` can be one of `list`, `add`, `remove`. Default: `list`.  
`<bnetServer>` can be one of `americas|america|na`, `europe|eu`, `asia`.  
`[bnetId]` is your battle.net id. Required only for `add` action.

**Format**: `!villager [action] <bnetServer> [bnetId]`  
**Aliases**: villagers, v, bnet, b  
**Examples**

- `!villager list americas`
- `!v na`
- `!bnet add europe User#1234`
- `!b remove asia`

## quest

Lists community members with the Hearhtstone Play a Friend (aka 80g) quest.

Quests are removed (expire) after 24 hours or if you leave the discord server.  
Responses from this command will be removed automatically after 10 minutes.  
`[action]` can be one of `list`, `add`, `remove`. Default: `list`.  
`<bnetServer>` can be one of `americas|america|na`, `europe|eu`, `asia`.  
`[bnetId]` is your battle.net id. Required only for `add` action, optional if you are on the villagers list.

**Format**: `!quest [action] <bnetServer> [bnetId]`  
**Aliases**: quests, q, 80g  
**Examples**

- `!quest list americas`
- `!q na`
- `!80g add europe User#1234`
- `!q remove asia`

# Utility

## util:help

Displays a list of available commands, or detailed information for a specified command.

The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.

**Format**: `!help [command]`  
**Alias**: commands  
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

[discord-oauth-link]: https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=3206144
[discord-add-badge]: https://img.shields.io/badge/Discord-Invite%20Stonebot-7289DA.svg?style=flat-square

Want to add stonebot to your server? I run a public version that you can invite to your server with the button at the top of this section, or the following url:  
https://discordapp.com/oauth2/authorize?client_id=181041901225377793&scope=bot&permissions=3206144

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
docker run -d --name stonebot --volumes-from stonebot-data stonebot
```
