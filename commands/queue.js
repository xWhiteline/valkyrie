const config = require("../core/config.json");
const MAX_PLAYLIST_SIZE = config.MAX_PLAYLIST_SIZE;

module.exports = {
    name: 'queue',
    aliases: ['q'],
    category: 'music',
    execute (message, args) {
        const serverQueue = message.client.queue.get(message.guild.id);
            if(!serverQueue)
                return message.reply("there is nothing playing");

        message.channel.send(`**Song Queue:** ${serverQueue.songs.slice(1, MAX_PLAYLIST_SIZE).map(song => `**-** ${song.title}`).join('\n')}`, {split: true});
        message.channel.send(`**Now Playing:** ${serverQueue.songs[0].title}`, {split: true});
    }
};