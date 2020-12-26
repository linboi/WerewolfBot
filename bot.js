const { deepStrictEqual } = require("assert");
const { timeStamp } = require("console");
const Discord = require("discord.js");
const { waitForDebugger } = require("inspector");
const config = require("./config.json");
const gameSettingsFile = require("./gameSettings.json");
const Roles = require("./roles.js");

const bot = new Discord.Client();
const prefix = "!";

bot.login(config.TEST_BOT_TOKEN);

var alivePlayers = [];
var deadPlayers = [];
var thisServer;
var settings;
var activeWolfVote;
var activeLynchVote;
var gameRunning = false;
var villageChannel = null;
var wolfChannel = null;
var deadChannel = null;
var wolfCount = 0;
var wolfKill = [];

var narratorText = "";

var DUMMY_MESSAGE = null;

bot.on("ready", () => {
	console.log("hello?");
	var stringified = JSON.stringify(gameSettingsFile);
	settings = JSON.parse(stringified);
	Roles.init();
	console.log("The beans are prepared");
	Roles.beans();

});

function attemptToEndNight() // This should be done with emitting an event instead
{
	var allReady = true;
	alivePlayers.forEach(player => {
		if(!player.roleObject.readyForDay())
		{
			console.log(player)
			allReady = false;
		}
	});
	if(allReady)
	{
		resolveNight()
	}
	else
	{
		setTimeout(attemptToEndNight, 200);
		return;
	}
}

bot.on("message", message => {
	if (message.author.bot) return;
	//console.log(message.author);
	//message.guild.members.fetch(message.author.id).then(guildmember => console.log(guildmember));
	//console.log(message.guild.voiceStates);
	Roles.init();
	//if (message.author.id == ) return;
	if (!message.content.startsWith(prefix)) return;

	var args = message.content.substring(1).split(' ');
	var cmd = args[0].toLowerCase();
    args = args.splice(1);

	if (cmd == 'start') {
		if(gameRunning)
		{
			console.log("game is already in progress");
			return;
		}
		bot.channels.fetch(settings.wolfChannel).then(channel => wolfChannel = channel).then(() =>{
			bot.channels.fetch(settings.deadChannel).then(channel => deadChannel = channel).then(() =>{
				thisServer = message.guild;
				villageChannel = message.channel;
				activeLynchVote = activeWolfVote = DUMMY_MESSAGE = message;
				if(!message.mentions.members.size)
				{
					message.guild.members.fetch(message.author.id).then(guildmember => {
						startGame(guildmember.voice.channel.members);
					});
				}
				else
				{
					startGame(message.mentions.members);
				}
			});
		});
		//bot.channels.fetch(settings.wolfChannel).then(channel => wolfChannel = channel);
		
	}
	else if(cmd == 'narrator')
	{
		console.log("NARRATOR GOT THA TEXT");
		message.author.send(narratorText);
	}
	else if(cmd == 'child')
	{
		if(message.author.role == "child")
		{
			message.channel.send(message.author.displayName + " is aligned with the village.");
		}
	}
	else if(cmd == 'timer')
	{
		var time = parseInt(args[0]);
		var reminder = parseInt(args[1]);
		setTimeout(timeLeft, (1000*(time-reminder)), message.channel, reminder);
	}
	else if(cmd == 'roles')
	{
		var msg = "```";
		settings.roles.forEach(role =>{
			msg = msg + "Power: " + (role.role + ",").padEnd(15) + ((role.wolf)?("Wolf"):("")) + "\n";
		});
		msg = msg + "```";
		message.channel.send(msg);
	}
	else if(cmd == 'call')
	{
		test();
	}
	
});

function test()
{
	console.log("running");
	var count = 0;
	for(var i = 0; i < 10000000; i++)
	{
		var max = 0;
		var y = 0;
		for(var j = 0; j < 100; j++)
		{
			if(Math.random() >= 0.5)
			{
				y++;
				if(max <= y)
				{
					max = y;
				}
			}
			else
			{
				y = 0;
			}
		}
		if(max >= 20)
		{
			count++;
		}
	}
	console.log(count);
}

function timeLeft(channel, reminder)
{
	channel.send(reminder + " seconds left");
	setTimeout(timeGone, (reminder*1000), channel);
}

function timeGone(channel)
{
	channel.send("time is up");
}

