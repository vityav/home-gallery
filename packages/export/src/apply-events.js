const log = require('@home-gallery/logger')('export.events');
const { readEvents } = require('@home-gallery/events/dist/node');
const { applyEvents } = require('@home-gallery/events');

const events = (database, eventsFilename, cb) => {
  if (!eventsFilename) {
    return cb(null, database);
  }
  
  const t0 = Date.now();
  readEvents(eventsFilename, (err, events) => {
    if (err) {
      log.error(`Failed to load events from ${eventsFilename}: ${err}`);
      return cb(err);
    }
    log.info(t0, `Read events from ${eventsFilename} with ${events.length} events`);

    const t1 = Date.now();
    const entryMap = database.data.reduce((result, entry) => {
      result.set(entry.id, entry);
      return result;
    }, new Map());
    const changedEntries = applyEvents(entryMap, events);
    database.data = Array.from(entryMap.values());
    log.info(t1, `Applied ${events.length} events to ${changedEntries.length} entries`);

    cb(null, database);
  })
}

module.exports = events;