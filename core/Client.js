const { Client, Collection } = require('discord.js');

module.exports = class extends Client {
    constructor(client_config) {
        super ({
            disableMentions: 'everyone'
        });

        this.commands = new Collection();

		this.queue = new Map();
    }
}