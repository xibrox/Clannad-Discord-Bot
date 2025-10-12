const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete a number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '⚠️ You can only delete between 1 and 100 messages.', ephemeral: true });
    }

    // Send a temporary response BEFORE deleting
    await interaction.reply({ content: `🧹 Deleting **${amount}** messages...`, ephemeral: true });

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      // Use followUp instead of editReply (the first one is ephemeral)
      await interaction.followUp({ content: `✅ Deleted **${deleted.size}** messages.`, ephemeral: true });
    } catch (err) {
      console.error('❌ Purge failed:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Failed to delete messages (they might be older than 14 days).', ephemeral: true });
      } else {
        await interaction.followUp({ content: '❌ Failed to delete messages (they might be older than 14 days).', ephemeral: true });
      }
    }
  },
};
