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

clientDiscord.on('message', async (message) => {
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

	/**
	 * Checks if the user sending the message has a "profile" in the mongoDB
	 * and returns the profile object or creates it and then returns it.
	 */
	let userObject = 'none';
	clientMongo.connect(async () => {
		const db = clientMongo.db('cycling-bot');
		const usersArray = await db.collection('users').find().toArray();
		const users = await db.collection('users');

		for (let i = 0; i < usersArray.length; i++) {
			const element = usersArray[i];

			if (element.author == message.author.username) {
				userObject = element;
				break;
			}
		}

		if (userObject == 'none') {
			const newUser = {
				'state': 'main',
				'author': message.author.username,
			};

			userObject = newUser;
			await users.insertOne(newUser);
		}
	});

	/**
	 * Replies back to the user with the last session he added.
	 */
	if (message.content == '$getSession') {
		if (userObject.state == 'browsing') {
			message.reply(' please exit browsing pages before issuing other commands ❌');
			return;
		}

		clientMongo.connect(async () => {
			const db = clientMongo.db('cycling-bot');
			const sessions = await db.collection('sessions').find().toArray();

			let latestSessionFromAuthor = 'none';
			for (let i = 0; i < sessions.length; i++) {
				const element = sessions[i];

				if (element.author == message.author.username) {
					latestSessionFromAuthor = element;
				}
			}

			if (latestSessionFromAuthor == 'none') {
				message.reply(' you don\'t have any sessions to retrieve ❌');
			} else {
				message.reply(getSessionString(latestSessionFromAuthor));
			}
		});
	}

	/**
	 * Replies back to the user how many sessions were found
	 * based on the given session/s date and displays them.
	 */
	if (command == '$getSession' && message.content.length > command.length) {
		// Retrieving the title from the command string
		let indexOfFirstQuote = 0;
		let indexOfLastQuote = 0;

		let isFirstQuoteFound = false;

		const messageText = message.content;
		for (let i = 0; i < messageText.length; i++) {
			if (messageText[i] == '"' && isFirstQuoteFound == false) {
				indexOfFirstQuote = i;
				isFirstQuoteFound = true;
			}

			if (messageText[i] == '"' && isFirstQuoteFound == true) {
				indexOfLastQuote = i;
			}
		}

		const commandArguments = (messageText.substring(0, indexOfFirstQuote - 1) + messageText.substring(indexOfLastQuote + 1, messageText.length)).split(' ');

		const sessionTitle = messageText.substring(indexOfFirstQuote, indexOfLastQuote + 1);
		const foundSessions = [];

		clientMongo.connect(async () => {
			const db = clientMongo.db('cycling-bot');
			const sessions = await db.collection('sessions').find().toArray();
			const users = await db.collection('users');

			for (let i = 0; i < sessions.length; i++) {
				const element = sessions[i];

				if (element.author != message.author.username) {
					continue;
				}

				// 15:38 - 2/6/2020 => [15:38 ], [ 2/6/2020] => [ 2, 6, 2020]
				const elementDate = element.date.split('-')[1].split('/');
				const elementDay = parseInt(elementDate[0]);
				const elementMonth = parseInt(elementDate[1]);
				const elementYear = parseInt(elementDate[2]);
				const elementTitle = element.title;

				if (indexOfFirstQuote == 0) {
					const sessionDay = commandArguments[1];
					const sessionMonth = commandArguments[2];
					const sessionYear = commandArguments[3];

					if (sessionDay == elementDay &&
						sessionMonth == elementMonth &&
						sessionYear == elementYear) {

						foundSessions.push(element);
					}
				} else if (sessionTitle == elementTitle) {

					foundSessions.push(element);
				}
			}

			if (foundSessions.length == 0) {
				message.reply(' no sessions were found ❌');
			} else if (foundSessions.length == 1) {
				message.reply(' ' + foundSessions.length + ' session was found ✅\n');

				sendMessageToChannel(generalChannelID, (getSessionString(foundSessions[0])));
			} else if (foundSessions.length > 1) {
				message.reply(' ' + foundSessions.length + ' sessions were found ✅\n');
				userObject.state = 'browsing';

				await users.updateOne(
					{ 'author': userObject.author },
					{ $set: { 'state': userObject.state } },
				);

				message.channel.send(printPageOfSessions(foundSessions, 1));
			}
		});
	}

	/**
	 * Adds a new session entry with session parameters
	 * into the mongoDB instance for that specific user.
	 */
	if (command == '$addSession') {
		if (userObject.state == 'browsing') {
			message.reply(' please exit browsing pages before issuing other commands ❌');
			return;
		}

		const currentDate = new Date();
		const currentDateFormat = currentDate.getHours() + ':' + currentDate.getMinutes() + ' - ' + currentDate.getDay() + '/' + currentDate.getMonth() + '/' + currentDate.getFullYear();

		// Retrieving the title from the command string
		let indexOfFirstQuote = 0;
		let indexOfLastQuote = 0;

		let isFirstQuoteFound = false;

		const messageText = message.content;
		for (let i = 0; i < messageText.length; i++) {
			if (messageText[i] == '"' && isFirstQuoteFound == false) {
				indexOfFirstQuote = i;
				isFirstQuoteFound = true;
			}

			if (messageText[i] == '"' && isFirstQuoteFound == true) {
				indexOfLastQuote = i;
			}
		}

		const commandArguments = (messageText.substring(0, indexOfFirstQuote - 1) + messageText.substring(indexOfLastQuote + 1, messageText.length)).split(' ');

		const session = {
			title: messageText.substring(indexOfFirstQuote, indexOfLastQuote + 1),
			calories: commandArguments[1],
			distanceTravelled: commandArguments[2],
			averageSpeed: commandArguments[3],
			maxSpeed: commandArguments[4],
			duration: commandArguments[5],
			date: currentDateFormat,
			author: message.author.username,
		};

		// Uploads the session to the mongoDB
		clientMongo.connect(async () => {
			const db = clientMongo.db('cycling-bot');
			const sessions = await db.collection('sessions');

			await sessions.insertOne(session);

			message.reply(' your session was successfully saved ✅ \n' + getSessionString(session));
		});
	}

	/**
	 * Replies to the user with the total average out of all
	 * his sessions' individual averages throughout history
	 */
	if (command == '$getTotalAverage') {
		if (userObject.state == 'browsing') {
			message.reply(' please exit browsing pages before issuing other commands ❌');
			return;
		}

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
		if (userObject.state == 'browsing') {
			message.reply(' please exit browsing pages before issuing other commands ❌');
			return;
		}

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

	/**
	 * Replies to the user with the total distance out of all his
	 * sessions' travelled distances summed up throughout history
	 */
	if (message.content == '$help') {
		message.reply(
			' here are the commands: \n' +
			'**$addSession** ``"title in quotes"`` ``calories`` ``distance`` ``average speed`` ``max speed`` ``duration``\n' +
			'**$getSession** ``["title in quotes"]`` ``day`` ``month`` ``year``\n\n'
		);
	}
});

function sendMessageToChannel(channelId, message) {
	clientDiscord.channels.cache.get(channelId).send(message);
}

/**
 * Returns the given session's details in a well-formatted string
 */
function getSessionString(session) {
	return 'Session **' + session.title.substring(1, session.title.length - 1) + '** from [' + session.date + ']\n\n' +
		'=> **Calories burned:** ``' + session.calories + '`` 🍕\n' +
		'=> **Distance travelled:** ``' + session.distanceTravelled + ' km`` 📐\n' +
		'=> **Average speed:** ``' + session.averageSpeed + ' km/ph`` 💨\n' +
		'=> **Maximum speed:** ``' + session.maxSpeed + ' km/ph`` 💨\n' +
		'=> **Duration:** ``' + session.duration + ' mins.`` ⏲️\n';
}

/**
 * Returns a formatted string that represents an individual page
 * with a list of sessions and instructions on what you can do with it.
 */
function printPageOfSessions(sessions, page) {
	const userPages = [];
	const pageCapacity = 2;
	let currentPage = {
		items: []
	};

	for (let i = 0, j = 0; i < sessions.length; i++, j++) {
		const element = sessions[i];

		if (j == pageCapacity) {
			userPages.push(currentPage);

			currentPage = {
				items: []
			};

			j = 0;
		}

		currentPage.items.push(element);
	}

	let output = 'Page **' + page + '** out of **' + (userPages.length + 1) + '**.\n\n';

	for (let i = 0; i < userPages[page - 1].items.length; i++) {
		const element = userPages[page - 1].items[i];

		output += `${i + 1}) \`\`` + element.title + '`` - ' + element.date + '\n';
	}

	output += '\n**=============== ℹ️ ===============**\n';
	output += 'a) ``$exit`` to stop browsing pages\n';
	output += 'b) ``$page [number here]`` to open that page';

	return output;
}