const Timeout = require('await-timeout');
const file = require("./file");

const SEC = 1000;
const MINUTE = 60 * SEC;

async function wait(period) {
  return Timeout.set(period);
}

function loadModule(name) {
  const filePath = file.join(`../modules`, name);
  try {
    require.resolve(filePath);
  } catch (e) {
    return null;
  }
  return require(filePath);
}

function parseArgv() {
  const argv = require('yargs')(process.argv.slice(2))
    .scriptName("price-downloader")
    .usage('$0 <cmd> [args]')
    .coerce(['dest'], file.pathResolve)
    .help()
    .argv

  return argv;
}

module.exports = {
  SEC,
  MINUTE,
  wait,
  loadModule,
  parseArgv
}