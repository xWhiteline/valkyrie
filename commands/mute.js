module.exports = {
    name: 'mute',
    execute (message, args) {
        if(!message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
            message.reply("I need the KICK_MEMBERS & BAN_MEMBERS permissions!");
        } else {
            let user = message.mentions.members.first();

            if(user) {
                if(user.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
                    message.reply(`${user.tag} is too powerful!`);
                } else {
                    let muteRole = message.guild.roles.cache.get('781140937627009044');
                    if(muteRole) {
                        user.roles.add(muteRole);
                        message.reply(`${message.author.tag} muted ${user.tag}!`);
                    } else {
                        message.reply("the muteRole could not be found!");
                    };
                };
            } else {
                message.reply("I could not find this user!");
            };
        };
    }
};