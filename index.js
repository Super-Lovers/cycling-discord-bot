// Discord.js variables
// *********************************
const Discord = require('discord.js');
const clientDiscord = new Discord.Client();

const generalChannelID = '729690910626938973';

let sessions = [];

// MongoDB variables
// *********************************
const mongo = require('mongodb').MongoClient;
const connectionString = 'mongodb://127.0.0.1:27017';
const clientMongo = new mongo(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Here we connect to the discord server and our bot
clientDiscord.login('NzI5NjkwMDY5NTAxMzQ1OTQz.XwMsew.M2sevln-y98gTv2XOY6BX6brJII');

// When the bot is initialized after client.log, this function will run
clientDiscord.once('ready', function () {
    sendMessageToChannel(generalChannelID, 'Cycling bot is online!');
});

clientDiscord.on('message', function (message) {
    // Extracts the command part of the message
    // *****************
    let command = '';
    for (let i = 0; i < message.content.length; i++) {
        if (i == message.content.length ||
            message.content[i] == ' ') {
            break;
        }

        command += message.content[i];
    }

    // Implementations for specific commands
    // *****************
    if (command == '$getSessions') {
        let sessions = [];

        clientMongo.connect(async () => {
            let db = clientMongo.db('cycling-bot');
            sessions = await db.collection('sessions').find().toArray();

            for (let i = 0; i < sessions.length; i++) {
                const element = sessions[i];

                if (element.author == message.author.username) {
                    sendMessageToChannel(generalChannelID, element.calories);
                }
            }
        });
    }

    if (command == '$addSession') {
        let arguments = message.content.split(' ');
        const currentDate = new Date();
        let currentDateFormat = currentDate.getHours() + ':' + currentDate.getMinutes() + ' - ' + currentDate.getDay() + '/' + currentDate.getMonth() + '/' + currentDate.getFullYear();

        let session = {
            date: currentDateFormat,
            calories: arguments[1],
            distanceTravelled: arguments[2],
            averageSpeed: arguments[3],
            maxSpeed: arguments[4],
            duration: arguments[5],
            author: message.author.username,
        };

        // Uploads the session to the mongoDB
        clientMongo.connect(async () => {
            let db = clientMongo.db('cycling-bot');
            let sessions = await db.collection('sessions');

            await sessions.insertOne(session);
            sendMessageToChannel(generalChannelID, 'Session was successfully saved!');

            clientMongo.close();
        });
    }

    if (command == '$getTotalAverage') {
        let averages = [];

        for (let i = 0; i < sessions.length; i++) {
            const element = sessions[i];

            if (sessions[i].author == message.author.username) {
                averages.push(element.averageSpeed);
            }
        }

        let averagesSum = 0;
        for (let i = 0; i < averages.length; i++) {
            const element = averages[i];
            averagesSum = parseInt(averagesSum) + parseInt(element);
        }

        let totalAverage = averagesSum / averages.length;
        sendMessageToChannel(generalChannelID, 'Your total average is ``' + totalAverage + ' km/ph``');
    }

    if (command == '$getTotalDistance') {
        let distances = [];

        for (let i = 0; i < sessions.length; i++) {
            const element = sessions[i];

            if (sessions[i].author == message.author.username) {
                distances.push(element.distanceTravelled);
            }
        }

        let sumOfDistances = 0;
        for (let i = 0; i < distances.length; i++) {
            const element = distances[i];
            sumOfDistances = parseInt(sumOfDistances) + parseInt(element);
        }

        sendMessageToChannel(generalChannelID, 'Your total distance travelled is ``' + sumOfDistances + ' km``');
    }

    if (message.content == '$help') {
        sendMessageToChannel(
            generalChannelID,
            'You can add a session in the format: \n``$addSession calories distance averageSpeed maxSpeed duration``'
        );
    }
});

function sendMessageToChannel(channelId, message) {
    clientDiscord.channels.cache.get(channelId).send(message);
}