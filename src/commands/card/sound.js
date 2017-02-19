const Card = require('../../card/card')
const { Command } = require('discord.js-commando')

const winston = require('winston')

class SoundCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sound',
            aliases: ['snd', 's'],
            group: 'card',
            memberName: 'sound',
            guildOnly: true,
            description: 'Plays card sound in your voice channel.',
            details: '`[soundKind]` can be one of `play`, `attack`, `death` or `trigger`. Optional.',
            format:'[soundKind] <cardName>',
            examples: [
                'sound tirion',
                'sound attack jaraxxus',
                'snd death refreshment vendor',
                's trigger antonaidas'
            ],
            args: [
                {
                    key: 'soundKind',
                    prompt: '',
                    type: 'string',
                    parse: value => { return value.toLowerCase() },
                    default: 'play'
                },
                {
                    key: 'cardName',
                    prompt: 'what card are you searching for?\n',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(msg, args) {
        if (!msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) { return }

        if (!['play', 'attack', 'trigger', 'death'].includes(args.soundKind)) {
            args.cardName = `${args.soundKind} ${args.cardName}`.trim()
            args.soundKind = 'play'
        }
        if (!args.cardName) {
            this.args[1].default = null
            args.cardName = await this.args[1].obtain(msg).catch(winston.error)
            this.args[1].default = ''
        }
        if (!args.soundKind || !args.cardName) { return msg.reply('cancelled command.').catch(winston.error) }
        
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (msg.channel.typing) { msg.channel.stopTyping() }
        
        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`).catch(winston.error) }

        const sounds = card.getSoundParts(args.soundKind)
        if (!sounds || sounds.length < 1) { return msg.reply(`sorry, I don't know the ${args.soundKind} sound for ${card.name}.`).catch(winston.error) }
        
        return msg.reply(`I'll join your voice channel and play the ${args.soundKind} sound for ${card.name} in a moment.`)
            .then(() => {
                SoundCommand.queue.push({ message: msg, card: card, soundKind: args.soundKind })
                if (SoundCommand.queue.length === 1) { SoundCommand.playSound(this.client).catch(winston.error) }
            }).catch(winston.error)
    }

    static get queue() {
        if (!this._queue) { this._queue = [] }
        return this._queue
    }

    static async playSound(client) {
        const message = this.queue[0].message
        const card = this.queue[0].card
        const soundKind = this.queue[0].soundKind
        
        const file = await card.getSound(soundKind).catch(winston.error)
        if (!file) {
            return message.reply(`sorry, I wasn't able to get the ${soundKind} sound for ${card.name}.`)
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                }).catch(winston.error)
        }

        if (!message.member.voiceChannel || message.member.voiceChannel.type !== 'voice') {
            return message.reply('unable to play sound, you\'re not in a voice channel')
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                }).catch(winston.error)
        }

        if (!message.member.voiceChannel.permissionsFor(client.user).hasPermission('SPEAK')) {
            return message.reply('sorry, I don\'t have permission to speak in your voice channel')
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                }).catch(winston.error)
        }

        let connection = client.voiceConnections.find(conn => conn.channel === message.member.voiceChannel)
        if (!connection) {
            connection = await message.member.voiceChannel.join().catch(err => {
                return `sorry, there was an error joining your voice channel, ${err ? err.message.replace('You', 'I') : 'unknown'}`
            })
        }

        if (typeof connection === 'string') {
            if (message.member.voiceChannel) { message.member.voiceChannel.leave() }
            return message.reply(connection)
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                }).catch(winston.error)
        }

        connection.playFile(file).on('end', () => {
            this.queue.shift()
            if (this.queue.length > 0) {
                if (this.queue[0].message.member.voiceChannel !== connection.channel) { connection.channel.leave() }
                this.playSound(client)
            } else { connection.channel.leave() }
        })
    }
}

module.exports = SoundCommand
