const Discord = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    name: 'play',
    description: 'Adiciona uma faixa na fila.',
    run: async (client, interaction, args, queue) => {
        try {
            const channel = interaction.member.voice.channel;
            if (!channel) {
                throw 'Voce precisa estar em um canal de voz para usar este comando!';
            }

            const query = args.join(' ');
            let embed = new Discord.EmbedBuilder()
                .setTitle('Pesquisando...⚙🔍')
                .setColor("Random")
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setDescription(`Oi ${interaction.author}, estou buscando por: \`${query}\`.`)
                .setThumbnail('https://i.pinimg.com/564x/e3/a1/18/e3a11860705794fe49f20852b68ec5c1.jpg')
                .setFooter({ text: `🤒Aguarde só mais um pouco...` });


            interaction.reply({ embeds: [embed] }).then(async msg => {
                if (!query) {
                    throw 'Nenhum link ou palavra chave foi encontrada!';
                }

                const server_queue = queue.get(channel.id);
                let song = {};
                let embedBody = {};
                let youtubeLink;

                if (!query.includes('youtube.com')) {
                    let results = await ytSearch(query);

                    if (!results?.all?.length) {
                        throw 'Nenhum resultado foi encontrado!';
                    }

                    for (let i = 0; i < results.all.length; i++) {
                        if (results.all[i].type === 'video') {
                            youtubeLink = results.all[i].url;
                            break;
                        }
                    }
                } else {
                    youtubeLink = query;
                    if (youtubeLink.includes('&list=')) {
                        let parts = youtubeLink.split('&');
                        let filteredParts = parts.filter(part => !part.startsWith('list='));

                        youtubeLink = filteredParts.join('&');
                        embedBody.footer = `Este link é de uma playlist, não possuo suporte para tocar ela no momento, porém irei executar a primeira faixa.`;
                    }
                }

                let downloadInfo = await ytdl.getInfo(youtubeLink);
                console.log(downloadInfo);
                song = { title: downloadInfo.videoDetails.title, url: downloadInfo.videoDetails.video_url, thumbnail: downloadInfo.videoDetails.thumbnails[0].url };

                if (!server_queue) {
                    const queue_constructor = {
                        voice_channel: channel,
                        text_channel: client.channel,
                        connection: null,
                        songs: []
                    }

                    queue.set(channel.id, queue_constructor);
                    queue_constructor.songs.push(song);

                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    });

                    queue_constructor.connection = connection;
                    video_player(channel.id, queue_constructor);

                    embedBody.title = "Encontrei! ⚙🔍";
                    embedBody.description = `Busquei com minhas **anteninhas de vinil** e encontrei o audio:\n \`${downloadInfo.videoDetails.title}\``;
                    embedBody.footer = embedBody.footer ? embedBody.footer : `🎶Conectando ao canal...`;
                } else {
                    server_queue.songs.push(song);

                    embedBody.title = "Adicionado a fila!";
                    embedBody.description = `Adicionei à fila o áudio:\n \`${downloadInfo.videoDetails.title}\``;
                    embedBody.footer = embedBody.footer ? embedBody.footer : `Aguarde ou execute o comando !skip 😘`;
                }

                let embed_res = new Discord.EmbedBuilder()
                    .setTitle(embedBody.title)
                    .setColor("Random")
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setDescription(embedBody.description)
                    .setThumbnail(downloadInfo.videoDetails.thumbnails[0].url)
                    .setFooter({ text: embedBody.footer });

                return msg.edit({ embeds: [embed_res] });
            }).catch(err => { throw err });
        } catch (error) {
            let embedError = new Discord.EmbedBuilder()
                .setTitle('Algo deu errado aconteceu!')
                .setColor("Random")
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setDescription(`Oi ${interaction.author}.\n ${error}`)
                .setFooter({ text: `Se atente ao erro e tente novamente...` });

            return msg.reply({ embeds: [embedError] });
        }
        const video_player = async (guildId, queue_constructor) => {
            const song = queue_constructor.songs[0];

            if (!song) {
                queue_constructor.connection.destroy();
                queue.delete(guildId);
                return;
            }

            const player = createAudioPlayer();
            queue_constructor.connection.subscribe(player);

            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                dlChunkSize: 0,
                highWaterMark: 1 << 25
            }).on('error', error => {
                console.error(error);
            });

            player.play(createAudioResource(stream, { seek: 0, volume: 1 }));

            player.on(AudioPlayerStatus.Idle, () => {
                queue_constructor.songs.shift();
                video_player(guildId, queue_constructor);
            });
        }
        module.exports.video_player = video_player;
    }
}
