const config = require("../core/config.json");

module.exports = {
    name: 'volume',
    aliases: ['v'],
    category: 'music',
    execute (message, args) {
        if(!args[0]) {
            message.reply('the volume is currently at' + ' ' + `${config.volume}%!`);
        } else {
            const voiceChannel = message.member.voice.channel;
                if(!voiceChannel)
                    return message.reply("you need to be in a voice channel to change the volume!");

            const serverQueue = message.client.queue.get(message.guild.id);
                if(!serverQueue)
                    return message.reply("there is nothing playing!");

            config.volume = args[0];
            serverQueue.connection.dispatcher.setVolume(config.volume / 100);
            message.channel.send(`The volume was set to: ${config.volume}% by \`${message.author.username}\``);
        };
    }
};