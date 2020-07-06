// Discord varibles
// *********************************
const Discord = require("discord.js");
const clientDiscord = new Discord.Client();

const generalChannelID = "729690910626938973";

// Here we connect to the discord server and our bot
clientDiscord.login("NzI5NjkwMDY5NTAxMzQ1OTQz.XwMsew.M2sevln-y98gTv2XOY6BX6brJII");

// When the bot is initialized after client.log, this function will run
clientDiscord.once('ready', function () {
    console.log("Bot is running...");

    sendMessageToChannel(generalChannelID, "Cycling bot is online!");
});

clientDiscord.on('message', function (message) {
    if (message.content == "$getSessions") {
        getSessionsFromUser(message.author.username);
    }

    var command = "";
    for (let i = 0; i < message.content.length; i++) {
        const element = message.content[i];
        if (i == message.content.length ||
            message.content[i] == " ") {
            break;
        }

        command += message.content[i];
    }
    
    if (command == "$addSession") {
        var arguments = message.content.split(' ');
        var session = {
            date: Date.now(),
            calories: arguments[1],
            distanceTravelled: arguments[2],
            averageSpeed: arguments[3],
            maxSpeed: arguments[4],
            duration: arguments[5],
            author: message.author.username,
        };
    }

    if (message.content == "$help") {
        sendMessageToChannel(
            generalChannelID,
            "You can add a session in the format: \n``$addSession date calories distance``"
        );
    }
});

function getSessionsFromUser(username) {
    for (let i = 0; i < sessions.length; i++) {
        const element = sessions[i];
        
        if (element.author == username) {
            sendMessageToChannel(generalChannelID, "Session " + element.name + " by " + username);
        }
    }
}

function sendMessageToChannel(channelId, message) {
    clientDiscord.channels.cache.get(channelId).send(message);
}