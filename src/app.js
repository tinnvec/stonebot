import Discord from 'discord.js'
import Fuse from 'fuse.js'
import HearthstoneJSON from 'hearthstonejson'
import toMarkdown from 'to-markdown'

import config from './config/config'

const client = new Discord.Client()
const hsjson = new HearthstoneJSON()

client.on('ready', () => {
    console.log('Client ready')
})

client.on('message', message =>  {
  let pattern = /:{2}([^:\?]+)\??([^:]*):{2}/g
  let matches = []
  let match
  while (match = pattern.exec(message.content)) {
    matches.push(match)
  }

  if (matches.length > 0) {
    message.channel.startTyping()
    hsjson.getLatest(cards => {
      try {
        cards = cards.filter(card => { return card.collectible })
        let fuse = new Fuse(cards, { keys: ['name'] })

        matches.forEach(match => {
          let foundCards = fuse.search(match[1])
          let reply
          if (foundCards.length < 1) {
            reply = 'Sorry, I couldn\'t find anything'
          } else {
            reply = formatOutput(foundCards[0], match[2])
          }
          message.channel.sendMessage(reply)
        }, this)
      } catch (ex) {
        console.log(ex)
      }
      message.channel.stopTyping()
    })
  }
})

client.login(config.token)

function formatOutput(card, addon) {
  if (addon === 'image') {
    return `http://media.services.zam.com/v1/media/byName/hs/cards/enus/${card.id}.png`
  }

  if (addon === 'gold') {
    return `http://media.services.zam.com/v1/media/byName/hs/cards/enus/animated/${card.id}_premium.gif`
  }

  let result =`${card.name} - ${card.cost} Mana`
  
  if (card.attack) {
    result += ` ${card.attack}/${card.health || card.durability}`
  }

  result += ` ${card.playerClass.toLowerCase().capitalizeFirstLetter()}`
  result += ` ${card.type.toLowerCase().capitalizeFirstLetter()}`
  if (card.text) {
    result += `\n${toMarkdown(card.text)}`
  }
  
  if (addon === 'flavor') {
    result += `\n${card.flavor}`
  }

  if (addon === 'art') {
    result += `\nhttps://art.hearthstonejson.com/v1/256x/${card.id}.jpg`
  }

  return result
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}