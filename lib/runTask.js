/*jshint node:true */

"use strict";

module.exports = function (task, taskName, taskTimeout, done) {
	var that = this, finish, cb, isDone = false, start, r, timeoutHandle, timedOut = false;

	finish = function (err, runMethod) {
		var hrDuration = process.hrtime(start);

		if (timeoutHandle) {
			clearTimeout(timeoutHandle);
			timeoutHandle = null;
		} else if (!err && timedOut) {
			return; // it timed out previously, and just now finished successfully
		}

		if (isDone && !err) {
			err = new Error('task completion callback called too many times');
		}
		isDone = true;

		var duration = hrDuration[0] + (hrDuration[1] / 1e9); // seconds

		done.call(that, err, {
			duration: duration, // seconds
			hrDuration: hrDuration, // [seconds,nanoseconds]
			runMethod: runMethod
		});
	};

	cb = function (err) {
		finish(err, 'callback');
	};

	try {
		timeoutHandle = setTimeout(function () {
			if (!isDone) {
				finish(new Error('task \''+taskName+'\' timed out, waited '+taskTimeout+' ms'), 'timeout');
				timedOut = true;
			}
		}, taskTimeout);
		start = process.hrtime();
		r = task(cb);
	} catch (err) {
		return finish(err, 'catch');
	}

	if (r && typeof r.done === 'function') {
		// wait for promise to resolve
		// FRAGILE: ASSUME: Promises/A+, see http://promises-aplus.github.io/promises-spec/
		r.done(function () {
			finish(null, 'promise');
		}, function(err) {
			finish(err, 'promise');
		});

	} else if (r && typeof r.pipe === 'function') {
		// wait for stream to end

		r.once('error', function (err) {
			if (!isDone) finish(err, 'stream');
		});
		r.once('end', function () {
			if (!isDone) finish(null, 'stream');
		});

	} else if (task.length === 0) {
		// synchronous, function took in no parameters
		finish(null, 'sync');

	//} else {
		// FRAGILE: ASSUME: callback

	}
};
