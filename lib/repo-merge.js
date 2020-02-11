const fs = require('fs');
const childProcess = require('child_process');
const { log } = require('./utils');

module.exports = function(home, alien) {
  if (!fs.existsSync(home)) {
    throw new Error(`${home} does not exist`);
  }

  if (!fs.existsSync(alien)) {
    throw new Error(`${alien} does not exist`);
  }

  log(`add ${alien} as remote "alien"`);
  childProcess.execSync(`git remote add alien ${alien}`, { cwd: home, stdio: 'pipe' });

  log(`fetch from ${alien}`);
  childProcess.execSync('git fetch alien', { cwd: home, stdio: 'pipe' })

  log(`merge from ${alien}`);
  childProcess.execSync('git merge alien/master --allow-unrelated-histories', { cwd: home, stdio: 'pipe' })
}
