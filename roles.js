const gameSettingsFile = require("./gameSettings.json");
var settings;

class Seer{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = !settings.roleDetails.detective.nightZero;
        this.blocked = false;
    }

    startDay()
    {
        this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        const thisFilter = (reaction, user) => {
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to peek?\n";
        playerList.forEach(player => {
            message += player.displayName + " == " + player.emoji + "\n";
        });
        this.user.send(message).then((message) =>{
            playerList.forEach(async (player) => {
                await message.react(player.emoji);
            });
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                playerList.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        this.chosenPlayer = player;
                        found = true;
                    }
                });
                if(!found)
                    console.log("Player not found with emoji " + collected.first().emoji.name);
                this.user.send("Player " + this.chosenPlayer.displayName + " will be peeked at the end of the night.");
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            this.user.send("Player " + this.chosenPlayer.displayName + "'s alignment is " + this.chosenPlayer.peeksAs);
        }
        return {action:"none", player:null};
    }

}

class Roleseer{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = !settings.roleDetails.roleseer.nightZero;
        this.blocked = false;
    }

    startDay()
    {
        this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        const thisFilter = (reaction, user) => {
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to peek?\n";
        playerList.forEach(player => {
            message += player.displayName + " == " + player.emoji + "\n";
        });
        this.user.send(message).then((message) =>{
            playerList.forEach(async (player) => {
                await message.react(player.emoji);
            });
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                playerList.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        this.chosenPlayer = player;
                        found = true;
                    }
                });
                if(!found)
                    console.log("Player not found with emoji " + collected.first().emoji.name);
                this.user.send("Player " + this.chosenPlayer.displayName + " will be peeked at the end of the night.");
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            this.user.send("Player " + this.chosenPlayer.displayName + "'s power is " + this.chosenPlayer.role);
        }
        return {action:"none", player:null};
    }

}

class Roleblocker{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = !settings.roleDetails.roleblocker.nightZero;
        this.blocked = false;
        this.last = null;
    }

    startDay()
    {
        this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        const thisFilter = (reaction, user) => {
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to block?\n";
        playerList.forEach(player => {
            if(this.last != player)
                message += player.displayName + " == " + player.emoji + "\n";
        });
        this.user.send(message).then((message) =>{
            playerList.forEach(async (player) => {
                if(this.last != player)
                    await message.react(player.emoji);
            });
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                playerList.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        this.chosenPlayer = player;
                        found = true;
                    }
                });
                if(!found)
                    console.log("Player not found with emoji " + collected.first().emoji.name);
                this.user.send("Player " + this.chosenPlayer.displayName + " will be blocked.");
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        else
        {
            this.chosenPlayer.roleObject.roleClass.blocked = true;
        }
        return {action:"none", player:null};
    }

}

class Fool{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = !settings.roleDetails.detective.nightZero;
        this.blocked = false;
    }

    startDay()
    {
        this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        const thisFilter = (reaction, user) => {
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to peek?\n";
        playerList.forEach(player => {
            message += player.displayName + " == " + player.emoji + "\n";
        });
        this.user.send(message).then((message) =>{
            playerList.forEach(async (player) => {
                await message.react(player.emoji);
            });
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                playerList.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        this.chosenPlayer = player;
                        found = true;
                    }
                });
                if(!found)
                    console.log("Player not found with emoji " + collected.first().emoji.name);
                this.user.send("Player " + this.chosenPlayer.displayName + " will be peeked at the end of the night.");
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            var size = 0;
            var count = 0;
            settings.roles.forEach(role =>
            {
                size++;
                if(role.wolf == true)
                    count++;
            });
            if(Math.floor(Math.random() * (size)<count))
            {
                this.user.send("Player " + this.chosenPlayer.displayName + "'s alignment is werewolf");
            }
            else
            {
                this.user.send("Player " + this.chosenPlayer.displayName + "'s alignment is villager");
            }
        }
        return {action:"none", player:null};
    }
}

class Cultist{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = !settings.roleDetails.cultist.nightZero;
        this.blocked = false;
    }

    startDay()
    {
        this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        const thisFilter = (reaction, user) => {
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to convert?\n";
        playerList.forEach(player => {
            if(!player.cultist && (player != this.user))
                message += player.displayName + " == " + player.emoji + "\n";
        });
        this.user.send(message).then((message) =>{
            playerList.forEach(async (player) => {
                if(!player.cultist && (player != this.user))
                    await message.react(player.emoji);
            });
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                playerList.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        this.chosenPlayer = player;
                        found = true;
                    }
                });
                if(!found)
                    console.log("Player not found with emoji " + collected.first().emoji.name);
                this.user.send("Player " + this.chosenPlayer.displayName + " will be converted at the end of the night.");
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            this.chosenPlayer.cultist = true;
            this.user.send(this.chosenPlayer.displayName + " is now a member of your cult, their power is " + this.chosenPlayer.role + "and their alignment is " + this.chosenPlayer.peeksAs);
        }
        return {action:"none", player:null};
    }
}

