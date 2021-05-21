const debug = require('debug')('stream:skip')

const filter = require('./filter');

function skip(amount) {
  amount = +amount || 0
  if (amount > 0) {
    debug(`Skip first ${amount} stream entries`)
  }

  let count = 0;
  return filter(() => count++ >= amount)
}

module.exports = skip;