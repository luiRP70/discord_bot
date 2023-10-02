const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["Guilds", "GuildMembers", "MessageContent", "GuildMessages", "GuildVoiceStates"] });
const queue = new Map();
const fs = require('fs');
require('dotenv').config();

module.exports = client;

client.login(process.env.TOKEN);

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

client.categories = fs.readdirSync(`./commands/`);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    client.user.setActivity('Luiz Espalha Lixo', {
        name: 'Luiz Espalha Lixo',
        type: 'ActivityType.playing'
    });
});

fs.readdirSync('./commands/').forEach(local => {
    const comandos = fs.readdirSync(`./commands/${local}`).filter(arquivo => arquivo.endsWith('.js'));

    for (let file of comandos) {
        let push = require(`./commands/${local}/${file}`)

        if (push.name) {
            client.commands.set(push.name, push)
        }

        if (push.aliases && Array.isArray(push.aliases)) {
            push.aliases.forEach(x => client.aliases.set(x, push.name));
        }
    }
});

client.on("messageCreate", async (message) => {
    let prefix = process.env.PREFIX;

    let validation = [
        message.author.bot,
        message.channel.type === Discord.ChannelType.DM,
        !message.content.toLowerCase().startsWith(prefix.toLowerCase()) || !message.content.startsWith(prefix)
    ];

    if (validation.some(value => value === true)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);

    let cmd = args.shift().toLowerCase()
    if (cmd.length === 0) return;

    let command = client.commands.get(cmd)
    if (!command) command = client.commands.get(client.aliases.get(cmd))

    try {
        command.run(client, message, args, queue)
    } catch (err) {
        console.error('Erro:' + err);
    }
});
