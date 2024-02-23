import { createCompletion, loadModel } from "gpt4all";
import { Message } from "./types";

import config from "../config.json";

const Discord = require("discord-user-bots"); // no types
const client = new Discord.Client(config.token);

(async () => {
    const model = await loadModel(config.model, { device: "cpu", modelPath: config.model_path, verbose: true });

    let semaphore = 0;
    const consultModelForResponse = async (message: Message) => {
        await client.type(message.channel_id);
        const response = await createCompletion(model, [
            { role: 'user', content: `${message.content}` }
        ], { 
            promptHeader: "Your name is Harold. Be as rude as possible.",
        });
        
        const choice = response.choices.filter(res => res.message.content.length != 0)[0];
        if (choice) {
            await client.send(message.channel_id, { content: choice.message.content, reply: message.id });
            await client.stop_type();
        }
        semaphore--;
    }

    client.on.ready = function () {
        console.log(`${client.info.user.username} is ready to talk nonsense.`);
    };

    client.on.reply = (message: Message) => {
        if (!message.referenced_message) return;
        if (message.referenced_message.author.id != client.info.user.id) return;
        if (semaphore > 0) return;
        
        semaphore++;
        consultModelForResponse(message);
    }
    
    client.on.message_create = (message: Message) => {
        if (message.author.id == client.info.user.id) return;
        if (!message.mentions.find(mention => mention.id == client.info.user.id)) return;
        if (semaphore > 0) return;
        
        semaphore++;
        consultModelForResponse(message);
    };
})();
