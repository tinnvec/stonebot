# Utility

## <a name="stats"></a>stats

Displays bot statistics. Bot owner(s) only.

**Format**: `!stats`

## <a name="help"></a>help

Displays a list of available commands, or detailed information for a specified command.

The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.

**Format**: `!help [command]`  
**Alias**: commands  
**Examples**

- `!help`
- `!help prefix`

## <a name="ping"></a>ping

Checks the bot's ping to the Discord server.

**Format**: `!ping`

## <a name="prefix"></a>prefix

Shows or sets the command prefix. Administrators only.

If no prefix is provided, the current prefix will be shown. If the prefix is "default", the prefix will be reset to the bot's default prefix. If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands. Only administrators may change the prefix.

**Format**: `!prefix [prefix/"default"/"none"]`  
**Examples**

- `!prefix`
- `!prefix -`
- `!prefix omg!`
- `!prefix default`
- `!prefix none`
