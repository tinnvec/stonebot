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

const bnetServerChoices = ['americas', 'na', 'europe', 'eu', 'asia']
export const bnetServer = {
    key: 'bnetServer',
    prompt: 'which battle.net server do you play on?\n',
    type: 'string',
    parse: value => {
        value = value.toLowerCase()
        if (value === 'na') { return 'americas' }
        if (value === 'eu') { return 'europe'}
        return value
    },
    validate: value => {
        if (bnetServerChoices.includes(value.toLowerCase())) { return true }
        return `please choose a server from \`${bnetServerChoices.join('`, `')}\`.\n`
    }
}

export const bnetId = {
    key: 'bnetId',
    prompt: 'what is your battle.net id?\n',
    type: 'string'
}
