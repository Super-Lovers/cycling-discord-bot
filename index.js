// Discord.js variables
// *********************************
const Discord = require('discord.js');
const clientDiscord = new Discord.Client();

const generalChannelID = '729690910626938973';

// MongoDB variables
// *********************************
const mongo = require('mongodb').MongoClient;
const connectionString = 'mongodb://127.0.0.1:27017';
const clientMongo = new mongo(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Here we connect to the discord server and our bot
clientDiscord.login('NzI5NjkwMDY5NTAxMzQ1OTQz.XwMsew.M2sevln-y98gTv2XOY6BX6brJII');

// When the bot is initialized after client.log, this function will run
clientDiscord.once('ready', () => {
	sendMessageToChannel(generalChannelID, 'Cycling bot is online 🤖');
});

clientDiscord.on('message', (message) => {
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
			const db = clientMongo.db('cycling-bot');
			sessions = await db.collection('sessions').find().toArray();

			for (let i = 0; i < sessions.length; i++) {
				const element = sessions[i];

				if (element.author == message.author.username) {
					sendMessageToChannel(generalChannelID, element.calories);
				}
			}
		});
	}

	/**
	 * Adds a new session entry with session parameters
	 * into the mongoDB instance for that specific user.
	 */
	if (command == '$addSession') {
		const commandArguments = message.content.split(' ');
		const currentDate = new Date();
		const currentDateFormat = currentDate.getHours() + ':' + currentDate.getMinutes() + ' - ' + currentDate.getDay() + '/' + currentDate.getMonth() + '/' + currentDate.getFullYear();

		const session = {
			date: currentDateFormat,
			calories: commandArguments[1],
			distanceTravelled: commandArguments[2],
			averageSpeed: commandArguments[3],
			maxSpeed: commandArguments[4],
			duration: commandArguments[5],
			author: message.author.username,
		};

		// Uploads the session to the mongoDB
		clientMongo.connect(async () => {
			const db = clientMongo.db('cycling-bot');
			const sessions = await db.collection('sessions');

			await sessions.insertOne(session);

			const sessionPreview =
				'Session **' + session.date + '**\n\n' +
				'=> **Calories burned:** ``' + session.calories + '`` 🍕\n' +
				'=> **Distance travelled:** ``' + session.distanceTravelled + ' km`` 📐\n' +
				'=> **Average speed:** ``' + session.averageSpeed + ' km/ph`` 💨\n' +
				'=> **Maximum speed:** ``' + session.maxSpeed + ' km/ph`` 💨\n' +
				'=> **Duration:** ``' + session.duration + ' mins.`` ⏲️\n';

			message.reply(' your session was successfully saved ✅ \n' + sessionPreview);
		});
	}

	/**
	 * Replies to the user with the total average out of all
	 * his sessions' individual averages throughout history
	 */
	if (command == '$getTotalAverage') {
		clientMongo.connect(async () => {
			const db = clientMongo.db('cycling-bot');
			const sessions = await db.collection('sessions').find().toArray();
			const averages = [];
			const authorUsername = message.author.username;

			for (let i = 0; i < sessions.length; i++) {
				const element = sessions[i];

				if (sessions[i].author == authorUsername) {
					averages.push(element.averageSpeed);
				}
			}

			let averagesSum = 0;
			for (let i = 0; i < averages.length; i++) {
				const element = averages[i];
				averagesSum = parseInt(averagesSum) + parseInt(element);
			}

			const totalAverage = averagesSum / averages.length;
			message.reply(' your total average speed is ``' + totalAverage + ' km/ph`` 💨');
		});
	}

	/**
	 * Replies to the user with the total distance out of all his
	 * sessions' travelled distances summed up throughout history
	 */
	if (command == '$getTotalDistance') {
		clientMongo.connect(async () => {
			const db = clientMongo.db('cycling-bot');
			const sessions = await db.collection('sessions').find().toArray();
			const distances = [];
			const authorUsername = message.author.username;

			for (let i = 0; i < sessions.length; i++) {
				const element = sessions[i];

				if (sessions[i].author == authorUsername) {
					distances.push(element.distanceTravelled);
				}
			}

			let sumOfDistances = 0;
			for (let i = 0; i < distances.length; i++) {
				const element = distances[i];
				sumOfDistances = parseInt(sumOfDistances) + parseInt(element);
			}

			message.reply(' your total distance travelled is ``' + sumOfDistances + ' km`` 📐');
		});
	}

	if (message.content == '$help') {
		sendMessageToChannel(
			generalChannelID,
			'You can add a session in the format: \n**$addSession** ``calories`` ``distance`` ``averageSpeed`` ``maxSpeed`` ``duration``'
		);
	}
});

function sendMessageToChannel(channelId, message) {
	clientDiscord.channels.cache.get(channelId).send(message);
}