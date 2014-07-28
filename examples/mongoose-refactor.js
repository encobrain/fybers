// Refactor from http://blog.ijasoneverett.com/2013/11/getting-started-with-mongoose-and-node-js-a-sample-comments-system/ using fybers

/************ CALLBACK STYLE ****************/

// ------------ index.js

var mongoose = require( 'mongoose' );
var Comment = mongoose.model( 'Comment' );

exports.index = function ( req, res ){
	Comment.find( function ( err, comments, count ){
		res.render( 'index', {
			title : 'Comment System with Mongoose and Node',
			comments : comments
		});
	});
};

exports.create = function ( req, res ){
	new Comment({
		username : req.body.username,
		content : req.body.comment,
		created : Date.now()
	}).save( function( err, comment, count ){
		res.redirect( '/' );
	});
};




/************ FYBER STYLE ****************/

// ------------ index.js

var Fyber = require('fybers'),
	mongoose = require( 'mongoose' ),
	Comment = mongoose.model( 'Comment' )
;

exports.index = function* comments ( req, res ){
	var comments = yield Comment.find(comments.cb);

	res.render( 'index', {
		title : 'Comment System with Mongoose and Node',
		comments : comments
	});

}.asyncFn();

exports.create = function* newComment ( req, res ){
	var comment = new Comment({
		username : req.body.username,
		content : req.body.comment,
		created : Date.now()
	});

	yield comment.save(newComment.cb);

	res.redirect( '/' );
}.asyncFn();

