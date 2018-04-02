# Card Information

Stonebot uses a fuzzy search when matching card names and returns the highest scoring result, favoring collectible cards over uncollectible ones. Using `@` before `<cardName>` will search uncollectible cards only.

## <a name="card"></a>card

Displays card information.

**Format**: `!text <cardName>`  
**Aliases**: c  
**Examples**

- `!card frostbolt`
- `!c tinyfin`

## <a name="image"></a>image

Displays card image.

**Format**: `!image <cardName>`  
**Aliases**: img, i  
**Examples**

- `!image fiery war axe`
- `!i brawl`

## <a name="gold"></a>gold

Displays golden card image.

**Format**: `!gold <cardName>`  
**Aliases**: g, gold-image, goldimage  
**Examples**

- `!gold twisting nether`
- `!g dragonfire potion`

## <a name="art"></a>art

Displays the artist and full art from the card.

**Format**: `!art <cardName>`  
**Aliases**: a, art-image, artimage  
**Examples**

- `!art raza`
- `!a secretkeeper`

## <a name="search"></a>search

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

## <a name="json"></a>json

Displays JSON inormation for card.

**Format**: `!json <cardName>`  
**Example**: `!json jade golem`
