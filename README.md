# localized-troll

A discord bot that tries to troll (and usually failed).

## Setup

- Clone the repository
- Run `npm i`
- Rename `config.default.json` to `config.json`.
- Download a .gguf dataset from [GPT4ALL](https://gpt4all.io/) (or any site really)
- Configure
- Run `npm start`
- You're off!

Here is the defaut config:
```JSON
{
    "token": "Discord token",
    "model": "Model, like: gpt4all-falcon-newbpe-q4_0.gguf",
    "model_path": "Absolute path to your models folder"
}
```

## Other

The models defaultly run on the CPU, but I've noticed that running them on the GPU are a little better. You can go into `app.ts` and configure them to run on the GPU (if you have the memory for it).
