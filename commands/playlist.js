const config = require("../core/config.json");
const Discord = require ("discord.js");

/* YouTube */
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(config.GOOGLE_API_KEY);

const MAX_PLAYLIST_SIZE = config.MAX_PLAYLIST_SIZE;

module.exports = {
    name: 'playlist',
    category: 'Music',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) return message.reply("you need to be in a voice channel to play music");
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT')) return message.channel.send("I don't have permissions to connect to the voice channel");
        if(!permissions.has('SPEAK')) return message.channel.send("I don't have permissions to speak in the channel");
        
        const serverQueue = message.client.queue.get(message.guild.id);

        if (!args.length)
            return message
                .reply(`Usage: ${message.client.prefix}play <name>`)
                .catch(console.error);
        if (serverQueue && voiceChannel !== message.guild.me.voice.channel)
            return message.reply(`you must be in the same channel as ${message.client.user}`).catch(console.error);

        const search = args.join(" ");
        const pattern = /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/;
        const url = args[0];
        const urlValid = pattern.test(args[0]);

        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            loop: false,
            playing: true
        };

        let song = null;
        let playlist = null;
        let videos = [];

        if (urlValid) {
        try {
            playlist = await youtube.getPlaylist(url);
            videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
        } catch (error) {
            console.error(error);
            return message.reply("I could not find the playlist!").catch(console.error);
        };
    
        } else if (scdl.isValidUrl(args[0])) {
            if (args[0].includes("/sets/")) {
                message.channel.send("⌛ fetching the playlist...");
                playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID);
                videos = playlist.tracks.map((track) => ({
                title: track.title,
                url: track.permalink_url,
                duration: track.duration / 1000
                }));
        };

        } else {
            try {
                const results = await youtube.searchPlaylists(search, 1);
                playlist = results[0];
                videos = await playlist.getVideos();
            } catch (error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            };
        }

        const newSongs = videos.map((video) => {
            return (song = {
                title: video.title,
                url: video.url,
                duration: video.durationSeconds
            });
        });

        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

        const songs = serverQueue ? serverQueue.songs : queueConstruct.songs;

        let playlistEmbed = new Discord.MessageEmbed()
            .setTitle(`${playlist.title}`)
            .setDescription(songs.map((song, index) => `${index + 1}. ${song.title}`))
            .setURL(playlist.url)
            .setColor("#F8AA2A")
            .setTimestamp();

        if (playlistEmbed.description.length >= 2048)
        playlistEmbed.description = playlistEmbed.description.substr(0, 2007) + "\nPlaylist larger than character limit...";

        message.channel.send(`\`${message.author.username}\` has started a playlist`, playlistEmbed);

        if (!serverQueue) {
            message.client.queue.set(message.guild.id, queueConstruct);

            const play = async song => {
                const queue = message.client.queue.get(message.guild.id);
                if (!song) {
                    queue.voiceChannel.leave();
                    message.client.queue.delete(message.guild.id);
                    return;
                }
                const connection = await voiceChannel.join();
                const dispatcher = connection.play(ytdl(song.url, {filter: "audioonly", quality: "highest", fmt: "mp3", highWaterMark: 1 << 25}))
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
                    console.log(error)
                    });
                    
                dispatcher.setVolumeLogarithmic(config.volume / 100);
                message.channel.send(`Start playing **${song.title}**`);
            };

        try {
            queueConstruct.connection = await voiceChannel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            play(queueConstruct.songs[0], message);
        } catch (error) {
            console.error(error);
            message.client.queue.delete(message.guild.id);
            await voiceChannel.leave();
            return message.reply(`I could not join the channel: ${error.message}`).catch(console.error);
        };
    }
}};