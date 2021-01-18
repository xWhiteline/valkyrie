/* Core */
const config = require('./core/config.json');

/* Required */
const { Collection, Message } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

/* Client */
const dclient = require('./core/Client');
const client = new dclient();
client.options.http.api = "https://discord.com/api"

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(join(__dirname, 'commands', `${file}`));
    client.commands.set(command.name, command);
};

client.once('ready', async () => {
    console.log('Eutera ' + 'build: ' + config.build + " " + 'version: ' + config.version + " " + "is now online and running on SomethingCP!");
    client.user.setActivity(`${config.prefix}help`, {type: 'LISTENING'}).catch(console.error);
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) 
        return;
    
    // command related consts.
    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)); 

    if (!command) 
        return;

    if (command.args && !args.length) {
        let reply = `${message.author}, you did not provide any arguments!`;
        if (command.usage) reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
        return message.channel.send(reply);
    };

    try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!')
    };
});

/* Login the bot */
client.login(config.token);