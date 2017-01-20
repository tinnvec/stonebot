import Discord from 'discord.js'
import { Command } from 'discord.js-commando'
import Card from '../../card/card'
import SoundProcessor from '../../sound/sound-processor'
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
            description: 'Plays card sound in your current voice channel.',
            format:'[kind] <name>',
            examples: ['sound tirion', 'sound attack jaraxxus', 'sound death refreshment vendor', 'sound trigger antonaidas'],
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
    }

    async run(msg, args) {
        if (!msg.channel.typing) { msg.channel.startTyping() }
        const allChannels = msg.channel.guild.channels
        let voiceChannel = null
        allChannels.forEach(channel => {
            if (!(channel instanceof Discord.VoiceChannel)) { return }
            if (!channel.members.get(msg.author.id)) { return }
            voiceChannel = channel
        })
        if (!voiceChannel) {
            if (msg.channel.typing) { msg.channel.stopTyping() }
            return msg.reply('sorry, I couldn\'t find your voice channel.')
        }
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
        const file = await SoundProcessor.mergeSounds(soundFilenames).catch(console.error)
        const voiceConnection = await voiceChannel.join().catch(console.error)
        const dispatcher = voiceConnection.playFile(file)
        dispatcher.on('end', () => { voiceChannel.leave() })  
        if (msg.channel.typing) { msg.channel.stopTyping() }
        return msg.reply(`Playing ${args.kind} sound for ${card.name} in ${voiceChannel.name} voice channel.`)
    }
}
