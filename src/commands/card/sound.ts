import { oneLine } from 'common-tags'
import { Message, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'
import Card from '../../card/card'

export default class SoundCommand extends Command {
    public static get queue(): Array<{message: CommandMessage, card: Card, soundKind: string}> {
        if (!this._queue) { this._queue = [] }
        return this._queue
    }

    public static async playSound(client: CommandoClient): Promise<Message | Message[] | void> {
        const message: CommandMessage = this.queue[0].message
        const card: Card = this.queue[0].card
        const soundKind: string = this.queue[0].soundKind

        const file: string = await card.getSound(soundKind)
        if (!file) {
            return message
                .reply(`sorry, I wasn't able to get the ${soundKind} sound for ${card.name}.`)
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                })
        }

        if (!message.member.voiceChannel || message.member.voiceChannel.type !== 'voice') {
            return message
                .reply('unable to play sound, you\'re not in a voice channel')
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                })
        }

        if (!message.member.voiceChannel.permissionsFor(client.user).hasPermission('SPEAK')) {
            return message
                .reply('sorry, I don\'t have permission to speak in your voice channel')
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                })
        }

        let connection: VoiceConnection | string = client.voiceConnections.find((conn: VoiceConnection) => {
            return conn.channel === message.member.voiceChannel
        })
        if (!connection) {
            connection = await message.member.voiceChannel.join()
            .catch((err) => { return oneLine`
                sorry, there was an error joining your voice channel,
                ${err ? err.message.replace('You', 'I') : 'unknown'}
            `})
        }

        if (typeof connection === 'string') {
            if (message.member.voiceChannel) { message.member.voiceChannel.leave() }
            return message
                .reply(connection)
                .then(() => {
                    this.queue.shift()
                    if (this.queue.length > 0) { this.playSound(client) }
                })
        }

        connection.playFile(file).on('end', () => {
            this.queue.shift()
            if (this.queue.length > 0) {
                if (this.queue[0].message.member.voiceChannel !== connection.channel) {
                    connection.channel.leave()
                }
                this.playSound(client)
            } else {
                connection.channel.leave()
            }
        })
    }

    private static _queue: Array<{message: CommandMessage, card: Card, soundKind: string}>

    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['snd', 's'],
            args: [
                {
                    default: 'play',
                    key: 'soundKind',
                    parse: (value: string) => value.toLowerCase(),
                    prompt: '',
                    type: 'string'
                },
                {
                    default: '',
                    key: 'cardName',
                    prompt: 'what card are you searching for?\n',
                    type: 'string'
                }
            ],
            description: 'Plays card sound in your voice channel.',
            details: '`[soundKind]` can be one of `play`, `attack`, `death` or `trigger`. Optional.',
            examples: [
                'sound tirion',
                'sound attack jaraxxus',
                'snd death refreshment vendor',
                's trigger antonaidas'
            ],
            format: '[soundKind] <cardName>',
            group: 'card',
            guildOnly: true,
            memberName: 'sound',
            name: 'sound'
        })
    }

    public async run(msg: CommandMessage, args: { soundKind: string, cardName: string }):
        Promise<Message | Message[] | void> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) {
            return
        }

        if (!['play', 'attack', 'trigger', 'death'].includes(args.soundKind)) {
            args.cardName = `${args.soundKind} ${args.cardName}`.trim()
            args.soundKind = 'play'
        }

        if (!args.cardName) {
            this.args[1].default = null
            args.cardName = await this.args[1].obtain(msg).catch(winston.error)
            this.args[1].default = ''
        }
        if (!args.soundKind || !args.cardName) { return msg.reply('cancelled command.') }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await Card.findByName(args.cardName)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) {
            return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`)
        }

        const sounds: Array<{name: string, delay: Number}> = card.getSoundParts(args.soundKind)
        if (!sounds || sounds.length < 1) {
            return msg.reply(`sorry, I don't know the ${args.soundKind} sound for ${card.name}.`)
        }

        return msg.reply(oneLine`
            I'll join your voice channel and play the ${args.soundKind} sound for ${card.name} in a moment.
        `).then(() => {
            SoundCommand.queue.push({ message: msg, card, soundKind: args.soundKind })
            if (SoundCommand.queue.length === 1) { SoundCommand.playSound(this.client).catch(winston.error) }
        })
    }
}
