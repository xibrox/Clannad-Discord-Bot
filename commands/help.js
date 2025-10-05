const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Command category to show')
                .setRequired(false)
                .addChoices(
                    { name: 'Fun', value: 'fun' },
                    { name: 'Utility', value: 'utility' },
                    { name: 'Moderation', value: 'moderation' }
                )),

    async execute(interaction) {
        const category = interaction.options.getString('category');
        
        const commands = {
            fun: {
                title: "🎮 Fun Commands",
                commands: [
                    { name: "quote", description: "Get a random Clannad quote", usage: "/quote" },
                    { name: "roll", description: "Roll a dice (1-6)", usage: "/roll" },
                    { name: "coin", description: "Flip a coin", usage: "/coin" },
                    { name: "sadscale", description: "Get your current sadness level", usage: "/sadscale" },
                    { name: "kotomi-violin", description: "Display Kotomi's violin gif", usage: "!kotomi-violin" }
                ]
            },
            utility: {
                title: "🛠️ Utility Commands",
                commands: [
                    { name: "choose", description: "Choose between multiple options", usage: "/choose [options]" },
                    { name: "pick", description: "Pick a random server member", usage: "!pick" },
                    { name: "number", description: "Generate a random number", usage: "!number [min] [max]" },
                    { name: "remindme", description: "Set a reminder", usage: "!remindme [time] [message]" }
                ]
            },
            moderation: {
                title: "🛡️ Moderation Commands",
                commands: [
                    { name: "masskick", description: "Kick all users with a specific role", usage: "/masskick [role] (reason)", 
                      note: "⚠️ Requires Kick Members permission" }
                ]
            }
        };

        const embedColor = {
            fun: "#FF69B4", // Pink
            utility: "#4CAF50", // Green
            moderation: "#FF4444" // Red
        };

        if (category) {
            // Check if user is trying to access moderation commands without admin permissions
            if (category === 'moderation' && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ 
                    content: "❌ You need Administrator permissions to view moderation commands.", 
                    ephemeral: true 
                });
            }

            const categoryData = commands[category];
            if (!categoryData) {
                return interaction.reply({ content: "❌ Invalid category!", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(categoryData.title)
                .setColor(embedColor[category])
                .setDescription(categoryData.commands.map(cmd => 
                    `**${cmd.name}**\n📝 ${cmd.description}\n🔧 Usage: \`${cmd.usage}\`${cmd.note ? `\n⚠️ ${cmd.note}` : ''}\n`
                ).join('\n'));

            return interaction.reply({ embeds: [embed] });
        }

        // If no category specified, show all categories
                const embed = new EmbedBuilder()
            .setTitle("🌸 Clannad Bot Help Menu")
            .setColor("#9B59B6")
            .setDescription("Use `/help [category]` to see detailed information about specific categories.");

        const fields = [
            { name: "🎮 Fun", value: "Entertainment commands\n`/help fun`", inline: true },
            { name: "🛠️ Utility", value: "Useful tools and features\n`/help utility`", inline: true }
        ];

        // Only show moderation commands to administrators
        if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            fields.push({ name: "🛡️ Moderation", value: "Server management tools\n`/help moderation`", inline: true });
        }

        embed.addFields(fields)
            .setFooter({ text: "Both slash commands (/) and message commands (!) are supported" });

        await interaction.reply({ embeds: [mainEmbed] });
    },
};
