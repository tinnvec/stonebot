export const cardName = {
    key: 'cardName',
    prompt: 'what card are you searching for?\n',
    type: 'string'
}

export const soundKind = {
    key: 'soundKind',
    prompt: '',
    type: 'string',
    default: 'play'
}

export const bnetServer = {
    key: 'bnetServer',
    prompt: 'which battle.net server do you play on?\n',
    type: 'string',
    parse: value => { return value.toLowerCase() },
    validate: value => {
        if (['americas', 'europe', 'asia'].includes(value.toLowerCase())) { return true }
        return 'please choose a server from `americas`, `europe`, `asia`.\n'
    }
}

export const bnetId = {
    key: 'bnetId',
    prompt: 'what is your battle.net id?\n',
    type: 'string'
}
