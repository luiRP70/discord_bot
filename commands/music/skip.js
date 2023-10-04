const Discord = require('discord.js');
const play = require('./play.js');

module.exports = {
    name: 'skip',
    description: 'Pula para próxima faixa na fila.',
    run: async (client, interaction, args, queue) => {
        try {
            const channel = interaction.member.voice.channel;
            if (!channel) {
                throw 'Voce precisa estar em um canal de voz para usar este comando!';
            }

            let embed = new Discord.EmbedBuilder()
                .setTitle('Seguindo a fila 🙃')
                .setColor("Random")
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setDescription(`${interaction.author}, estou passando para próxima faixa, aguarde...`)
                .setThumbnail('https://i.pinimg.com/564x/e3/a1/18/e3a11860705794fe49f20852b68ec5c1.jpg')
                .setFooter({ text: `Lembre, caso queira parar de ouvir, execute o comando !stop` });

            interaction.reply({ embeds: [embed] }).then(async msg => {
                const server_queue = queue.get(channel.id);
                let embedBody = {};

                if (server_queue) {
                    if (server_queue.songs.length < 2) {
                        throw 'Nenhuma faixa foi adicionada na fila!';
                    }
                    server_queue.songs.shift();
                    play.video_player(channel.id, server_queue);

                    embedBody.title = "Feito! ⏭️";
                    embedBody.description = `Pulei para o próxima faixa na fila 😀:\n \`${server_queue.songs[0].title}\``;
                    embedBody.footer = `Lembre, caso queira parar de ouvir, execute o comando !stop`;
                    embedBody.thumbnail = server_queue.songs[0].thumbnail;
                } else {
                    embedBody.title = "Puts! 😢";
                    embedBody.description = 'Parece que não tem nenhuma faixa na fila!';
                    embedBody.footer = `Para adicionar mais faixas, execute o comando !play`;
                    embedBody.thumbnail = 'https://i.pinimg.com/564x/e3/a1/18/e3a11860705794fe49f20852b68ec5c1.jpg';
                }

                let embed_res = new Discord.EmbedBuilder()
                    .setTitle(embedBody.title)
                    .setColor("Random")
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setDescription(embedBody.description)
                    .setThumbnail(embedBody.thumbnail)
                    .setFooter({ text: embedBody.footer });

                return msg.edit({ embeds: [embed_res] });
            })
        } catch (error) {
            let embedError = new Discord.EmbedBuilder()
                .setTitle('Algo deu errado aconteceu!')
                .setColor("Random")
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setDescription(`Oi ${interaction.author}.\n ${error}`)
                .setFooter({ text: `Se atente ao erro e tente novamente...` });

            return msg.reply({ embeds: [embedError] });
        }
    }
}