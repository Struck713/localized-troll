import { PromptMessage, createCompletion, loadModel } from "gpt4all";
import { Message, QueuedMessage } from "./types";

import config from "../config.json";

const Discord = require("discord-user-bots"); // no types
const client = new Discord.Client(config.token);

const tag_regex = /<@!\d+>/g;
const history: PromptMessage[] = [];
const queue: QueuedMessage[] = [];

(async () => {

    const model = await loadModel(config.model, { device: "cpu", modelPath: config.model_path, verbose: true });
    
    let semaphore = 0;
    const consultModelForResponse = async (message: QueuedMessage) => {
        const content = message.content.replace(tag_regex, "").trim();
        await client.type(message.channel_id);
        
        // make sure history is always fixed length 
        if (history.length > config.max_history_length) history.splice(0, 1);
        history.push({ role: 'user', content: `${content}` });

        const response = await createCompletion(model, history, { promptHeader: "Your name is Harold. Be as rude as possible.", nCtx: 0, contextErase: 0 });
        const choice = response.choices[0].message.content.trim();
        if (choice) {
            history.push({ role: 'assistant', content: `${choice}` });
            await client.send(message.channel_id, { content: choice, reply: message.message_id });
        } else {
            await client.send(message.channel_id, { content: "Yeah. I got nothing.", reply: message.message_id });
        }
        await client.stop_type();
        semaphore--;
    }

    client.on.ready = () => {
        console.log(`${client.info.user.username} is ready to talk nonsense.`);
    };

    client.on.reply = (message: Message) => {
        if (!message.referenced_message) return;
        if (message.referenced_message.author.id != client.info.user.id) return;

        queue.push({
            channel_id: message.channel_id,
            message_id: message.id,
            content: message.content
        });
    }
    
    client.on.message_create = (message: Message) => {
        if (message.author.id == client.info.user.id) return;
        if (!message.mentions.find(mention => mention.id == client.info.user.id)) return;
        
        queue.push({
            channel_id: message.channel_id,
            message_id: message.id,
            content: message.content
        });
    }

    setInterval(async () => {
        if (semaphore <= 0 && queue.length > 0) {
            semaphore++;

            // get top of stack
            const message = queue.splice(0, 1)[0];
            await consultModelForResponse(message);
        }
    }, 1000);

})();
