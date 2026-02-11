import { Client, Message as DiscordMessage, Intents, TextChannel } from "discord.js";
import { Ollama } from "ollama";
import { QueuedMessage } from "./types";

import config from "../config.json";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

const tag_regex = /<@!?\d+>/g;
const queue: QueuedMessage[] = [];

(async () => {

    const ollama = new Ollama({
        host: config.ollama_host
    });

    let semaphore = 0;
    const consultModelForResponse = async (message: QueuedMessage) => {
        const content = message.content.replace(tag_regex, "").trim();
        const channel = await client.channels.fetch(message.channel_id) as TextChannel;
        
        if (!channel || channel.type !== 'GUILD_TEXT') {
            semaphore--;
            return;
        }
        
        await channel.sendTyping();
        
        const completion = await ollama.chat({
            model: config.model,
            messages: [
                { role: 'system', content: "Your name is Harold. Be as rude as possible." },
                { role: 'user', content }
            ]
        });
        const response = completion.message.content;
        if (response) {
            await channel.send({ content: response, reply: { messageReference: message.message_id } });
        } else {
            await channel.send({ content: "Yeah. I got nothing.", reply: { messageReference: message.message_id } });
        }
        semaphore--;
    }

    client.on('ready', () => {
        console.log(`${client.user?.username} is ready to talk nonsense.`);
    });

    client.on('messageCreate', (message: DiscordMessage) => {
        // Ignore own messages
        if (message.author.id === client.user?.id) return;
        
        // Check if bot is mentioned
        const isMentioned = message.mentions.has(client.user!.id);
        
        // Check if message is a reply to the bot
        const isReplyToBot = message.reference?.messageId && 
                             message.mentions.repliedUser?.id === client.user?.id;
        
        if (isMentioned || isReplyToBot) {
            queue.push({
                channel_id: message.channelId,
                message_id: message.id,
                content: message.content
            });
        }
    });

    setInterval(async () => {
        if (semaphore <= 0 && queue.length > 0) {
            semaphore++;

            // get top of stack
            const message = queue.splice(0, 1)[0];
            await consultModelForResponse(message);
        }
    }, 1000);

    await client.login(config.token);

})();
