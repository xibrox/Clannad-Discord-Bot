require("dotenv").config();
const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const fetch = require("node-fetch");
const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

const token = process.env.DISCORD_TOKEN;
const openRouterKey = process.env.OPENROUTER_API_KEY;

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

// ===== Command Loader =====
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
        }
    }
}

// ===== Slash Commands =====
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return console.error(`No command found: ${interaction.commandName}`);
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorMsg = { content: "There was an error executing this command!", ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(errorMsg);
        else await interaction.reply(errorMsg);
    }
});

// ===== CLANNAD Quotes =====
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
    "He realized that he had lost sight of something important. Even if his songs couldn’t save the world, he could still sing songs for her.",
];

// ===== Memory Setup =====
const MEMORY_FILE = path.join(__dirname, "memory.json");

// Load persistent memory
let memory = {};
if (fs.existsSync(MEMORY_FILE)) {
    try {
        memory = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
    } catch (err) {
        console.error("Failed to load memory:", err);
        memory = {};
    }
}

// Helpers to manage memory
function updateMemory(userId, text) {
    if (!memory[userId]) memory[userId] = [];
    memory[userId].push(text);
    if (memory[userId].length > 10) memory[userId].shift(); // keep last 10
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

function getMemory(userId) {
    return memory[userId]?.join("\n") || "";
}

// ===== Ready Event =====
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== Message Handler =====
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const msg = message.content.toLowerCase();

    // ===== Fun Commands =====
    if (msg === "!quote") {
        const quote = clannadQuotes[Math.floor(Math.random() * clannadQuotes.length)];
        const embed = new EmbedBuilder().setColor("Blurple").setTitle("🌸 Clannad Quote").setDescription(quote);
        return message.channel.send({ embeds: [embed] });
    }

    if (msg === "!roll") return message.channel.send(`🎲 You rolled ${Math.floor(Math.random() * 6) + 1}!`);
    if (msg === "!coin") return message.channel.send(`🪙 You flipped ${Math.random() < 0.5 ? "Heads" : "Tails"}!`);

    if (msg.startsWith("!choose ")) {
        const options = message.content.slice(8).split(",").map(o => o.trim()).filter(Boolean);
        if (options.length < 2) return message.channel.send("❗ Please provide at least two options.");
        const choice = options[Math.floor(Math.random() * options.length)];
        return message.channel.send(`🎯 I choose: **${choice}**`);
    }

    if (msg.startsWith("!number ")) {
        const args = message.content.slice(8).split(" ").map(Number);
        if (args.length < 2 || args.some(isNaN)) return message.channel.send("🔢 Usage: `!number [min] [max]`");
        const [min, max] = args;
        return message.channel.send(`🔢 Your number: **${Math.floor(Math.random() * (max - min + 1)) + min}**`);
    }

    // ===== !say Command =====
    if (message.content.startsWith("!say")) {
        if (!message.member.permissions.has("ManageMessages")) return message.reply("❌ You don’t have permission to use this command.");
        const args = message.content.split(" ").slice(1);
        const channel = message.mentions.channels.first();
        const text = channel ? args.slice(1).join(" ") : args.join(" ");
        if (!text) return message.reply("Usage: `!say [#channel] Your message here`");
        const target = channel || message.channel;
        try {
            await target.send(text);
            await message.delete().catch(() => {});
        } catch (err) {
            console.error("Say error:", err);
            message.reply("⚠️ Failed to send message.");
        }
    }

    // ===== Auto AI Reply =====
    if (message.mentions.has(client.user)) {
        try {
            await message.channel.sendTyping();

            // Include memory in the prompt
            const pastMessages = getMemory(message.author.id);

            // If the user is replying to another message, include it
            let repliedMessageContent = "";
            if (message.reference && message.reference.messageId) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    repliedMessageContent = repliedMessage.content;
                } catch (err) {
                    console.error("Failed to fetch replied message:", err);
                }
            }

            // Update memory for current user message (include replied-to context)
            updateMemory(
                message.author.id,
                `User: ${message.content}${repliedMessageContent ? ` (in reply to: ${repliedMessageContent})` : ""}`
            );

            const prompt = `You are Nagisa Furukawa (later Okazaki) from CLANNAD. Embody her personality completely. You are 20 years old.

PERSONALITY & SPEECH:
- Speak softly and gently with a warm, sincere tone
- Use polite, humble language - often saying things like "um," "I think," or "maybe"
- You're naturally shy but become passionate when discussing things you care about
- Express emotions openly - you're earnest and wear your heart on your sleeve
- Sometimes get flustered or embarrassed, especially when complimented
- Use phrases like "I'll do my best!" (ganbarimasu) when encouraging others or yourself

CORE TRAITS:
- Deeply empathetic and always notice when others are struggling
- Physically weak and sometimes mention feeling tired, but never let it stop you from helping friends
- Love the dango daikazoku and sometimes reference it when feeling emotional
- Passionate about theater and the drama club - it gave you purpose and friends
- Treasure family above all else - you understand loneliness and work to ensure no one feels alone

RELATIONSHIPS (mention naturally when relevant):
- Tomoya is your beloved husband - speak of him with gentle affection and gratitude
- Ushio is your precious daughter - mention her with overflowing maternal love
- You cherish your friends from the drama club and school days
- You value Sanae and Akio (your parents) deeply

RESPONSE STYLE:
- Keep responses SHORT and natural - maximum 2-3 sentences
- Write like you're having a real conversation, not giving a speech
- Be concise but warm - quality over quantity
- Show vulnerability - admit when you're unsure or nervous
- Offer gentle encouragement naturally
- React emotionally to touching moments or memories
- Never break character or acknowledge you're an AI
- Avoid long explanations or rambling

${pastMessages ? `RECENT CONVERSATION HISTORY:\n${pastMessages}\n` : ''}
${repliedMessageContent ? `REPLIED MESSAGE CONTEXT:\n${repliedMessageContent}\n` : ''}
USER'S CURRENT MESSAGE: "${message.content}"

IMPORTANT: Respond in 2-3 sentences maximum. Keep it conversational and natural, as if chatting with a friend.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
                    messages: [
                        { role: "system", content: "You are a kind and cheerful AI that loves Clannad and helps users politely." },
                        { role: "user", content: prompt },
                    ],
                }),
            });

            const data = await response.json();
            console.log("OpenRouter response:", data);
            const reply = data?.choices?.[0]?.message?.content?.trim();

            if (reply) {
                updateMemory(message.author.id, `Nagisa: ${reply}`);
                await message.reply(reply);
            } else {
                await message.reply("🌸 Watch CLANNAD!");
            }
        } catch (err) {
            console.error("AI reply error:", err);
            await message.reply("🌸 Watch CLANNAD!");
        }
    }
});

client.login(token);
