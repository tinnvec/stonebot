import winston from 'winston'

export default class MessageManager {
    static async getArgumentPromptMessages(commandMessage) {
        winston.debug('Fetching argument prompt messages.')
        const messages = await commandMessage.channel.fetchMessages({ after: commandMessage.id }).catch(winston.error)
        return messages.filter(m => { return m.author.id === commandMessage.client.user.id })
    }

    static async deleteArgumentPromptMessages(commandMessage) {
        const argPrompts = await MessageManager.getArgumentPromptMessages(commandMessage).catch(winston.error)
        if (argPrompts.size > 0) {
            winston.debug('Removing argument prompt messages.')
            argPrompts.array().forEach(async m => { await m.delete().catch(winston.error) })
        } else {
            winston.debug('No argument prompt messages found.')
        }
    }
}
