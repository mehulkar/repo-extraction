const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');

function safeDelete(target) {
  if (fs.existsSync(target)) {
    console.log(`---> remove existing ${target}`.grey)
    childProcess.execSync(`rm -rf ${target} || true`);
  }
}

function isGitRepo(target) {
  return fs.existsSync(path.join(target, '.git'));
}

module.exports = {
  safeDelete, isGitRepo
}
