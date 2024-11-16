const Discord = require('discord.js');

module.exports = {
    name: 'cat',
    description: 'Gato.',
    run: async (client, interaction) => {
        const getData = async function () {
            const url = "https://api.thecatapi.com/v1/images/search";
            try {
                const response = await fetch(url);
                const json = await response.json();

                return json;
            } catch (error) {
                console.error(error.message);
            }
        }

        let catJson = await getData();
        let catUrl = catJson[0]?.url;

        if (catUrl) {
            let embed = new Discord.EmbedBuilder()
                .setImage(catUrl)
                .setFooter({ text: `Gato Gato Gato Gato Gato Gato Gato Gato Gato Gato ` });

            interaction.reply({ embeds: [embed] });
        } else {
            interaction.reply({ content: 'Não foi possível encontrar o gatin', ephemeral: true });
        }
    }
}