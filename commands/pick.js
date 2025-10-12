const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Pick a random server member'),
  async execute(interaction) {
    const members = await interaction.guild.members.fetch();
    const onlineMembers = members.filter(m => !m.user.bot);
    if (onlineMembers.size === 0) {
      await interaction.reply("❌ No active members to pick from.");
    } else {
      const names = Array.from(onlineMembers.values());
      const picked = names[Math.floor(Math.random() * names.length)];
      await interaction.reply(`🎯 I pick: **${picked.user.username}**!`);
    }
  },
};
