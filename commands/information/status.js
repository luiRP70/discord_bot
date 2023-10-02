const Discord = require('discord.js');

module.exports = {
    name: 'status',
    description: 'Verificar o status do bot.',
    run: async (client, interaction) => {
        let embed = new Discord.EmbedBuilder()
            .setDescription(`**Resposta ao usuário:** ${interaction.author}\n` +
                `**Nome:** ${client.user.username}\n` +
                `**Status:** 🟢 ${client.presence.status}\n`)
            .setColor(0x0099ff)
            .setFooter({ text: `- signed by Luiz Espalha Lixo` });

        interaction.reply({ embeds: [embed] });
    }
}