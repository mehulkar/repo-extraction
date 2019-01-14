const fs = require('fs');
const childProcess = require('child_process');

module.exports = function(target) {
  if (fs.existsSync(target)) {
    console.log(`---> remove existing ${target}`.grey)
    childProcess.execSync(`rm -rf ${target} || true`);
  }
}
