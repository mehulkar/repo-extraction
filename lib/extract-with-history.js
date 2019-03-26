require('colors');
const path = require('path');
const childProcess = require('child_process');

function log(message) {
  console.log(message.grey);
}

module.exports = function(sourceRepoPath, targetRepoPath, files) {
  const fileString = files.map(f => f.path).join(' ');

  log(`sourceRepoPath: prune commits that don't belong to ${files.length} targetRepoPath file(s). This could take a while...`);
  childProcess.execSync(
    `git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- ${fileString}'`,
    { cwd: sourceRepoPath, stdio: 'inherit' }
  );

  log(`sourceRepoPath: remove merge commits. This could take a while...`);
  const parentFilterScript = path.join(process.cwd(), './lib/rm_merge_commits.rb');
  childProcess.execSync(
    `git filter-branch -f --prune-empty --parent-filter ${parentFilterScript} master`,
    { cwd: sourceRepoPath, stdio: 'inherit' }
  )

  log(`targetRepoPath: add ${sourceRepoPath} as remote "source"`);
  childProcess.execSync(`git remote add source ${sourceRepoPath}`, { cwd: targetRepoPath, stdio: 'pipe' });

  log(`targetRepoPath: fetch from ${sourceRepoPath}`);
  childProcess.execSync('git fetch source', { cwd: targetRepoPath, stdio: 'pipe' })

  log(`targetRepoPath: merge from ${sourceRepoPath}`);
  childProcess.execSync('git merge source/master --allow-unrelated-histories', { cwd: targetRepoPath, stdio: 'pipe' })
}
