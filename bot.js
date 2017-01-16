/*
Fix the help text formatting.
Add a reply when doing .help.
Auto-delete last message if not say or roll.
.prune command for all messages except .say, can be done by storyteller.
*/

const Discord = require("discord.js");
const Schedule = require('node-schedule');
const bot = new Discord.Client();

var scheduleSet = false;


bot.on("ready", () => {
  console.log("Running on " + bot.guilds.array().length + " servers: " + bot.guilds.array());

  // Announce roleplay time change everyday at UTC 11PM
  if (scheduleSet === false) {
    scheduleSet = true;

    Schedule.scheduleJob('0 18 * * *', function() {
      // Get the number of days since the setting day: 24 Oct 2016 - Evening.
      let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
      let originalDate = new Date(2016,09,24,00,00,00);
      let todayDate = new Date();

      let diffDays = Math.floor(Math.abs((originalDate.getTime() - todayDate.getTime() - (todayDate.getTimezoneOffset()*60*1000))/(oneDay)));

      var message = null;
      if (diffDays%3 === 0) {
        message = "<@&235994453347663874> In one hour, World Time will switch to: Afternoon (11AM - 6PM)";

      } else if (diffDays%3 === 1) {
        message = "<@&235994453347663874> In one hour, World Time will switch to: Morning (3AM - 10AM).";

      } else if (diffDays%3 === 2) {
        message = "In one hour, World Time will switch to: Evening (7PM - 2AM)";
      }

      bot.guilds.array()[1].channels.find("name","bots").sendMessage(message);
    });

    // Announce roleplay time change everyday at UTC 11PM
    Schedule.scheduleJob('0 19 * * *', function() {
      // Get the number of days since the setting day: 24 Oct 2016 - Evening.
      let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
      let originalDate = new Date(2016,09,24,00,00,00);
      let todayDate = new Date();

      let diffDays = Math.floor(Math.abs((originalDate.getTime() - todayDate.getTime() - (todayDate.getTimezoneOffset()*60*1000))/(oneDay)));

      var message = null;
      if (diffDays%3 === 0) {
        message = "World Time has switched to: Evening (7PM - 2AM)";

      } else if (diffDays%3 === 1) {
        message = "World Time has switched to: Morning (3AM - 10AM).";

      } else if (diffDays%3 === 2) {
        message = "World Time has switched to: Afternoon (11AM - 6PM)";
      }

      bot.guilds.array()[1].channels.find("name","bots").sendMessage(message);
    });
  }
});

bot.on("message", msg => {
  // Check that it isn't a bot talking. Check for prefix.
  let prefix = ".";
  if(msg.author.bot && !msg.content.startsWith(prefix)) return;

  // Say <channel> <text>
  if (msg.content.startsWith(prefix + "say")) {
    // Make sure the user can use this command
    let permission = msg.member.roles.find("name", "Storyteller");

    if (permission) {// Check permission
      // Send to correct channel
      let channelToSend = msg.guild.channels.find("name", msg.content.split(" ").slice(1)[0]);
      if (channelToSend === null) {// Check if a channel name was passed
        msg.channel.sendMessage(msg.content.split(" ").slice(1).join(' '), {split: true});
        return;

      } else if (msg.content.split(" ").slice(2).join(' ')) {
        channelToSend.sendMessage(msg.content.split(" ").slice(2).join(' '), {split: true});

        // Only send it isn't the current channel
        if (channelToSend != msg.channel) {
          msg.channel.sendMessage("Sent message to channel: " + channelToSend);
        }
        return;

      } else {
        msg.channel.sendMessage("Please specify a message.");
        return;
      }
    } else {
      msg.channel.sendMessage("Sorry but this command requires the role: Storyteller");
      return;
    }
  }

  if (msg.content.startsWith(prefix + "rptimeleft")) {
    // Get the number of days since the setting day: 24 Oct 2016 - Evening.
    let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    let todayDate = new Date();

    let hoursLeft = 23 - todayDate.getUTCHours();
    let minutesLeft = 60 - todayDate.getUTCMinutes();

    msg.reply("RP Time left: " + hoursLeft + "h " + minutesLeft + "m");
    return;
  }

  // Roleplay time commands
  if (msg.content.startsWith(prefix + "rptime")) {
    // Get the number of days since the setting day: 24 Oct 2016 - Evening.
    let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    let originalDate = new Date(2016,09,24,00,00,00);
    let todayDate = new Date();

    let diffDays = Math.floor(Math.abs((originalDate.getTime() - todayDate.getTime() - (todayDate.getTimezoneOffset()*60*1000))/(oneDay)));

    if (diffDays%3 === 0) {
      msg.reply("World Time: Evening (7PM - 2AM)");
    } else if (diffDays%3 === 1) {
      msg.reply("World Time: Morning (3AM - 10AM).");
    } else if (diffDays%3 === 2) {
      msg.reply("World Time: Afternoon (11AM - 6PM)");
    }
    return;
  }

  // Roll
  let rollArguments = msg.content.split(" ").slice(1);
  if (msg.content.startsWith(prefix + "roll") && rollArguments) {
    roll(rollArguments, msg);
    return;

  } else if (rollArguments === null) {
    msg.reply("Please pass a valid roll: <#OfDice>d<#MaxNum>");
    return;
  }

  // Ping
  if (msg.content.startsWith(prefix + "ping")) {
    msg.reply("Pong.");
    return;
  }

  // Help
  if (msg.content.startsWith(prefix + "help")) {
    msg.author.sendMessage("**Ping:** Pong \n**say <channel> <text>:** will repeat the text. \n **Roll <dice'd'range>:** rolls a dice \n **rptime:** Shows the current roleplay time bracket, changes once per 24 hours. \n **rptimeleft:** shows the hours and minutes left until the next rp time bracket.", {split: true});
    return;
  }
});

// Log in
bot.login("APIKEYHERE");

// Command functions
function roll(rollArguments, msg) {
  // Store the response to send later in one message.
  var rollMessageArray = new Array();
  var invalidRollMessageArray =  new Array();

  // For each argument passed roll
  for (i = 0; i < rollArguments.length; i++) {
    if (rollArguments[i].toLowerCase().indexOf("d") !== -1) {
      let diceNumber = rollArguments[i].toLowerCase().split("d")[0];
      let maxFace = rollArguments[i].toLowerCase().split("d")[1];

      // Make sure numbers are passed for each argument.o
      if (diceNumber%1 !== 0 || maxFace%1 !== 0 || !diceNumber || !maxFace || diceNumber > 500 || diceNumber < 1 || maxFace < 1) {
        invalidRollMessageArray.push(rollArguments[i]);

      } else {
        // For each dice in that argument roll, reply with one message.
        var rolledArray = new Array();
        for (a = 0; a < diceNumber; a++) {
          let rolled =  getRandomInt(1,maxFace);
          rolledArray.push(rolled);
        }

        rollMessageArray.push(rolledArray.join(", "));
      }
    }
  }

  // Send the roll results
  if (rollMessageArray.length > 0) {
    msg.reply("Rolled: " + rollMessageArray.join("; "), {split: true});
  }

  // Send the invalid roll results
  if (invalidRollMessageArray.length > 0) {
    msg.channel.sendMessage("Invalid roll: " + invalidRollMessageArray.join("; "), {split: true});
  }
}

// Helper funcs.
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
