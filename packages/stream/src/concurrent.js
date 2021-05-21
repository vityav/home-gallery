const through2 = require('through2');
const debug = require('debug')('stream:concurrent');

const noop = () => through2.obj((entry, _, cb) => cb(null, entry))

const concurrent = (concurrent, countOffset) => {
  concurrent = typeof concurrent == 'undefined' ? 0 : +concurrent
  countOffset = +countOffset || 0
  if (concurrent <= 0) {
    return {
      queueEntry: noop(),
      releaseEntry: noop()
    };
  }
  
  debug(`Processing queue is limitted to ${concurrent} concurrent entries`)

  let count = 0;
  let runningTasks = 0;
  const queue = [];

  const next = () => {
    if (!queue.length || runningTasks >= concurrent) {
      return;
    }

    const head = queue.shift();
    if (!head.isFlush) {
      //debug(`Start processing entry ${head.entry} (#${head.count})`)
      runningTasks++;
    }
    head.done();
  }

  const queueEntry = through2.obj((entry, _, cb) => {
    const done = () => cb(null, entry);
    queue.push({entry, done, count: countOffset + count++});
    next();
  }, (cb) => {
    queue.push({entry: null, done: cb, isFlush: true});
    next();
  });

  const releaseEntry = through2.obj((entry, _, cb) => {
    runningTasks--
    //debug(`End processing entry ${entry}`)
    cb(null, entry);
    next();
  }, cb => {
    //debug(`All entries are processed`)
    cb();
  });

  return {
    queueEntry,
    releaseEntry
  }
}

module.exports = concurrent;