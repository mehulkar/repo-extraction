const childProcess = require('child_process');
const fs = require('fs');
const { safeDelete, log } = require('./utils');

module.exports = function(input, output) {
  if (!fs.existsSync(input)) {
    throw new Error(`${input} not found`);
  }
  safeDelete(output);
  childProcess.execSync(`cp -R ${input} ${output}`);
  log('---> ensure clean state of repo and checkout master branch');
  childProcess.execSync('git reset --hard HEAD', { cwd: output });
  childProcess.execSync('git checkout master', { cwd: output });

  log('---> delete all tags');
  childProcess.execSync('git tag | xargs git tag -d', { cwd: output });

  log('---> delete all branches except master');
  childProcess.execSync('git branch | grep -v "master" | xargs git branch -D', {
    cwd: output
  });
};
