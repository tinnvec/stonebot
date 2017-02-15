import Card from '../../card/card'
import { Command } from 'discord.js-commando'

import { soundKind, cardName } from '../../command-arguments'
import winston from 'winston'

const SOUND_KINDS = ['play', 'attack', 'trigger', 'death']

module.exports = class SoundCommand extends Command {
    constructor(client) {
        const nameWithDefault = { default: '' }
        Object.assign(nameWithDefault, cardName)
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
            args: [ soundKind, nameWithDefault ]
        })
        this.queue = []
    }

    async run(msg, args) {
        if (!SOUND_KINDS.includes(args.soundKind)) {
            args.cardName = `${args.soundKind} ${args.cardName}`.trim()
            args.soundKind = 'play'
        }
        if (!args.cardName) {
            this.args[1].default = null
            args.cardName = await this.args[1].obtain(msg).catch(winston.error)
            this.args[1].default = ''
        }
        
        if (!msg.channel.typing) { msg.channel.startTyping() }
        let reply, sounds
        const card = await Card.findByName(args.cardName).catch(winston.error)
        if (!card) { reply = `sorry, I couldn't find a card with a name like '${args.cardName}'` }
        else {
            sounds = card.getSoundParts(args.soundKind)
            if (!sounds || sounds.length < 1) { reply = `sorry, I don't know the ${args.soundKind} sound for ${card.name}.` }
        }
        
        return msg.reply(reply || `I'll join your voice channel and play the ${args.soundKind} sound for ${card.name} in a moment.`)
            .then(m => { if (m.channel.typing) { m.channel.stopTyping() } })
            .then(() => {
                if (reply) { return }
                this.queue.push({ message: msg, card: card, soundKind: args.soundKind })
                if (this.queue.length === 1) { this.handleSound().catch(winston.error) }
            }).catch(winston.error)
    }

    async handleSound() {
        const message = this.queue[0].message
        const card = this.queue[0].card
        const soundKind = this.queue[0].soundKind
        
        let reply, connection
        const file = await card.getSound(soundKind).catch(winston.error)
        if (!file) { reply = `sorry, I don't know the ${soundKind} sound for ${card.name}.` }
        else {
            connection = await this.joinVoiceChannel(message.member.voiceChannel).catch(winston.error)
            if (!connection || typeof connection === 'string') {
                if (message.member.voiceChannel) { message.member.voiceChannel.leave() }
                reply = `sorry, there was an error joining your voice channel, ${connection || 'unkown'}`
            }
        }
        
        if (reply) {
            return message.reply(reply)
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.handleSound() }
                }).catch(winston.error)
        }

        connection.playFile(file).on('end', () => {
            this.queue.shift()
            if (this.queue.length > 0) {
                if (this.queue[0].message.member.voiceChannel !== connection.channel) { connection.channel.leave() }
                this.handleSound()
            } else { connection.channel.leave() }
        })
    }

    async joinVoiceChannel(voiceChannel) {
        if (!voiceChannel || voiceChannel.type !== 'voice') { return 'you\'re not in one' }
        const connection = this.client.voiceConnections.find(conn => conn.channel === voiceChannel)
        if (connection) { return connection }
        return await voiceChannel.join().catch(err => { return err.message.replace('You', 'I') })
    }
}
