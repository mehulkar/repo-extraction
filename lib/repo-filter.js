/* eslint-env node */

const path = require('path');
const childProcess = require('child_process');
const { log } = require('./utils');

module.exports = function(sourceRepoPath, targetRepoPath, files) {
  const fileString = files.map(f => f.path).join(' ');

  log(`prune commits that don't belong to ${files.length} file(s). This could take a while...`);
  childProcess.execSync(
    `git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- ${fileString}'`,
    { cwd: sourceRepoPath, stdio: 'inherit' }
  );

  log('removing merge commits. This could take a while...');
  const parentFilterScript = path.join(process.cwd(), './lib/rm_merge_commits.rb');
  childProcess.execSync(
    `git filter-branch -f --prune-empty --parent-filter ${parentFilterScript} master`,
    { cwd: sourceRepoPath, stdio: 'inherit' }
  )
}
