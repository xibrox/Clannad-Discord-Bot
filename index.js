const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const token = process.env["token"];
const clientId = process.env["client_id"];
const guildId = process.env["guild_id"];

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

    const msg = message.content.toLowerCase();

    if (msg === "!quote") {
        const quote =
        clannadQuotes[Math.floor(Math.random() * clannadQuotes.length)];
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
        "🎻 Kotomi is playing her violin... brace yourself!\nhttps://i.pinimg.com/originals/3c/cb/88/3ccb880fea751a2517550761c85c20c8.gif",
        );
    }

    if (msg.startsWith("!choose ")) {
        const options = message.content
        .slice(8)
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o);
        if (options.length < 2) {
        message.channel.send(
            "❗ Please give at least two options, separated by commas.",
        );
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

        const match = timeInput.match(/^(\d+)(s|m|h)$/);
        if (!match || !reminderMsg) {
        message.channel.send(
            "⏰ Usage: `!remindme [time] [message]` (e.g., `!remindme 10m check the oven`)",
        );
        } else {
        const amount = parseInt(match[1]);
        const unit = match[2];
        let ms = 0;
        if (unit === "s") ms = amount * 1000;
        if (unit === "m") ms = amount * 60000;
        if (unit === "h") ms = amount * 3600000;

        const MAX_DELAY = 2_147_483_647; // ~24.8 days
        if (ms > MAX_DELAY) {
            return message.channel.send(
            "⚠️ Sorry, the maximum reminder time is 24 days.",
            );
        }

        message.author
            .send(`⏳ I'll remind you in ${amount}${unit}: "${reminderMsg}"`)
            .catch(() => {
            message.channel.send(
                "❌ I couldn't send you a DM. Please enable DMs.",
            );
            return;
            });

        setTimeout(() => {
            message.author.send(`⏰ Reminder: ${reminderMsg}`).catch(() => {
            console.log(`❌ Failed to DM ${message.author.tag}`);
            });
        }, ms);
        }
    }

    if (msg === "!help") {
        const embed = new EmbedBuilder().setTitle("🛠 Help Menu").setColor("Green")
        .setDescription(`**Available Commands:**\n
    \`!quote\` – Random Clannad quote\n\`!roll\` – Roll a dice\n\`!coin\` – Flip a coin\n\`!pick\` – Random member\n\`!sadscale\` – Sadness scale\n\`!kotomi-violin\` – Violin gif\n\`!choose a,b,c\` – Pick one\n\`!number min max\` – Random number\n\`!remindme 10m message\` – Reminder\n\`!help\` – This list`);

        message.channel.send({ embeds: [embed] });
    }
});

client.login(token);
