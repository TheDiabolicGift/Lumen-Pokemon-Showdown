/**
 * Miscellaneous commands
 */
 
	sb: 'showdownboilerplate',
	showdownboilerplate: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReply("|raw|This server uses <a href='https://github.com/CreaturePhil/Showdown-Boilerplate'>Showdown-Boilerplate</a>.");
	},
	showdownboilerplatehelp: ["/showdownboilerplate - Links to the Showdown-Boilerplate repository on Github."],

	seen: function (target, room, user) {
		if (!this.canBroadcast()) return;
		if (!target) return this.parse('/help seen');
		var targetUser = Users.get(target);
		if (targetUser && targetUser.connected) return this.sendReplyBox(targetUser.name + " is <b>currently online</b>.");
		target = Tools.escapeHTML(target);
		var seen = Seen[toId(target)];
		if (!seen) return this.sendReplyBox(target + " has never been online on this server.");
		this.sendReplyBox(target + " was last seen <b>" + moment(seen).fromNow() + "</b>.");
	},
	seenhelp: ["/seen - Shows when the user last connected on the server."],

	tell: function (target, room, user, connection) {
		if (!target) return this.parse('/help tell');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) {
			this.sendReply("You forgot the comma.");
			return this.parse('/help tell');
		}

		if (targetUser && targetUser.connected) {
			return this.parse('/pm ' + this.targetUsername + ', ' + target);
		}

		if (user.locked) return this.popupReply("You may not send offline messages when locked.");
		if (target.length > 255) return this.popupReply("Your message is too long to be sent as an offline message (>255 characters).");

		if (Config.tellrank === 'autoconfirmed' && !user.autoconfirmed) {
			return this.popupReply("You must be autoconfirmed to send an offline message.");
		} else if (!Config.tellrank || Config.groupsranking.indexOf(user.group) < Config.groupsranking.indexOf(Config.tellrank)) {
			return this.popupReply("You cannot send an offline message because offline messaging is " +
				(!Config.tellrank ? "disabled" : "only available to users of rank " + Config.tellrank + " and above") + ".");
		}

		var userid = toId(this.targetUsername);
		if (userid.length > 18) return this.popupReply("\"" + this.targetUsername + "\" is not a legal username.");

		var sendSuccess = Tells.addTell(user, userid, target);
		if (!sendSuccess) {
			if (sendSuccess === false) {
				return this.popupReply("User " + this.targetUsername + " has too many offline messages queued.");
			} else {
				return this.popupReply("You have too many outgoing offline messages queued. Please wait until some have been received or have expired.");
			}
		}
		return connection.send('|pm|' + user.getIdentity() + '|' +
			(targetUser ? targetUser.getIdentity() : ' ' + this.targetUsername) +
			"|/text This user is currently offline. Your message will be delivered when they are next online.");
	},
	tellhelp: ["/tell [username], [message] - Send a message to an offline user that will be received when they log in."]
};
