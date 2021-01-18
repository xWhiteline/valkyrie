const Discord = require('discord.js');
const config = require('../core/config.json');

module.exports = {
    name: 'patch',
    category: 'Debug',
    description: 'This command displays the most recent patch of the bot!',
    execute (message) {
        const author = message.author.username;

        const embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('EUTERA: 2.3.0 PATCH')
            .setDescription('PATCH NOTES:')
            .addField('● Fixed the play command.', 'Just that.')
            .addField('● Changed some args in the play command.', 'Should sound the same or better.')
            .addField('● Getting ready to re-work some commands.', 'Dev stuff, don\'t worry about it!')
            .setTimestamp();
            message.channel.send(embed).catch(console.error);
    }
};