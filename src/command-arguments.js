const cardName = {
    key: 'cardName',
    prompt: 'what card are you searching for?\n',
    type: 'string'
}

const soundKind = {
    key: 'soundKind',
    prompt: '',
    type: 'string',
    parse: value => { return value.toLowerCase() },
    default: 'play'
}

const listAction = {
    key: 'listAction',
    prompt: '',
    type: 'string',
    parse: value => { return value.toLowerCase() },
    default: 'list'
}

const bnetServerChoices = ['americas', 'america', 'na', 'europe', 'eu', 'asia']
const bnetServer = {
    key: 'bnetServer',
    prompt: 'which battle.net server do you play on?\n',
    type: 'string',
    parse: value => {
        value = value.toLowerCase()
        if (value === 'na' || value === 'america') { return 'americas' }
        if (value === 'eu') { return 'europe'}
        return value
    },
    validate: value => {
        if (bnetServerChoices.includes(value.toLowerCase())) { return true }
        return `please choose a server from \`${bnetServerChoices.join('`, `')}\`.\n`
    }
}

const bnetId = {
    key: 'bnetId',
    prompt: 'what is your battle.net id?\n',
    type: 'string',
    validate: value => {
        if (/\S+#\d+/.test(value)) { return true }
        return 'sorry, that doesn\'t look like a battle.net id. What is your battle.net id?\n'
    },
    default: ''
}

module.exports = { cardName, soundKind, listAction, bnetServer, bnetId }
