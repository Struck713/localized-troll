import { createCompletion, loadModel } from "gpt4all";
import { Message } from "./types";

import config from "../config.json";

const Discord = require("discord-user-bots"); // no types
const client = new Discord.Client(config.token);

(async () => {
    const model = await loadModel(config.model, { device: "gpu", modelPath: config.model_path, verbose: true });

    client.on.ready = function () {
        console.log(`${client.info.user.username} is ready to talk nonsense.`);
    };
    
    let semaphore = 0;
    client.on.message_create = (message: Message) => {
        if (message.author.id === client.info.user.id) return;
        if (semaphore > 0) return;

        semaphore++;
        (async () => {
            await client.type(message.channel_id);
            const response = await createCompletion(model, [
                { role: 'user', content: `${message.author.username} said "${message.content}"` }
            ], { contextErase: 0.5, repeatPenalty: 0.5, promptHeader: "Be annoying and rude. Your name is Harold." });
            console.log(response.usage);
            await client.send(message.channel_id, { content: response.choices[0].message.content.trim(), reply: message.id });
            await client.stop_type();
            semaphore--;
        })();
    };
})();