bot.on('messageReactionAdd', (MessageReaction, user) =>{
	if(!gameRunning || user.bot || MessageReaction.message.id == DUMMY_MESSAGE.id)
		return;
	if(!(MessageReaction.message.id == activeWolfVote.id 
		|| MessageReaction.message.id == activeLynchVote.id))
		return;
	
	var isAlivePlayer = false;
	alivePlayers.forEach(player => ((user.id == player.id)?(isAlivePlayer = true):(null)));
	if(!isAlivePlayer)
	{
		MessageReaction.users.remove(user);
		return;
	}
	MessageReaction.message.reactions.cache.each(reaction =>
		{
			if((reaction != MessageReaction) 
				&& reaction.users.fetch().then(userList => userList.has(user)))
			{
				reaction.users.remove(user);
			}
		});

	switch(MessageReaction.message.id)
	{
		case activeLynchVote.id:
			resolveLynchVote(MessageReaction);
			break;
		case activeWolfVote.id:
			resolveWolfVote(MessageReaction);
			break;
	}

});

function startGame(players)
{
	var roles = settings.roles;
	if(roles.length != players.size)
	{
		console.log("role count and player count mismatch");
		return;
	}
	gameRunning = true;
	confirmEjects = settings.confirmEjects;
	shuffle(roles);
	

	const emojis = [ '0️⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '😄', '🍎', '🍊', '🍇'];
	var indexOfRoles = 0;
	var minion = null;
	var chef = null;
	var wolves = [];
	var seer = null;

	players.each((user) => {
		var temp = user;
		temp.role = roles[indexOfRoles].role;
		//temp.emoji = (thisServer.emojis.cache.get('776870904784879627')).name;
		temp.emoji = emojis[indexOfRoles];
		temp.isWolf = roles[indexOfRoles].wolf;
		narratorText += temp.displayName + " is " + temp.role + "\n";
		alivePlayers.push(temp);
		wolfChannel.createOverwrite(user,
			{
				'VIEW_CHANNEL': false,
				'SEND_MESSAGES': false
			}
		)
		deadChannel.createOverwrite(user,
			{
				'VIEW_CHANNEL': false,
				'SEND_MESSAGES': false
			}
		)
		switch(roles[indexOfRoles].role)
		{
			case "detective":
				seer = temp;
				temp.roleObject = new Roles.Role(temp, "Seer");
				break;
			case "doctor":
				temp.roleObject = new Roles.Role(temp, "Doctor");
				break;
			case "villager":
				temp.roleObject = new Roles.Role(temp, "none");
				break;
			case "vigilante":
				temp.roleObject = new Roles.Role(temp, "Vigilante");
				break;
			case "fool":
				temp.roleObject = new Roles.Role(temp, "Fool");
				break;
			case "cultist":
				temp.roleObject = new Roles.Role(temp, "Cultist");
				break;
			case "child":
				temp.roleObject = new Roles.Role(temp, "none");
				break;
			case "minion":
				minion = temp;
				temp.roleObject = new Roles.Role(temp, "none");
				break;
			case "pastry chef":
				chef = temp;
				temp.roleObject = new Roles.Role(temp, "Chef");
				break;
			case "role seer":
				temp.roleObject = new Roles.Role(temp, "Roleseer");
				break;
			case "role blocker":
				temp.roleObject = new Roles.Role(temp, "Roleblocker");
				break;
			case "alphawolf":
				temp.roleObject = new Roles.Role(temp, "none");
				break;
			case "none":
				temp.roleObject = new Roles.Role(temp, "none");
				break;
			default:
				villageChannel.send("No role found for " + roles[indexOfRoles].role);
				break;
		}
		if(roles[indexOfRoles].role == "alphawolf")
		{
			wolves.push(temp.displayName);
			wolfChannel.createOverwrite(user,
				{
					'VIEW_CHANNEL': true,
					'SEND_MESSAGES': true
				}
			)
			temp.peeksAs = "villager";
			wolfCount++;
			temp.team = "wolves";
		}
		else if(roles[indexOfRoles].wolf)
		{
			wolves.push(temp.displayName);
			wolfChannel.createOverwrite(user,
				{
					'VIEW_CHANNEL': true,
					'SEND_MESSAGES': true
				}
			)
			temp.peeksAs = "werewolf";
			wolfCount++;
			temp.team = "wolves"
		}
		else if(roles[indexOfRoles].role == "minion")
		{
			temp.peeksAs = "villager";
			temp.team = "wolves";
		}
		else
		{
			temp.peeksAs = "villager";
			if(temp.role == "jester" || temp.role == "cultist")
				temp.team = "alone";
			else
				temp.team = "village";
		}
		if(temp.role != "fool")
			temp.send("Your power is: " + temp.role + " and your team is: " + temp.team);
		else
			temp.send("Your power is: detective and your team is: village");
		indexOfRoles++;
	});
	if(minion)
	{
		minion.send("Your wolf buddies are " + wolves);
	}
	if(chef)
	{
		chef.roleObject.roleClass.seer = seer;
	}
	alivePlayers.forEach(player =>
		{
			if(!player.roleObject.readyForDay())
				player.roleObject.nightAction(alivePlayers);
		});
	attemptToEndNight();
}

async function startDay()
{
	var theCultist = null;
	var cultistWin = true;
	var cultistAlive = false;
	alivePlayers.forEach(player => 
	{
		player.roleObject.startDay();
		if(player.role == "cultist")
		{
			cultistAlive = true;
			theCultist = player;
		}
		else if(!player.cultist)
			cultistWin = false;
	});
	if(cultistWin && cultistAlive)
	{
		villageChannel.send("The cultist, " + theCultist.displayName + ", has won, they leave victorious. The game will continue.");
		deadChannel.createOverwrite(theCultist,
			{
				'VIEW_CHANNEL': true,
				'SEND_MESSAGES': true
			}
		)
		var cultistIndex;
		alivePlayers.forEach((player, index) => 
		{
			if(player == theCultist)
				cultistIndex = index
		});
		deadPlayers.push(alivePlayers.splice(cultistIndex, 1));
		checkForWin();
	}
	var lynchVote = "Vote on who to lynch, you have "+settings.votingTime+" minutes \n";
	alivePlayers.forEach(player => {
		lynchVote+= player.displayName + " == " + player.emoji + "\n";
	});
	lynchVote += "Abstain == ❌";
	activeLynchVote = await villageChannel.send(lynchVote);
	alivePlayers.forEach(async (player) => {
		await activeLynchVote.react(player.emoji);
	});
	await activeLynchVote.react('❌');

	setTimeout(voteReminder, ((settings.votingTime-settings.reminderTime)*60*1000), activeLynchVote);

}

function voteReminder(thisVote)
{
	if(activeLynchVote.id == thisVote.id)
	{
		villageChannel.send(settings.reminderTime + " minutes left to vote");
		setTimeout(resolveLynchVoteAfterTimeout, settings.reminderTime*60*1000, thisVote);
	}
}

function resolveLynchVote(reaction)
{
	if(activeLynchVote.id != DUMMY_MESSAGE.id)
	{
		const votesToSucceed = Math.floor(alivePlayers.length/2) + 1;
		if(reaction.count > votesToSucceed)
		{
			activeLynchVote = DUMMY_MESSAGE;
			endDay(reaction)
		}
	}
}

function resolveLynchVoteAfterTimeout(thisVote)
{
	if(activeLynchVote.id == thisVote.id)
	{
		villageChannel.send("Time to vote has run out");
		var reaction = null;
		var max = -1;
		var draw = true;
		activeLynchVote.reactions.cache.each(thisReaction =>{
				console.log(thisReaction);
				if(thisReaction.count > max)
				{
					reaction = thisReaction;
					max = thisReaction.count;
					draw = false;
				}
				else if(thisReaction.count == max)
				{
					draw = true;
				}
			});
		activeLynchVote = DUMMY_MESSAGE;
		if(draw)
			reaction.emoji.name = '❌';
		endDay(reaction);
	}
}

function endDay(reaction){
	var toBeLynched = null;
	if(reaction.emoji.name == '❌')
	{
		villageChannel.send("Vote successful, nobody will be lynched, the night now begins");

	}
	else
	{
		alivePlayers.forEach((player, index) => {
			if(player.emoji == reaction.emoji.name)
			{
				toBeLynched = player;
				removeRoles(player);
				deadChannel.createOverwrite(player,
					{
						'VIEW_CHANNEL': true,
						'SEND_MESSAGES': true
					}
				)
				deadPlayers.push(alivePlayers.splice(index, 1));
			}
		});
		if(!toBeLynched)
			console.log("HUGE ERROR");
		else
		{
			villageChannel.send("Vote successful, " + toBeLynched.displayName + " will be lynched, the night now begins");
			if(settings.confirmEjects)
				villageChannel.send("Their alignment was: " + ((toBeLynched.team == "wolves")?("werewolf"):("villager")));
			if(toBeLynched.role == "jester")
			{
				villageChannel.send(toBeLynched.displayName + " was the jester and has won, the game will continue");
			}
			
		}
	}
	checkForWin();
	startNight();
}

async function startNight()
{
	alivePlayers.forEach(player => {
		player.roleObject.nightAction(alivePlayers);
	});
	var murderVote = "Vote on who to murder \n";
	alivePlayers.forEach(player => {
		if(player.role != "werewolf")
			murderVote+= player.displayName + " == " + player.emoji + "\n";
	});
	activeWolfVote = await wolfChannel.send(murderVote);
	alivePlayers.forEach(async (player) => {
		if(player.role != "werewolf")
			await activeWolfVote.react(player.emoji);
	});
}

function resolveWolfVote(reaction)
{
	const votesToSucceed = Math.floor(wolfCount/2) + 1;
	if(reaction.count > votesToSucceed)
	{
		var toBeMurdered = null;
		alivePlayers.forEach((player, index) => {
			if(player.emoji == reaction.emoji.name)
			{
				toBeMurdered = player;
			}
		});
		if(!toBeMurdered)
			console.log("HUGE ERROR");
		else
		{
			wolfChannel.send("Vote successful, " + toBeMurdered.displayName + " will be eaten");
			wolfKill = [toBeMurdered];
			alivePlayers.forEach(player => 
				{
					if(player.roleObject)
					{
						player.roleObject.voteComplete = true;
					}
				});
			attemptToEndNight();
		}
	}
}

function resolveNight()
{
	var actionsToPlayers = [];
	alivePlayers.forEach(player => actionsToPlayers.push(player.roleObject.resolveNight()));
	var deadList = wolfKill;
	actionsToPlayers.forEach(actionObject =>{
		if(actionObject.action == "kill")
			deadList.push(actionObject.player)
	});
	actionsToPlayers.forEach(actionObject =>{
		if(actionObject.action == "protect")
			deadList = deadList.filter(player => player.id != actionObject.player.id);
	});
	var resolutionMessage = "During the night \n";
	
	alivePlayers.forEach((player, index) => {
		if(deadList.includes(player))
		{
			resolutionMessage += player.displayName;// + (settings.confirmEjects)?(", " + player.role + "\n"):("\n");
			if(settings.confirmEjects)
				resolutionMessage += ", " + player.peeksAs;
			resolutionMessage += "\n";
			removeRoles(player);
			deadChannel.createOverwrite(player,
				{
					'VIEW_CHANNEL': true,
					'SEND_MESSAGES': true
				}
			)
			deadPlayers.push(alivePlayers.splice(index, 1));
		}
	});
	if(deadList.length > 1)
		resolutionMessage += "have died.";
	else if(deadList.length == 1)
		resolutionMessage += "has died.";
	else
		resolutionMessage += "nobody has died.";

	villageChannel.send(resolutionMessage);
	checkForWin();
	startDay();
}

function checkForWin()
{
	if(wolfCount == 0)
	{
		villageChannel.send("Game over, village wins");
		gameRunning = false;
		alivePlayers = [];
		deadPlayers = [];
	}
	else if(wolfCount >= alivePlayers.length/2)
	{
		villageChannel.send("With " + wolfCount + " remaining wolves of " + alivePlayers.length + " players, the wolves win.");
		gameRunning = false;
		wolfCount = 0;
		//alivePlayers.forEach(player => removeRoles(player));
		alivePlayers = [];
		deadPlayers = [];
	}
}

function removeRoles(player)
{
	if(player.isWolf)
	{
		wolfCount--;
		
	}
	switch(player.role)
	{
		case "detective":
			detective = null;
			break;
		case "werewolf":
			wolfCount--;
			if(wolfCount == 0)
			{
				villageChannel.send("Game over, village wins");
				gameRunning = false;
			}
			break;
		case "doctor":
			doctor = null;
			break;
		case "vigilante":
			vigilanteAmmo = 0;
			break;
	}
}

function shuffle(list)
{
	for(var i = list.length - 1; i > 0; i--)
	{
		var randInt = Math.floor(Math.random() * (i + 1));
		var temp = list[i];
		list[i] = list[randInt];
		list[randInt] = temp;
	}
}

//var emojiList = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣'❌];*/