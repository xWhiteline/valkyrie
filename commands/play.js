const config = require("../core/config.json");
const {Util} = require ("discord.js");

const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(config.GOOGLE_API_KEY);

module.exports = {
    name: 'play',
    aliasses: ['pl'],
    category: 'music',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) 
            return message.reply(`you need to be in a voice channel to play music`).catch(console.error);

        const serverQueue = message.client.queue.get(message.guild.id);
        if (serverQueue && voiceChannel !== message.guild.me.voice.channel) 
            return message.reply(`you must be in the same channel as ${message.client.user}`).catch(console.error);

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT')) 
            return message.channel.send("I don't have permissions to connect to the voice channel");
        if(!permissions.has('SPEAK')) 
            return message.channel.send("I don't have permissions to speak in the channel");

        if (!args.length) 
            return message.reply(`Usage: ${config.prefix}play <youtube.url/name>`).catch(console.error);

        const search = args.join(" ");
        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
        const url = args[0];
        const urlValid = videoPattern.test(args[0]);

        if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
            return message.client.commands.get("playlist").execute(message, args).catch(console.error());
        };

        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            loop: false,
            playing: true
        };

        let songInfo = null;
        let song = null;

        if(urlValid) {
            try {
                songInfo = await ytdl.getInfo(url);
                song = {
                    title: Util.escapeMarkdown(songInfo.videoDetails.title),
                    duration: songInfo.videoDetails.lengthSeconds,
                    url: songInfo.videoDetails.video_url
                }
            } catch(error) {
                    console.error(error);
                    return message.reply(error.message).catch(console.error);
                };
        } else {
            try{
                const results = await youtube.searchVideos(search, 1);
                songInfo = await ytdl.getInfo(results[0].url);
                song = {
                    title: Util.escapeMarkdown(songInfo.videoDetails.title),
                    duration: songInfo.videoDetails.lengthSeconds,
                    url: songInfo.videoDetails.video_url
                };
            } catch(error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            };
        };

        if(serverQueue) {
            serverQueue.songs.push(song);
            return serverQueue.textChannel
                .send(`**${song.title}** has been added to the queue by \`${message.author.username}\``)
                .catch(console.error);
        };

        queueConstruct.songs.push(song);
        message.client.queue.set(message.guild.id, queueConstruct);

        const play = async song => {
            const queue = message.client.queue.get(message.guild.id);
            if (!song) {
                queue.voiceChannel.leave();
                message.client.queue.delete(message.guild.id);
                return;
            };

            const connection = await voiceChannel.join();
            const dispatcher = connection.play(ytdl(song.url, {filter: "audioonly", quality: "highest", opusEncoded: true, type: "opus", highWaterMark: 1 << 25}))
                .on('finish', () => {
                    if(queue.loop) {
                        let lastSong = queue.songs.shift();
                        queue.songs.push(lastSong);
                        play(queue.songs[0])
                    } else {
                        queue.songs.shift();
                        play(queue.songs[0]);
                    }
                })
                .on('error', error => {
                    repeated = repeated || 0;
                    if (repeated === 4) {
                        client.commands.get('skip').execute(message, args);
                    } else {
                        console.log(error);
                        queue.songs.shift();
                    }
                });

            dispatcher.setVolumeLogarithmic(config.volume / 100);
            message.channel.send(`**${song.title}** requested by \`${message.author.username}\` is now playing.`);
        };

        try{
            queueConstruct.connection = await voiceChannel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            play(queueConstruct.songs[0], message);
        } catch(error) {
            console.error(`I could not join the voice channel: ${error}`);
            message.client.queue.delete(message.guild.id);
            await voiceChannel.leave();
            return message.reply(`I could not join the voice channel: ${error}`);
        };
    }
};