const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('number')
    .setDescription('Generate a random number between min and max')
    .addIntegerOption(option => option.setName('min').setDescription('Minimum value').setRequired(true))
    .addIntegerOption(option => option.setName('max').setDescription('Maximum value').setRequired(true)),
  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');
    if (min >= max) return interaction.reply("⚠️ Max must be greater than min!");
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    await interaction.reply(`🔢 Your number: **${num}**`);
  },
};
