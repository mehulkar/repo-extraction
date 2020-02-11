require('colors');

const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');


function log(msg, severity) {
  if (severity === 'error')  {
    console.error(msg.red);
  }
  if (severity === 'warn') {
    console.warn(msg.yellow);
  }
  if (!severity) {
    console.log(msg.grey);
  }
}

function safeDelete(target) {
  if (fs.existsSync(target)) {
    log(`---> remove existing ${target}`);
    childProcess.execSync(`rm -rf ${target} || true`);
  }
}

function isGitRepo(target) {
  return fs.existsSync(path.join(target, '.git'));
}

module.exports = {
  safeDelete, isGitRepo, log
}
