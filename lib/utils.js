/* eslint-env node */
require('colors');

const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');

function log(msg, severity) {
  if (severity === 'error') {
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
    log(`remove existing ${target}`);
    childProcess.execSync(`rm -rf ${target} || true`);
  }
}

function hideWhile(target, callback) {
  if (fs.existsSync(target)) {
    const tmpLocation = path.join(process.env.HOME, 'tmp');
    childProcess.execSync(`mkdir -p ${tmpLocation}`);
    const from = path.resolve(target);
    const to = path.join(tmpLocation, path.basename(target));
    log(`[hideWhile] move to ${to}`);
    childProcess.execSync(`mv ${from} ${to}`);
    try {
      callback();
    } catch (e) {
      // do nothing
    }
    log(`[hideWhile] move back ${target}`);
    childProcess.execSync(`mv ${to} ${from}`);
  } else {
    callback();
  }
}

function isGitRepo(target) {
  return fs.existsSync(path.join(target, '.git'));
}

module.exports = {
  safeDelete,
  isGitRepo,
  log,
  hideWhile
};
