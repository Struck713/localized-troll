import { env } from "bun";
import { Client, Message as DiscordMessage, Intents, TextChannel } from "discord.js";
import { Ollama } from "ollama";

interface QueuedMessage {
    channel_id: string;
    message_id: string;
    author_id: string;
    content: string;
}

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

const queue: QueuedMessage[] = [];

(async () => {

    const system_prompt = await Bun.file("./prompts/system.md").text();
    const ollama = new Ollama({ host: env.OLLAMA_HOST });

    let semaphore = 0;
    const consultModelForResponse = async (message: QueuedMessage) => {
        const content = message.content;
        const channel = await client.channels.fetch(message.channel_id) as TextChannel;
        console.log(`Processing message ${message.message_id} from channel ${message.channel_id}..`);
        
        if (!channel || !channel.isText()) {
            semaphore--;
            return;
        }
        
        await channel.sendTyping();

        const timeLabel = `response_time_${message.message_id}`;
        console.time(timeLabel);
        const completion = await ollama.chat({
            model: env.MODEL!,
            messages: [
                { 
                    role: 'system', 
                    content: system_prompt,
                },
                { 
                    role: 'system', 
                    content: channel.members
                        .filter(member => !member.user.bot)
                        .map(member => `${member.displayName} (<@${member.id}>)`).join(", ") + " are in this channel.",
                },
                { 
                    role: 'system', 
                    content:  `You are ${client.user?.displayName} (${client.user?.id}). DO NOT reference yourself.`,
                },
                { role: 'user', content }
            ]
        });
        console.timeEnd(timeLabel);
        const response = completion.message.content;
        await channel.send({ content: response, reply: { messageReference: message.message_id } });
        semaphore--;
    }

    client.on('ready', () => {
        console.log(`${client.user?.username} is ready to talk nonsense.`);
    });

    client.on('messageCreate', async (message: DiscordMessage) => {
        if (message.author.id === client.user?.id) return;
        
        const isMentioned = message.mentions.has(client.user!.id);
        const isReplyToBot = message.reference?.messageId && 
                             message.mentions.repliedUser?.id === client.user?.id;
        if (isMentioned || isReplyToBot) {
            queue.push({
                channel_id: message.channelId,
                message_id: message.id,
                content: message.content,
                author_id: message.author.id
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

    await client.login(env.TOKEN);

})();
