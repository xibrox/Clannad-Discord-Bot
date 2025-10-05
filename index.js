require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
} = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');
const fetch = require("node-fetch");
// const handleAutoReply = require('./autoReply');

const token = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
});

    // Command handling setup
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    // Handle slash commands
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

    const clannadQuotes = [
      "People are born to be happy.",
      "Even if you feel like you're alone, someone out there is always thinking of you.",
      "You shouldn’t be afraid of crying. Crying is a way to cleanse your heart.",
      "The world is beautiful, even if it’s full of pain and sadness.",
      "Don’t lose hope, no matter how small it is.",
      "You should cry while you still can. When you get bigger, sometimes, you can't cry even if you have something you wanna cry about.",
      "The world is beautiful, even when it’s filled with sadness and tears.",
      "I want to see you smile, even if it means I have to disappear.",
      "No matter how cold and distant people may become, on the inside something warm and precious always remains, something that never changes. To me, that’s what family is like.",
      "Time and titles do not matter in the bonds between people.",
      "The world is beautiful. Even if you're full of tears and sadness, open your eyes. Do what you want to do. Be what you want to be. Find friends. Don't be in a hurry to grow up. Take your time.",
      "He realized that he had lost sight of something important. No matter what turn he took he should have kept singing. Even if his songs couldn’t save the world, he could still sing songs for her. Don’t ever lose sight of what’s important to you.",
      "You're trying to stay unscarred, aren't you? If you've come this far, you'll have to hurt someone. The more time you take to decide, the deeper and more it'll hurt. For all of you.",
      "Nothing can stay unchanged. Fun things… Happy things… They can’t possibly remain the same.",
    ];
    
    client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    });

    client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Auto-reply handler
    // handleAutoReply(message);

    const msg = message.content.toLowerCase();

    if (msg === "!quote") {
        const quote = clannadQuotes[Math.floor(Math.random() * clannadQuotes.length)];
        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("🌸 Clannad Quote")
        .setDescription(quote);
        message.channel.send({ embeds: [embed] });
    }

    if (msg === "!roll") {
        const roll = Math.floor(Math.random() * 6) + 1;
        message.channel.send(`🎲 You rolled a ${roll}!`);
    }

    if (msg === "!coin") {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        message.channel.send(`🪙 You flipped **${result}**!`);
    }

    if (msg === "!pick") {
        const members = await message.guild.members.fetch();
        const onlineMembers = members.filter((m) => !m.user.bot);
        if (onlineMembers.size === 0) {
        message.channel.send("❌ No active members to pick from.");
        } else {
        const names = Array.from(onlineMembers.values());
        const picked = names[Math.floor(Math.random() * names.length)];
        message.channel.send(`🎯 I pick: **${picked.user.username}**!`);
        }
    }

    if (msg === "!sadscale") {
        const level = Math.floor(Math.random() * 11);
        message.channel.send(`😭 **Sadness Scale:** ${level}/10`);
    }

    if (msg === "!kotomi-violin") {
        message.channel.send(
        "🎻 Kotomi is playing her violin... brace yourself!\nhttps://i.pinimg.com/originals/3c/cb/88/3ccb880fea751a2517550761c85c20c8.gif"
        );
    }

    if (msg.startsWith("!choose ")) {
      const options = message.content
        .slice(8)
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o);
      if (options.length < 2) {
        message.channel.send("❗ Please give at least two options, separated by commas.");
      } else {
        const choice = options[Math.floor(Math.random() * options.length)];
        message.channel.send(`🎯 I choose: **${choice}**`);
      }
    }

    if (msg.startsWith("!number ")) {
        const args = message.content.slice(8).split(" ").map(Number);
        if (args.length < 2 || isNaN(args[0]) || isNaN(args[1])) {
        message.channel.send("🔢 Usage: `!number [min] [max]`");
        } else {
        const [min, max] = args;
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        message.channel.send(`🔢 Your number: **${num}**`);
        }
    }

    if (msg.startsWith("!remindme ")) {
        const parts = message.content.split(" ");
        const timeInput = parts[1];
        const reminderMsg = parts.slice(2).join(" ");

        const match = timeInput.match(/^([0-9]+)(s|m|h|d)$/);
        if (!match || !reminderMsg) {
        message.channel.send(
            "⏰ Usage: `!remindme [time] [message]` (e.g., `!remindme 10m check the oven`)"
        );
        } else {
        const amount = parseInt(match[1]);
        const unit = match[2];
        let ms = 0;
        if (unit === "s") ms = amount * 1000;
        else if (unit === "m") ms = amount * 60000;
        else if (unit === "h") ms = amount * 3600000;
        else if (unit === "d") ms = amount * 86400000;

        const MAX_DELAY = 2_147_483_647; // ~24.8 days
        if (ms > MAX_DELAY) {
            return message.channel.send("⚠️ Sorry, the maximum reminder time is 24 days.");
        }

        try {
            await message.author.send(`⏳ I'll remind you in ${amount}${unit}: "${reminderMsg}"`);
            setTimeout(() => {
            message.author.send(`⏰ Reminder: ${reminderMsg}`).catch(() => {
                console.log(`❌ Failed to DM ${message.author.tag}`);
            });
            }, ms);
        } catch (err) {
            message.channel.send("❌ I couldn't send you a DM. Please enable DMs.");
        }
        }
    }

    if (msg === "!help") {
        const mainEmbed = new EmbedBuilder()
        .setTitle("🌸 Clannad Bot Help Menu")
        .setColor("#9B59B6")
        .setDescription("Use `!help [category]` to see detailed information about specific categories.");

        const fields = [
        { name: "🎮 Fun", value: "Entertainment commands\n`!help fun`", inline: true },
        { name: "🛠️ Utility", value: "Useful tools and features\n`!help utility`", inline: true }
        ];

        // Only show moderation commands to administrators
        if (message.member.permissions.has("Administrator")) {
        fields.push({ name: "🛡️ Moderation", value: "Server management tools\n`!help moderation`", inline: true });
        }

        mainEmbed.addFields(fields)
        .setFooter({ text: "Both slash commands (/) and message commands (!) are supported" });

        message.channel.send({ embeds: [mainEmbed] });
    }

    if (msg.startsWith("!help ")) {
        const category = msg.split(" ")[1].toLowerCase();
        
        // Check if user is trying to access moderation commands without admin permissions
        if (category === 'moderation' && !message.member.permissions.has("Administrator")) {
        return message.reply("❌ You need Administrator permissions to view moderation commands.");
        }
        
        const commands = {
        fun: {
            title: "🎮 Fun Commands",
            color: "#FF69B4",
            commands: [
                { name: "quote", description: "Get a random Clannad quote", usage: "!quote" },
                { name: "roll", description: "Roll a dice (1-6)", usage: "!roll" },
                { name: "coin", description: "Flip a coin", usage: "!coin" },
                { name: "sadscale", description: "Get your current sadness level", usage: "!sadscale" },
                { name: "kotomi-violin", description: "Display Kotomi's violin gif", usage: "!kotomi-violin" }
            ]
        },
        utility: {
            title: "🛠️ Utility Commands",
            color: "#4CAF50",
            commands: [
            { name: "choose", description: "Choose between multiple options", usage: "!choose option1, option2, ..." },
            { name: "pick", description: "Pick a random server member", usage: "!pick" },
            { name: "number", description: "Generate a random number", usage: "!number [min] [max]" },
            { name: "remindme", description: "Set a reminder", usage: "!remindme [time] [message]" }
            ]
        },
        moderation: {
            title: "🛡️ Moderation Commands",
            color: "#FF4444",
            commands: [
            { name: "masskick", description: "Kick all users with a specific role", 
                usage: "!masskick [role name or mention] (reason)", 
                note: "⚠️ Requires Administrator permission" }
            ]
        }
        };

        const categoryData = commands[category];
        if (!categoryData) {
        return message.reply("❌ Invalid category! Available categories: `fun`, `utility`, `moderation`");
        }

        const embed = new EmbedBuilder()
        .setTitle(categoryData.title)
        .setColor(categoryData.color)
        .setDescription(categoryData.commands.map(cmd => 
            `**${cmd.name}**\n📝 ${cmd.description}\n🔧 Usage: \`${cmd.usage}\`${cmd.note ? `\n⚠️ ${cmd.note}` : ''}\n`
        ).join('\n'));

        message.channel.send({ embeds: [embed] });
    }

  if (msg.startsWith("!masskick ")) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ This command requires Administrator permissions to use.");
    }
    if (!message.guild.members.me.permissions.has("KickMembers")) {
      return message.reply("❌ I need the Kick Members permission to do this.");
    }
    
    // Check bot's role position
    const botRole = message.guild.members.me.roles.highest;
    if (botRole.position <= 1) {
      return message.reply("❌ The bot needs a role higher than the default role to kick members. Please move the bot's role up in the role hierarchy.");
    }

    const args = message.content.slice(10).trim().split(/ +/g);
    let role;
    let reason;

    // Check for role mention
    if (message.mentions.roles.size > 0) {
      role = message.mentions.roles.first();
      reason = args.slice(1).join(" ");
    } else {
      // No role mention, try to find by name
      const roleName = args[0].toLowerCase();
      role = message.guild.roles.cache.find(
        (r) => r.name.toLowerCase() === roleName
      );
      reason = args.slice(1).join(" ");
    }

    if (!role) {
      return message.reply("❌ Role not found. Please mention the role or use its exact name.");
    }

    // Check if the bot's role is higher than the target role
    if (botRole.position <= role.position) {
      return message.reply(`❌ Cannot kick members with the "${role.name}" role because it is higher than or equal to the bot's highest role. Please move the bot's role above the "${role.name}" role in the server settings.`);
    }

    const confirmationEmbed = new EmbedBuilder()
      .setTitle("⚠️ Mass Kick Confirmation")
      .setColor("Red")
      .setDescription(`Are you sure you want to kick all members with the role **${role.name}**?\nReply with \`yes\` to confirm or \`no\` to cancel.`)
      .addFields(
        { name: "Role", value: role.name, inline: true },
        { name: "Reason", value: reason || "No reason provided", inline: true }
      );

    const confirmMsg = await message.reply({ embeds: [confirmationEmbed] });

    const filter = m => m.author.id === message.author.id && ['yes', 'no'].includes(m.content.toLowerCase());
    try {
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const response = collected.first().content.toLowerCase();

      if (response === 'no') {
        return message.reply("✅ Mass kick cancelled.");
      }

      const members = await message.guild.members.fetch();
      
      // Debug information about the role
      console.log(`Role "${role.name}" has ${role.members.size} members`);
      
      const toKick = members.filter((member) => {
        const hasRole = member.roles.cache.has(role.id);
        const isKickable = member.kickable;
        const isNotBot = !member.user.bot;
        
        // Debug each member's status
        if (hasRole) {
          console.log(`Member ${member.user.tag}: kickable=${isKickable}, bot=${!isNotBot}`);
        }
        
        return hasRole && isKickable && isNotBot;
      });

      // Send debug info to channel
      await message.channel.send(`Debug Info:
• Role Members: ${role.members.size}
• Kickable Members Found: ${toKick.size}
• Bot's Highest Role Position: ${message.guild.members.me.roles.highest.position}
• Target Role Position: ${role.position}`);

      if (toKick.size === 0) {
        return message.reply("❌ No kickable members found with that role. This might be because:\n" +
          "• The members have higher roles than the bot\n" +
          "• The members have administrative permissions\n" +
          "• The bot's role is not high enough in the role hierarchy");
      }

      const startEmbed = new EmbedBuilder()
        .setTitle("🚫 Mass Kick Started")
        .setColor("Orange")
        .setDescription(`Starting to kick ${toKick.size} members with role "${role.name}"...`)
        .setFooter({ text: "There will be a 5-second delay between kicks to avoid rate limits." });

      await message.reply({ embeds: [startEmbed] });

      let kicked = 0;
      let failed = 0;
      let progress = 0;

      for (const member of toKick.values()) {
        try {
          await member.kick(reason || `Mass kick by ${message.author.tag}`);
          kicked++;
          progress++;
          
          // Update progress every 5 kicks
          if (progress % 5 === 0) {
            await message.channel.send(
              `⏳ Progress: ${progress}/${toKick.size} members processed...`
            );
          }
        } catch (err) {
          console.log(`❌ Couldn't kick ${member.user.tag}:`, err);
          failed++;
        }
        // Wait 5 seconds between kicks
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      const finalEmbed = new EmbedBuilder()
        .setTitle("👢 Mass Kick Completed")
        .setColor(failed === 0 ? "Green" : "Yellow")
        .addFields(
          { name: "✅ Successfully Kicked", value: kicked.toString(), inline: true },
          { name: "❌ Failed to Kick", value: failed.toString(), inline: true },
          { name: "🎯 Role Targeted", value: role.name, inline: true },
          { name: "📝 Reason", value: reason || "No reason provided", inline: false }
        );

      await message.reply({ embeds: [finalEmbed] });

    } catch (err) {
      if (err.name === 'TimeoutError') {
        return message.reply("❌ Command cancelled - you didn't respond in time.");
      }
      console.error(err);
      return message.reply("❌ An error occurred while executing the command.");
    }
  }
});

client.login(token);
