// Refactor callback hell from callbackhell.com usin fybers

/************** CALLBACK STYLE ****************/

fs.readdir(source, function(err, files) {
	if (err) {
		console.log('Error finding files: ' + err);
	} else {
		files.forEach(function(filename, fileIndex) {
			console.log(filename);

			gm(source + filename).size(function(err, values) {
				if (err) {
					console.log('Error identifying file size: ' + err)
				} else {
					console.log(filename + ' : ' + values);

					var aspect = (values.width / values.height);

					widths.forEach(function(width, widthIndex) {

						var height = Math.round(width / aspect);

						console.log('resizing ' + filename + 'to ' + height + 'x' + height);

						this.resize(width, height).write(destination + 'w' + width + '_' + filename, function(err) {
							if (err) console.log('Error writing file: ' + err)
						});

					}.bind(this));
				}
			});
		});
	}
});

/***************** FYBER STYLE ******************/

var fs = require('fs');

(function* read(){

	try {

		var files = yield fs.readdir(source, read.cb);

		yield files.forEach(function* (filename, fileIndex) {
			console.log(filename);

			var values = yield gm(source + filename).size(read.cb);

			console.log(filename + ' : ' + values);

			var aspect = (values.width / values.height);

			yield widths.forEach(function* (width, widthIndex) {

				var height = Math.round(width / aspect);

				console.log('resizing ' + filename + 'to ' + height + 'x' + height);

				yield this.resize(width, height).write(destination + 'w' + width + '_' + filename, read.cb);

			}.asyncFn().bind(this));

		});

	} catch (err) {
		console.log('Error: ' + err);
	}

}).asyncFn()();