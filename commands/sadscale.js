const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sadscale')
        .setDescription('Get a random sadness scale rating (0-10)'),
    async execute(interaction) {
        const level = Math.floor(Math.random() * 11);
        await interaction.reply(`😭 **Sadness Scale:** ${level}/10`);
    },
};
