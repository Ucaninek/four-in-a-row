require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();

const token = process.env.DISCORD_TOKEN;
const defaultPrefix = '-';
let prefix = defaultPrefix;

let langJSON = JSON.parse(fs.readFileSync("db\\lang\\en.json"));

var obj = {
    'E': ':black_large_square:',
    'R': ':red_circle:',
    'B': ':blue_circle:'
}

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}`);
    bot.user.setActivity('Four in a row with zemi');


});

bot.on('message', message => {

    if (message.author.bot) return;

    const prefixes = JSON.parse(fs.readFileSync("db\\prefix.json"));
    const lang = JSON.parse(fs.readFileSync("db\\lang.json"));

    if (lang[message.guild.id] == 'tr') langJSON = JSON.parse(fs.readFileSync("db\\lang\\tr.json"));


    if (prefixes.hasOwnProperty(message.guild.id)) {

        const customPrefix = prefixes[message.guild.id];

        prefix = customPrefix;
    }

    if (message.mentions.users.first() && message.mentions.users.first().id == bot.user.id) message.channel.send(new Discord.MessageEmbed().setTitle(`${langJSON.general.myPrefix} "${prefix}"`).setColor('GREEN'));

    if (!message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).trim().split(' ');
    const command = args[0].toLowerCase();

    switch (command) {

        case 'help':
            const userEmbed = new Discord.MessageEmbed().setColor('GREEN').setTitle(`${langJSON.help.userEmbed.title}`).setDescription(`${prefix}${langJSON.help.userEmbed.description}`);
            const adminEmbed = new Discord.MessageEmbed().setColor('GREEN').setTitle(`${langJSON.help.adminEmbed.title}`).setDescription(`${prefix}${langJSON.help.adminEmbed.description}${prefix}\n${langJSON.help.adminEmbed.description_2}`);
            message.channel.send(userEmbed);
            if (message.member.hasPermission('ADMINISTRATOR')) message.channel.send(adminEmbed);
            break;

        case 'prefix':
            if (!message.member.hasPermission('MANAGE_GUILD')) { message.channel.send(new Discord.MessageEmbed().setColor('RED').setTitle(langJSON.general.accessDenied).setDescription(langJSON.general.manageGuild)); return; }
            if (!args[1]) { message.channel.send(new Discord.MessageEmbed().setColor('RED').setTitle(langJSON.general.wrongUsage).setDescription(`\`${prefix}prefix {char}\``)); return; }
            prefixes[message.guild.id] = args[1];
            const str = JSON.stringify(prefixes);
            fs.writeFileSync('db\\prefix.json', str);
            prefix = args[1];

            message.channel.send(new Discord.MessageEmbed().setColor('GREEN').setTitle(langJSON.prefix.successEmbed.title));
            break;

        case 'language':
            if (!message.member.hasPermission('MANAGE_GUILD')) { message.channel.nd(new Discord.MessageEmbed().setColor('RED').setTitle(langJSON.general.accessDenied).setDescription(langJSON.general.manageGuild)); return; }
            if (!args[1]) { message.channel.send(new Discord.MessageEmbed().setColor('RED').setTitle(langJSON.general.wrongUsage).setDescription(`\`${prefix}language {char}\``)); return; }
            switch (args[1]) {
                case 'en':
                    delete lang[message.guild.id];
                    break;
                case 'tr':
                    lang[message.guild.id] = 'tr';
                    break;
                default:
                    message.channel.send(langJSON.language.noSuchLang);
                    return;
                    break;
            }

            const langstr = JSON.stringify(lang);
            fs.writeFileSync('db\\lang.json', langstr);

            message.channel.send(new Discord.MessageEmbed().setColor('GREEN').setTitle(langJSON.language.successEmbed.title));
            break;

        case 'play':

            if (!message.mentions.users.first()) { message.channel.send(new Discord.MessageEmbed().setColor("#edff24").setTitle(langJSON.play.noMentionEmbed.title)); return; }

            if (message.mentions.users.first().id == message.author.id) { message.channel.send(langJSON.play.selfMentionEmbed.title); return; }

            if (message.mentions.users.first().bot) { message.channel.send(langJSON.play.botMentionEmbed.title); return; }

            instance(message, message.author.id, message.mentions.users.first().id);

            break;
        case 'servers':
            if (message.author.id != 797579662624292865) return;
            bot.guilds.fetch();
            message.channel.send(bot.guilds.cache.array().length);
            break;
    }

});

//#region game stuff


