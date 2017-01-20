import Card from '../../card'
import { Command } from 'discord.js-commando'
import SoundProcessor from '../../sound-processor'

import fs from 'fs'
import winston from 'winston'

const SOUND_KINDS = ['play', 'attack', 'trigger', 'death']

module.exports = class SoundCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sound',
            aliases: ['snd', 's', '🔈', '🔉', '🔊', '🎧', '🎵'],
            group: 'card',
            memberName: 'sound',
            guildOnly: true,
            description: 'Plays card sound in your voice channel.',
            format:'[kind] <name>',
            examples: [
                'sound tirion',
                'sound attack jaraxxus',
                'sound death refreshment vendor',
                'sound trigger antonaidas'
            ],
            args: [
                {
                    key: 'kind',
                    prompt: '',
                    type: 'string',
                    default: 'play'
                },
                {
                    key: 'name',
                    prompt: 'what card are you searching for?\n',
                    type: 'string',
                    default: ''
                }
            ]
        })

        this.queue = []
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        if (!SOUND_KINDS.includes(args.kind)) {
            args.name = `${args.kind} ${args.name}`.trim()
            args.kind = 'play'
        }
        if (!args.name) {
            this.args[1].default = null
            args.name = await this.args[1].obtain(msg).catch(winston.error)
        }
        const card = await Card.findByName(args.name).catch(winston.error)
        const soundFilenames = card.getSoundFilenames(args.kind)
        if (!soundFilenames) {
            if (msg.channel.typing) { msg.channel.stopTyping() }
            return msg.reply(`sorry, I don't know the ${args.kind} sound for ${card.name}.`)
        }
        this.queue.push({ message: msg, soundFilenames: soundFilenames })
        if (this.queue.length === 1) { this.handleSound().catch(winston.error) }
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.reply(`I'll join your voice channel and play the ${args.kind} sound for ${card.name} in a moment.`)
    }

    async handleSound() {
        const message = this.queue[0].message
        const soundFilenames = this.queue[0].soundFilenames
        const file = await SoundProcessor.mergeSounds(soundFilenames).catch(winston.error)
        const connection = await this.joinVoiceChannel(message.member.voiceChannel).catch(winston.error)
        if (!connection || typeof connection === 'string') {
            this.queue.shift()
            fs.unlink(file, err => { if (err) { winston.error(err) } })
            if (message.member.voiceChannel) { message.member.voiceChannel.leave() }
            message.reply(`sorry, there was an error joining your voice channel, ${connection || 'unkown'}`)
            if (this.queue.length > 0) { this.handleSound() }
            return
        }
        connection.playFile(file).on('end', () => {
            this.queue.shift()
            fs.unlink(file, err => { if (err) { winston.error(err) } })
            if (this.queue.length > 0) {
                if (this.queue[0].message.member.voiceChannel !== connection.channel) { connection.channel.leave() }
                this.handleSound()
            } else {
                connection.channel.leave()
            }
        })
    }

    async joinVoiceChannel(voiceChannel) {
        if (!voiceChannel || voiceChannel.type !== 'voice') { return 'you\'re not in one' }
        let connection = this.client.voiceConnections.find(conn => conn.channel === voiceChannel)
        if (connection) { return connection }
        return await voiceChannel.join().catch(err => { return err.message.replace('You', 'I') })
    }
}
