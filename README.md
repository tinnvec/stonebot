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

## search

Searches for Hearthstone cards.

Works like Hearthstone collection searching.  
General search accross most visible card text in addition to several keywords.  
Set keywords: `nax`, `naxx`, `gvg`, `brm`, `tgt`, `loe`, `tog`, `wog`, `wotog`, `kara`, `msg`, `msog`.  
Value keywords: `attack`, `health`, `mana`, `artist`.  
Value keywords take the form of `<keyword>:<value>`.  
The `artist` keyword only accepts text without spaces.  
All other keywords use a numeric `<value>` with range options.  
`<value>` alone means exact value.  
`<value>-` means value or lower.  
`<value>+` means value or higher.  
`<value1>-<value2>` means between value1 and value2.  

**Format**: `!search <terms>...`  
**Alias**: find  
**Examples**

- `!search thermaplugg`
- `!search health:2+ battlecry`
- `!search artist:blizz`
- `!search mana:4- loe`
- `!search health:8+`
- `!search attack:3-5 mana:2-4 deathrattle`

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

## quest

Finds other players looking to trade the Play a Friend (aka 80g) quest.

Makes matches when players share a Discord server and Battle.net server region.

**Format**: `!quest <bnetServer>`  
**Aliases**: 80g  
**Examples**

- `!quest americas`
- `!80g eu`

# Utility

## stats

Displays bot statistics. Bot owner only. (Usable only in servers)

**Format**: `!stats`

## help

Displays a list of available commands, or detailed information for a specified command.

The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.

**Format**: `!help [command]`  
**Alias**: commands  
**Examples**

- `!help`
- `!help prefix`

## ping

Checks the bot's ping to the Discord server.

**Format**: `!ping`

## prefix

Shows or sets the command prefix.

If no prefix is provided, the current prefix will be shown. If the prefix is "default", the prefix will be reset to the bot's default prefix. If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands. Only administrators may change the prefix.

**Format**: `!prefix [prefix/"default"/"none"]`  
**Examples**

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
