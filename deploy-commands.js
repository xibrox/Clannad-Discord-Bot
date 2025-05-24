// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Get a random Clannad quote"),
  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a 6-sided dice"),
  new SlashCommandBuilder().setName("coin").setDescription("Flip a coin"),
  new SlashCommandBuilder()
    .setName("pick")
    .setDescription("Pick a random member in the server"),
  new SlashCommandBuilder()
    .setName("sadscale")
    .setDescription("Get a random sadness scale rating"),
  new SlashCommandBuilder()
    .setName("kotomi-violin")
    .setDescription("Send Kotomi's violin gif"),
  new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Choose between multiple options")
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription("Comma-separated list of choices")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("number")
    .setDescription("Get a random number between two values")
    .addIntegerOption((opt) =>
      opt.setName("min").setDescription("Minimum number").setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt.setName("max").setDescription("Maximum number").setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("remindme")
    .setDescription("Set a reminder")
    .addStringOption((opt) =>
      opt
        .setName("time")
        .setDescription("Time (e.g., 10m, 1h)")
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("Reminder message")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all available commands"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.token);

(async () => {
  try {
    console.log("🔃 Registering slash commands...");

    await rest.put(Routes.applicationCommands(process.env["client_id"]), {
      body: commands,
    });

    console.log("✅ Slash commands registered successfully.");
  } catch (error) {
    console.error("❌ Failed to register slash commands:", error);
  }
})();
