require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
// Import your static student directory file
const { studentDirectory } = require('./students');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    { name: 'schedule', description: 'View your DCSA class schedule for today' },
    { name: 'grades', description: 'Check your current term grades' }
];

// Register commands with Discord
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Successfully registered application slash commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Handle user commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Fetch the user data based on their unique Discord account ID
    const student = studentDirectory[interaction.user.id];

    // Security check: If they aren't manually added to your text file, deny access
    if (!student) {
        return interaction.reply({ 
            content: `❌ Your Discord ID (\`${interaction.user.id}\`) is not registered in the student roster. Please ask your administrator to add you to \`students.js\`.`, 
            ephemeral: true 
        });
    }

    // 1. PROCESS SCHEDULE COMMAND
    if (interaction.commandName === 'schedule') {
        const embed = new EmbedBuilder()
            .setTitle(`📅 Today's Schedule - ${student.name}`)
            .setDescription(`**ID:** ${student.studentId} \n**Track:** ${student.track}`)
            .setColor('#1a365d') // Matches DCSA Navy
            .setTimestamp();

        student.schedule.forEach(item => {
            embed.addFields({ name: item.time, value: `🔹 **${item.subject}**\n📍 ${item.room}`, inline: false });
        });

        await interaction.reply({ embeds: [embed] });
    }

    // 2. PROCESS GRADES COMMAND
    if (interaction.commandName === 'grades') {
        const embed = new EmbedBuilder()
            .setTitle(`📊 Report Card - ${student.name}`)
            .setDescription(`**Student ID:** ${student.studentId}`)
            .setColor('#3182ce') // Matches DCSA Accent Blue
            .setTimestamp();

        Object.keys(student.grades).forEach(subject => {
            embed.addFields({ name: subject, value: `Grade: **${student.grades[subject]}**`, inline: true });
        });

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
