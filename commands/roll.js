const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice (1-6)'),
    async execute(interaction) {
        const roll = Math.floor(Math.random() * 6) + 1;
        await interaction.reply(`🎲 You rolled a ${roll}!`);
    },
};
