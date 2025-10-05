const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Choose between multiple options')
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Comma-separated list of options')
                .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options.getString('options')
            .split(',')
            .map(o => o.trim())
            .filter(o => o);

        if (options.length < 2) {
            await interaction.reply({ 
                content: "❗ Please give at least two options, separated by commas.",
                ephemeral: true
            });
            return;
        }

        const choice = options[Math.floor(Math.random() * options.length)];
        await interaction.reply(`🎯 I choose: **${choice}**`);
    },
};
