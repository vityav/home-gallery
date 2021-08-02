const ffprobe = require('ffprobe');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const log = require('@home-gallery/logger')('extractor.video.ffprobe');

const { toPipe, conditionalTask } = require('./task');

const ffprobeSuffix = 'ffprobe.json';

function videoMeta(storage) {
  const test = entry => entry.type === 'video' && !storage.hasEntryFile(entry, ffprobeSuffix);

  const task = (entry, cb) => {
    const t0 = Date.now();
    ffprobe(entry.src, { path: ffprobePath }, function (err, info) {
      if (err) {
        log.warn(`Could not extract video meta data from ${entry}: ${err}`);
        return cb();
      }

      storage.writeEntryFile(entry, ffprobeSuffix, JSON.stringify(info), (err) => {
        if (err) {
          log.warn(`Could not write video meta data from ${entry}: ${err}`);
          return cb(err);
        }
        log.info(t0, `Extracted video meta data from ${entry}`);
        cb();
      })
    });
  }

  return toPipe(conditionalTask(test, task));
}

module.exports = videoMeta;