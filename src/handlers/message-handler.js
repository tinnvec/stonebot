import CardsHelper from '../helpers/cards-helper'
import DiscordHelper from '../helpers/discord-helper'
import SoundProcessor from '../sounds/sound-processor'

import cardSoundsNames from '../sounds/card-sounds-names.json'

export default async function messageHandler(message) {
    let matches = CardsHelper.detectMentions(message.content)
    if (matches.length < 1) { return }
    for (let match of matches) {
        if (!message.channel.typing) { message.channel.startTyping() }
        let card = await CardsHelper.search(match[1])
        if (!card) { return }
        if (match[2].startsWith('sound')) {
            let authorVoiceChannel = DiscordHelper.getMessageAuthorVoiceChannel(message)
            if (authorVoiceChannel) {
                let m = /sound-?([a-zA-Z]+)/g.exec(match[2])
                let res = m && m[1] ? m[1] : 'play'
                if (['attack', 'death', 'play', 'trigger'].includes(res)) {
                    playSound(authorVoiceChannel, card.id, res)
                }
            }
        }
        await message.channel.sendMessage(CardsHelper.formatTextOutput(card, match[2])).catch(console.error)
        if (message.channel.typing) { message.channel.stopTyping() }
    }
}

async function playSound(channel, cardId, soundType) {
    if (!cardSoundsNames[cardId]) { return }
    if (!cardSoundsNames[cardId][soundType]) { return }
    const sounds = cardSoundsNames[cardId][soundType]
    if (sounds.length < 1) { return }
    const file = await SoundProcessor.mergeSounds(sounds).catch(console.error)
    const voiceConnection = await channel.join().catch(console.error)
    voiceConnection.playFile(file).on('end', () => { channel.leave() })
}
