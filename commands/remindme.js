const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Set a reminder')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time (e.g., 10m, 1h, 2d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Reminder message')
        .setRequired(true)),
  async execute(interaction) {
    const timeInput = interaction.options.getString('time');
    const reminderMsg = interaction.options.getString('message');

    const match = timeInput.match(/^([0-9]+)(s|m|h|d)$/);
    if (!match) {
      return interaction.reply({
        content: "⏰ Usage example: `/remindme 10m check the oven`",
        ephemeral: true
      });
    }

    const amount = parseInt(match[1]);
    const unit = match[2];
    const unitMap = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const ms = amount * unitMap[unit];
    const MAX_DELAY = 2_147_483_647;

    if (ms > MAX_DELAY)
      return interaction.reply("⚠️ Sorry, the maximum reminder time is 24 days.");

    // ✅ Send confirmation in the same channel
    await interaction.reply(`⏳ I'll remind you in **${amount}${unit}**: "${reminderMsg}"`);

    // DM reminder
    setTimeout(() => {
      interaction.user.send(`⏰ Reminder: ${reminderMsg}`).catch(() => {
        console.log(`❌ Failed to DM ${interaction.user.tag}`);
      });
    }, ms);
  },
};