async function instance(message, p1, p2) {

    var current = p1; //curr player
    var object = obj.R; //cur obj
    var gameID = 404;
    var reacted = false;
    var winner = 404;

    var table = [
        [obj.E, obj.E, obj.E, obj.E],
        [obj.E, obj.E, obj.E, obj.E],
        [obj.E, obj.E, obj.E, obj.E],
        [obj.E, obj.E, obj.E, obj.E]
    ];

    var winHandler = function(table) {
        if (areEqual(table[0][0], table[0][1], table[0][2], table[0][3]) && table[0][0] != obj.E)
            if (table[0][0] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[1][0], table[1][1], table[1][2], table[1][3]) && table[1][0] != obj.E)
            if (table[1][0] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[2][0], table[2][1], table[2][2], table[2][3]) && table[2][0] != obj.E)
            if (table[2][0] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[3][0], table[3][1], table[3][2], table[3][3]) && table[3][0] != obj.E)
            if (table[3][0] == obj.R) return p1;
            else return p2;

        else if (areEqual(table[0][0], table[1][0], table[2][0], table[3][0]) && table[0][0] != obj.E)
            if (table[0][0] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[0][1], table[1][1], table[2][1], table[3][1]) && table[0][1] != obj.E)
            if (table[0][1] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[0][2], table[1][2], table[2][2], table[3][2]) && table[0][2] != obj.E)
            if (table[0][2] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[0][3], table[1][3], table[2][3], table[3][3]) && table[0][3] != obj.E)
            if (table[0][3] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[0][0], table[1][1], table[2][2], table[3][3]) && table[0][3] != obj.E)
            if (table[0][0] == obj.R) return p1;
            else return p2;
        else if (areEqual(table[0][4], table[1][3], table[2][2], table[3][1]) && table[0][4] != obj.E)
            if (table[0][0] == obj.R) return p1;
            else return p2;
        else return 404;
    }

    var reactionHandler = {
        core: function(message) {
            message.channel.messages.fetch({ around: gameID, limit: 1 }).then(async msg_ => {

                const msg = msg_.first();
                msg.edit(build_obj(table, current, p1));

                if (!reacted) {
                    await msg.react('🖤');
                    await msg.react('💙');
                    await msg.react('💛');
                    await msg.react('💚');
                    reacted = true;
                }

                gameID = msg.id;

                msg.awaitReactions((reaction, user) => user.id == current && (reaction.emoji.name == '🖤' || reaction.emoji.name == '💙' || reaction.emoji.name == '💛' || reaction.emoji.name == '💚'), { max: 1, time: 300000 }).then(collected => {
                    if (!collected.first()) {
                        msg.delete().catch(err => {});
                        message.channel.send(langJSON.game.expired);
                    }
                    if (collected.first().emoji.name == '🖤') gameEvents.fire(0, message);
                    if (collected.first().emoji.name == '💙') gameEvents.fire(1, message);
                    if (collected.first().emoji.name == '💛') gameEvents.fire(2, message);
                    if (collected.first().emoji.name == '💚') gameEvents.fire(3, message);

                    collected.first().users.remove(collected.first().users.cache.last().id);
                });
            });
        }
    }

    var gameEvents = {
        fire: function(row, message) {
            if (current == p1) object = obj.R;
            else object = obj.B;

            if (table[3][row] == obj.E) table[3][row] = object;
            else if (table[2][row] == obj.E) table[2][row] = object;
            else if (table[1][row] == obj.E) table[1][row] = object;
            else if (table[0][row] == obj.E) table[0][row] = object;
            else {
                reactionHandler.core(message);
                return;
            }
            if (current == p1) current = p2;
            else current = p1;

            winner = winHandler(table);

            if (winner != 404) {
                message.channel.messages.fetch({ around: gameID, limit: 1 }).then(async msg => {
                    msg.first().delete();
                });
                const userw = bot.users.cache.get(winHandler(table)).username;
                const heyy = bot.emojis.cache.get("796341587063734273");
                message.channel.send(`${heyy} **` + userw + `** ${langJSON.game.win}`)
                return;
            }

            const Tfilter = (cVal) => cVal == obj.R || cVal == obj.B;

            if (table.every(Tfilter)) {
                message.channel.messages.fetch({ around: gameID, limit: 1 }).then(async msg => {
                    const catto = bot.emojis.cache.get("796338082445000755");
                    message.channel.send(`Tie! ${catto}`)
                });
            }

            reactionHandler.core(message);
        }
    }

    message.channel.send(langJSON.game.starting).then(sent => {
        gameID = sent.id;
    });

    await new Promise(r => setTimeout(r, 500));

    reactionHandler.core(message);
}

function build_obj(table, current, p1) {
    let output = '';
    table.forEach(line => {
        line.forEach(cell => {
            output += cell;
        })
        output += '\n';
    })
    const heyy = bot.emojis.cache.get("796341587063734273")
    if (current == p1) return `${heyy}:regional_indicator_p::one::recycle:\n` + output;
    else return `${heyy}:regional_indicator_p::two::recycle:\n` + output;
}


function areEqual() {
    var len = arguments.length;
    for (var i = 1; i < len; i++) {
        if (arguments[i] === null || arguments[i] !== arguments[i - 1])
            return false;
    }
    return true;
}

//#endregion

bot.login(token);