class Doctor{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = true;
        this.blocked = false;
        this.last = null;
    }

    startDay()
    {
        this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        const thisFilter = (reaction, user) => {
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to protect?\n";
        playerList.forEach(player => {
            if(player != this.last)
                message += player.displayName + " == " + player.emoji + "\n";
        });
        this.user.send(message).then((message) =>{
            playerList.forEach(async (player) => {
                if(player != this.last)
                    await message.react(player.emoji);
            });
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                playerList.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        this.chosenPlayer = player;
                        found = true;
                    }
                });
                if(!found)
                    console.log("Player not found with emoji " + collected.first().emoji.name);
                this.user.send("Player " + this.chosenPlayer.displayName + " will be protected for this night.");
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.last = null;
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            this.last = this.chosenPlayer;
            return {action:"protect", player:this.chosenPlayer};
        }
    }

}

class Vigilante{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = true;
        this.blocked = false;
        this.ammo = settings.roleDetails.vigilante.ammoCount;
    }

    startDay()
    {
        if(this.ammo > 0)
            this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        if(this.ammo <= 0)
            return true;
        const thisFilter = (reaction, user) => {
            if(reaction.emoji.name == '❌')
                return true;
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to shoot?(You have "+this.ammo+" bullets left)\n";
        playerList.forEach(player => {
            message += player.displayName + " == " + player.emoji + "\n";
        });
        message += "Abstain == ❌";
        this.user.send(message).then(async (message) =>{
            playerList.forEach(async (player) => {
                await message.react(player.emoji);
            });
            await message.react('❌');
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                if(collected.first().emoji.name == '❌')
                {
                    this.user.send("Nobody will be shot tonight");
                }
                else
                {
                    playerList.forEach(player => {
                        if(player.emoji == collected.first().emoji.name)
                        {
                            this.chosenPlayer = player;
                            found = true;
                        }
                    });
                    if(!found)
                        console.log("Player not found with emoji " + collected.first().emoji.name);
                    this.user.send("Player " + this.chosenPlayer.displayName + " will be killed.");
                }
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            this.ammo--;
            return {action:"kill", player:this.chosenPlayer};
        }
    }

}

class PastryChef{
    constructor(user)
    {
        this.user = user;
        this.chosenPlayer = null;
        this.hasChosen = true;
        this.blocked = false;
        this.ammo = settings.roleDetails.pastrychef.ammoCount;
        this.seer = null;
    }

    startDay()
    {
        if(this.ammo > 0)
            this.hasChosen = false;
        this.blocked = false;
        return true;
    }
    nightAction(playerList)
    {
        if(this.ammo <= 0)
            return true;
        /*var validPlayers = [];
        playerList.forEach(player => {
            if(player.id != this.user.id)
                validPlayers.push(player);
        });
        var message = "Who do you wish to feed? (You have "+this.ammo+" pastries left)\n";
        choosePlayer(this.user, validPlayers, message, true).then(chosen => {
            this.hasChosen = true;
            this.chosenPlayer = chosen;
            if(!chosen)
            {
                this.user.send("Nobody will be fed tonight");
            }
            else
            {
                this.user.send("Player " + this.chosenPlayer.displayName + " will be fed.");
            }
        });*/
        const thisFilter = (reaction, user) => {
            if(reaction.emoji.name == '❌')
                return true;
            var emojiPlayerAlive = false;
            var userIsAlive = false;
            playerList.forEach(player => {
                if(user.id == player.id)
                    userIsAlive = true;
                if(reaction.emoji.name == player.emoji)
                    emojiPlayerAlive = true;
            });
            return userIsAlive && emojiPlayerAlive;
        }
        var message = "Who do you wish to feed? (You have "+this.ammo+" pastries left)\n";
        playerList.forEach(player => {
            if(player != this.user)
                message += player.displayName + " == " + player.emoji + "\n";
        });
        message += "Abstain == ❌";
        this.user.send(message).then(async (message) =>{
            playerList.forEach(async (player) => {
                if(player != this.user)
                    await message.react(player.emoji);
            });
            await message.react('❌');
            message.awaitReactions(thisFilter, {max: 1}).then(collected => {
                var found = false;
                if(collected.first().emoji.name == '❌')
                {
                    this.user.send("Nobody will be fed tonight");
                    this.hasChosen = true;
                }
                else
                {
                    playerList.forEach(player => {
                        if(player.emoji == collected.first().emoji.name)
                        {
                            this.chosenPlayer = player;
                            found = true;
                        }
                    });
                    if(!found)
                        console.log("Player not found with emoji " + collected.first().emoji.name);
                    this.user.send("Player " + this.chosenPlayer.displayName + " will be fed.");
                }
                this.hasChosen = true;
            });
        });
    }
    readyForDay()
    {
        return this.hasChosen;
    }
    resolveNight()
    {
        if(!this.chosenPlayer)
            return {action:"none", player:null};
        if(!this.seer)
            return {action:"none", player:null};
        if(this.blocked)
        {
            this.user.send("Your power has been blocked for this night.");
        }
        else
        {
            this.ammo--;
            this.chosenPlayer.send("You have received the magic pastry! The detective is " + this.seer.displayName);
            return {action:"none", player:null};
        }
    }

}

class Default{
    constructor(user)
    {
        this.user = user;
        this.blocked = false;
    }
    DefaultStartDay()
    {
        return true;
    }
}

async function choosePlayer(thisPlayer, validPlayers, message, abstain)
{
    var toSend = message;
    const thisFilter = (reaction, user) => {
        if(abstain && reaction.emoji.name == '❌')
            return true;
        var emojiPlayerAlive = false;
        var userIsAlive = false;
        validPlayers.forEach(player => {
            if(user.id == player.id)
                userIsAlive = true;
            if(reaction.emoji.name == player.emoji)
                emojiPlayerAlive = true;
        });
        return userIsAlive && emojiPlayerAlive;
    }
    validPlayers.forEach(player => {
        message += player.displayName + " == " + player.emoji + "\n";
    });
    message += "Abstain == ❌";
    thisPlayer.send(message).then(async (message) =>{
        validPlayers.forEach(async (player) => {
            await message.react(player.emoji);
        });
        if(abstain)
            await message.react('❌');
        message.awaitReactions(thisFilter, {max: 1}).then(collected => {
            if(collected.first().emoji.name == '❌')
            {
                return null;
            }
            else
            {
                validPlayers.forEach(player => {
                    if(player.emoji == collected.first().emoji.name)
                    {
                        return player;
                    }
                });
                console.log("Player not found with emoji " + collected.first().emoji.name);
                return null;
            }
        });
    });
}

function filterAbstain(reaction, user, validPlayers) 
{
    if(reaction.emoji.name == '❌')
        return true;
    var emojiPlayerAlive = false;
    var userIsAlive = false;
    validPlayers.forEach(player => {
        if(user.id == player.id)
            userIsAlive = true;
        if(reaction.emoji.name == player.emoji)
            emojiPlayerAlive = true;
    });
    return userIsAlive && emojiPlayerAlive;
}

function filterNoAbstain(reaction, user, validPlayers) 
{
    var emojiPlayerAlive = false;
    var userIsAlive = false;
    validPlayers.forEach(player => {
        if(user.id == player.id)
            userIsAlive = true;
        if(reaction.emoji.name == player.emoji)
            emojiPlayerAlive = true;
    });
    return userIsAlive && emojiPlayerAlive;
}

module.exports = {
Role: class{
    constructor(user, role)
    {
        this.role = role;
        this.user = user;
        this.blocked = false;
        switch(this.role)
        {
            case "Seer":
                this.roleClass = new Seer(user);
                break;
            case "Vigilante":
                this.roleClass = new Vigilante(user);
                break;
            case "Doctor":
                this.roleClass = new Doctor(user);
                break;
            case "Cultist":
                this.roleClass = new Cultist(user);
                break;
            case "Fool":
                this.roleClass = new Fool(user);
                break;
            case "Chef":
                this.roleClass = new PastryChef(user);
                break;
            case "Roleseer":
                this.roleClass = new Roleseer(user);
                break;
            case "Roleblocker":
                this.roleClass = new Roleblocker(user);
                break;
            default:
                this.roleClass = new Default(user);
        }
    }

    startDay()
    {
        if(this.roleClass.nightAction)
            return this.roleClass.startDay();
        else
        {
            return true;
        }
    }
    nightAction(playerList)
    {
        if(this.roleClass.nightAction)
            return this.roleClass.nightAction(playerList);
        else
        {
            return true;
        }
    }
    readyForDay()
    {
        if(this.roleClass.readyForDay)
            return this.roleClass.readyForDay();
        else
            return true;
    }
    resolveNight()
    {
        if(this.roleClass.resolveNight)
            return this.roleClass.resolveNight();
        else
            return {action:"none", player:null};
    }
},

init: function()
{
    var stringified = JSON.stringify(gameSettingsFile);
    settings = JSON.parse(stringified);
},





beans: function()
{
    console.log("beans");
}

}