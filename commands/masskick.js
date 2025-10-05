const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('masskick')
        .setDescription('Kick all users with a specific role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to target (mention or name)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ This command requires Administrator permissions to use.",
                ephemeral: true
            });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({
                content: "❌ I need the Kick Members permission to do this.",
                ephemeral: true
            });
        }

        await interaction.deferReply();

        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || `Mass kick by ${interaction.user.tag}`;

        if (!role) {
            return interaction.editReply("❌ Role not found.");
        }

        const members = await interaction.guild.members.fetch();
        const toKick = members.filter(
            (m) => m.roles.cache.has(role.id) && !m.user.bot && m.kickable
        );

        if (toKick.size === 0) {
            return interaction.editReply("✅ No kickable members found with that role.");
        }

        await interaction.editReply(`🔄 Starting to kick ${toKick.size} members with role "${role.name}"...`);

        let kicked = 0;
        let failed = 0;
        let progress = 0;

        for (const member of toKick.values()) {
            try {
                await member.kick(reason);
                kicked++;
                // Update progress every 5 kicks
                progress++;
                if (progress % 5 === 0) {
                    await interaction.channel.send(
                        `⏳ Progress: ${progress}/${toKick.size} members processed...`
                    );
                }
            } catch (err) {
                console.log(`❌ Couldn't kick ${member.user.tag}:`, err);
                failed++;
            }
            // Wait 5 seconds between kicks to avoid rate limiting
            await sleep(5000);
        }

        const finalMessage = [
            `👢 Kick operation completed:`,
            `✅ Successfully kicked: ${kicked} members`,
            failed > 0 ? `❌ Failed to kick: ${failed} members` : null,
            `🎯 Role targeted: ${role.name}`,
            `📝 Reason: ${reason}`
        ].filter(Boolean).join('\n');

        await interaction.editReply(finalMessage);
    },
};
