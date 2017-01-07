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
                let pat = /sound-?([a-zA-Z]+)/g
                let m = pat.exec(match[2])
                let res = m ? m[1] || 'play' : 'play'
                if (['attack', 'death', 'play', 'trigger'].includes(res)) {
                    playSound(authorVoiceChannel, card.id, res)
                }
            }
        }
        await message.channel.sendMessage(CardsHelper.formatTextOutput(card, match[2])).catch(console.error)
        if (message.channel.typing) { message.channel.stopTyping() }
    }
}

function playSound(channel, cardId, soundType) {
    if (!cardSoundsNames[cardId]) { return }
    let cardSounds = cardSoundsNames[cardId]
    if (!cardSounds[soundType] || cardSounds[soundType].length < 1) { return }
    let sounds = []
    cardSounds[soundType].forEach(sound => { sounds.push(sound) })
    SoundProcessor.mergeSounds(sounds).then(file => {
        channel.join().then(connection => {
            connection.playFile(file).on('end', () => {
                channel.leave()
            })
        }).catch(console.error)
    }).catch(console.error)
}
