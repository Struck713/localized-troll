import { createCompletion, loadModel } from "gpt4all";
import { Message } from "./types";

import config from "../config.json";

const Discord = require("discord-user-bots"); // no types
const client = new Discord.Client(config.token);

(async () => {
    const model = await loadModel(config.model, { device: "cpu", modelPath: config.model_path, verbose: true });

    let semaphore = 0;
    const consultModelForResponse = async (message: Message) => {

        const content = message.content.replace(/<@!\d+>/g, "").trim();

        await client.type(message.channel_id);
        
        const response = await createCompletion(model, [ { role: 'user', content: `${content}` } ], { promptHeader: "Your name is Harold. Be as rude as possible.", nCtx: 0, contextErase: 0 });
        const choice = response.choices[0].message.content.trim();
        if (choice) {
            await client.send(message.channel_id, { content: choice, reply: message.id });
        } else {
            await client.send(message.channel_id, { content: "Yeah. I got nothing.", reply: message.id });
        }
        await client.stop_type();
        semaphore--;
    }

    client.on.ready = function () {
        console.log(`${client.info.user.username} is ready to talk nonsense.`);
    };

    client.on.reply = (message: Message) => {
        if (semaphore > 0) return;
        if (!message.referenced_message) return;
        if (message.referenced_message.author.id != client.info.user.id) return;
        
        semaphore++;
        consultModelForResponse(message);
    }
    
    client.on.message_create = (message: Message) => {
        if (semaphore > 0) return;
        if (message.author.id == client.info.user.id) return;
        if (!message.mentions.find(mention => mention.id == client.info.user.id)) return;

        semaphore++;
        consultModelForResponse(message);
    };
})();
