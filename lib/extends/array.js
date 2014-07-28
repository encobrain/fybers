(function(){

	function each(obj, cb){
		for (var prop in obj) if (obj.hasOwnProperty(prop)) cb(obj[prop], prop, obj);
	}

	function* GeneratorFn(){ yield 1 }

	var
		global = (function(){ return this})(),
		_Ap_ = Array.prototype,
		arrayFyberMethods = {

			every: function* (iteratorFn, thisObj) {
				var len = this.length;

				for ( var i in this ) {
					if (/[^\d-]/.test(i) || i >= len) break;
					if (i >= 0 && !(yield iteratorFn.call(thisObj, this[i], i, this))) return false;
				}

				return true;
			},

			filter: function* (iteratorFn, thisObj) {
				var len = this.length, ret = [];

				for ( var i in this ) {
					if (/[^\d-]/.test(i) || i >= len) break;
					if ( i >= 0 && !!(yield iteratorFn.call(thisObj, this[i], i, this)) ) ret[ret.length] = this[i];
				}

				return ret;
			},

			forEach: function* (iteratorFn, thisObj) {
				var len = this.length;

				for ( var i in this ) {
					if (/[^\d-]/.test(i) || i >= len) return;
					if (i >= 0) yield iteratorFn.call(thisObj, this[i], i, this);
				}
			},

			map: function* (iteratorFn, thisObj) {
				var len = this.length, ret = new Array(len);

				for ( var i in this ) {
					if (/[^\d-]/.test(i) || i >= len) break;
					if (i >= 0) ret[i] = yield iteratorFn.call(thisObj, this[i], i, this);
				}

				return ret;
			},

			reduce: function* (iteratorFn, prev, argsLen) {
				var len = this.length;

				for ( var i in this ) {
					if (/[^\d-]/.test(i) || i >= len) break;
					if (argsLen < 2) {
						prev = this[i];
						argsLen = 2;
						continue;
					}
					prev = yield iteratorFn.call(global, prev, this[i], i, this);
				}

				return prev;
			},

			reduceRight: function* (iteratorFn, prev, argsLen) {
				var len = this.length, keys = [], index;
				for ( var i in this ) if (!/[^\d-]/.test(i) && i < len && i >= 0) keys[keys.length] = i;
				i = keys.length;
				while (i--) {
					index = keys[i];
					if (argsLen < 2) {
						prev = this[index];
						argsLen = 2;
						continue;
					}

					prev = yield iteratorFn.call(global, prev, this[index], index, this);
				}

				return prev;
			},

			some: function* (iteratorFn, thisObj) {
				var len = this.length;
				for ( var i in this ) {
					if (/[^\d-]/.test(i) || i >= len) break;
					if ( i >= 0 && !!(yield iteratorFn.call(thisObj, this[i], i, this)) )
						return true;
				}

				return false;
			},

			sort: function* () {
				throw new Error('Not realized method [].sort(generatorFunction);');
			},

			// harmony
			find: function* () {
				throw new Error('Not realized method [].find(generatorFunction);');
			},

			findIndex: function* () {
				throw new Error('Not realized method [].findIndex(generatorFunction);');
			}

		}
	;

	each(arrayFyberMethods, function (generatorMethodFn, methodName) {
		var nativeFn = _Ap_[methodName];

		if (!nativeFn) return;

		_Ap_[methodName] = function (iteratorFn) {
			return iteratorFn instanceof GeneratorFn.constructor ?
				generatorMethodFn.call(this, iteratorFn, arguments[1], arguments.length) :
				nativeFn.apply(this, arguments);
		};
	});

})();