# Command Management

## groups

Lists all command groups. Administrators only.

The argument must be the name/ID (partial or whole) of a command or command group.

**Format**: `!groups`  
**Aliases**: list-groups, show-groups, listgroups, showgroups

## enable

Enables a command or command group. Administrators only.

**Format**: `!enable <command/group>`  
**Aliases**: enable-command, cmd-on, command-on, enablecommand, cmdon, commandon  
**Examples**

- `!enable util`
- `!enable Utility`
- `!enable prefix`

## disable

Disables a command or command group. Administrators only.

The argument must be the name/ID (partial or whole) of a command or command group.

**Format**: `!disable <command/group>`  
**Aliases**: disable-command, cmd-off, command-off, disablecommand, cmdoff, commandoff  
**Examples**

- `!disable util`
- `!disable Utility`
- `!disable prefix`

## reload

Reloads a command or command group. Bot owner(s) only.

The argument must be the name/ID (partial or whole) of a command or command group. Providing a command group will reload all of the commands in that group.

**Format**: `!reload <command/group>`  
**Aliases**: reload-command, reloadcommand  
**Example**: `!reload some-command`

## load

Loads a new command. Bot owner(s) only.

The argument must be full name of the command in the format of `group:memberName`.

**Format**: `!load <command>`  
**Alias**: load-command, loadcommand  
**Example**: `!load some-command`

## unload

Unloads a command. Bot owner(s) only.

The argument must be the name/ID (partial or whole) of a command.

**Format**: `!unload <command>`  
**Aliases**: unload-command, unloadcommand  
**Example**: `!unload some-command`
