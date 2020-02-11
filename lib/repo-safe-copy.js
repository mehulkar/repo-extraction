const childProcess = require('child_process');
const fs = require('fs');

const { safeDelete } = require('./utils');

module.exports = function(input, output) {
  if (!fs.existsSync(input)) {
    throw new Error(`${input} not found`);
  }
  safeDelete(output);
  childProcess.execSync(`cp -R ${input} ${output}`);
  console.log(
    '---> ensure clean state of repo and checkout master branch'.grey
  );
  childProcess.execSync('git reset --hard HEAD', { cwd: output });
  childProcess.execSync('git checkout master', { cwd: output });
  console.log('---> delete all tags'.grey);
  childProcess.execSync('git tag | xargs git tag -d', { cwd: output });
  console.log('---> delete all branches except master'.grey);
  childProcess.execSync('git branch | grep -v "master" | xargs git branch -D', {
    cwd: output
  });
};
