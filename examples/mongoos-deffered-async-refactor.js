// Example refactor somthing code

var _ = require('lodash'),
	async = require('async'),
	deferred = require('deferred'),
	Group = db.Group
	;

/************** BEFORE  *******************/

this.updateGroups = function(groupId, usersToAdd, retCallback) {

	if (_.isEmpty(usersToAdd)) {
		return retCallback();
	}

	Group.findOne({_id:groupId}, function(err, group) {

		if (err) {
			return retCallback(new ApiError('problem', '', err));
		}

		if (!group) {
			return retCallback(new ApiError('object_not_found'));
		}

		usersToAdd = _.filter(usersToAdd, function(userId) {
			return ! _.any(group.linksToUsers, {'userId':userId});
		});


		var def = deferred();

		Group.find({'linksToUsers.userId': { $in : usersToAdd }}, function(err, groups) {

			async.parallel(_.map(groups, function(group) {
				return function(callback) {

					_.remove(group.linksToUsers, function(link) {
						return _.contains(usersToAdd, link.userId);
					});

					group.markModified('linksToUsers');

					var groupId = group.id;

					removeOrUpdate(group, function(err, group) {

						if (err) {
							log.error(err);
						}

						// Notify bus
						if (group) {
							emitGroupUpdated(group.id, group);
						} else {
							emitGroupDeleted(groupId);
						}

						callback();
					});

				};
			}), function(err) {
				def.resolve();
			});

		});

		def.promise.then(function() {

			async.each(usersToAdd, function(userId, callback) {

				User.findOne({userId: userId}, function(err, user) {
					var isOk = !err && user && user.status !== 'offline',
						status = 'unknown';

					if (group.moderatorId) {
						status = 'starting';
					}

					if (!isOk) {
						status = 'failed';
					}

					group.linksToUsers.push({
						userId: userId,
						status: status
					});

					callback();

				});

			}, function(err) {

				group.markModified('linksToUsers');

				group.save(function(err, group) {

					if (err) {
						return retCallback(new ApiError('problem', '', err));
					}

					emitGroupUpdated(group.id, group);

					if (!group.moderatorId) {
						return retCallback();
					}

					getLinkProperties(group.moderatorId, function(err, props) {

						if (err) {

							async.each(usersToAdd, function(userId, callback) {
								Group.findOneAndUpdate({'linksToUsers.userId': userId},
									{ 'linksToUsers.$.status' : 'failed'}, function(err, group) {
										callback();
									});
							}, function(err) {
								Group.findOne({_id:groupId}, function(err, group) {
									emitGroupUpdated(group.id, group);
								});
							});

							log.error('Cant group users', err);
							return retCallback(new ApiError('problem', '', err));
						}

						_.each(usersToAdd, function(userId) {
							emitLink(userId, props);
						});

						retCallback();
					});

				});

			});

		});

	});

};

/**************** AFTER *******************/

this.updateGroups = function* update(groupId, usersToAdd) {

	if (_.isEmpty(usersToAdd)) return;

	try {

		var group = Group.findOne({_id:groupId}, update.cb);

		if (!group) throw new ApiError('object_not_found');

		usersToAdd = _.filter(usersToAdd, function(userId) {
			return ! _.any(group.linksToUsers, {'userId':userId});
		});

		var groups = yield Group.find({'linksToUsers.userId': { $in : usersToAdd }}, update.cb);

		function* rou(group) {
			_.remove(group.linksToUsers, function(link) {
				return _.contains(usersToAdd, link.userId);
			});

			group.markModified('linksToUsers');

			return yield removeOrUpdate(group, rou.cb);
		}

		var remOrUpdated = groups.map(function (group){
			return rou(group).future;
		});

		yield update.waitFutures();

		remOrUpdated.forEach(function(rou){

			if (rou.error) log.error(rou.error);

			var group = rou.result;

			if (group) {
				emitGroupUpdated(group.id, group);
			} else {
				emitGroupDeleted(group.id);
			}
		});

		function* setStatus(userId) {

			var user = User.findOne({userId: userId}, setStatus.cb),
				isOk = user && user.status !== 'offline',
				status = 'unknown';

			if (group.moderatorId) {
				status = 'starting';
			}

			if (!isOk) {
				status = 'failed';
			}

			group.linksToUsers.push({
				userId: userId,
				status: status
			});
		}

		usersToAdd.forEach(function(userId){
			return setStatus(userId).future;
		});

		yield update.waitFutures();

		group.markModified('linksToUsers');

		yield group.save(update.cb);

		emitGroupUpdated(group.id, group);

		if (!group.moderatorId) return;

		try {
			var props = yield getLinkProperties(group.moderatorId, update.cb);

			_.each(usersToAdd, function(userId) {
				emitLink(userId, props);
			});

		} catch (err) {

			function* failed(userId){
				return yield Group.findOneAndUpdate({'linksToUsers.userId': userId},
					{ 'linksToUsers.$.status' : 'failed'}, failed.cb);
			}

			usersToAdd.forEach(function(userId){
				return failed(userId).future;
			});

			update.waitFutures();

			yield Group.findOne({_id:groupId}, update.cb);

			emitGroupUpdated(group.id, group);

			log.error('Cant group users', err);

			throw err;
		}

	} catch (err) {
		if (err instanceof ApiError) throw err;
		throw new ApiError('problem', '', err);
	}
};
