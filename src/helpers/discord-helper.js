import Discord from 'discord.js'

export default class DiscordHelper {
    static getMessageAuthorVoiceChannel(message) {
        let allChannels = message.channel.guild.channels
        let result = null
        allChannels.forEach(channel => {
            if (!(channel instanceof Discord.VoiceChannel)) { return }
            if (!channel.members.get(message.author.id)) { return }
            result = channel
        })
        return result
    }
}
