require('colors');
const path = require('path');
const childProcess = require('child_process');

function log(message) {
  console.log(message.grey);
}

module.exports = function(source, target, files) {
  const fileString = files.map(f => f.path).join(' ');
  const rmMergeCommitScriptPath = path.join(process.cwd(), './lib/rm_merge_commits.rb');

  log(`source: prune commits that do not belong to ${fileString}. This could take a while...`);
  childProcess.execSync(
    `git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- ${fileString}'`,
    { cwd: source }
  );

  log('source: remove all merge commits');
  childProcess.execSync(
    `git filter-branch -f --prune-empty --parent-filter ${rmMergeCommitScriptPath} master`,
    { cwd: source }
  );

  log(`target: add ${source} as remote`);
  childProcess.execSync(`git remote add source ${source}`, { cwd: target, stdio: 'pipe' });

  log(`target: fetch from ${source}`);
  childProcess.execSync('git fetch source', { cwd: target, stdio: 'pipe' })

  log(`target: merge from ${source}`);
  childProcess.execSync('git fetch source && git merge source/master --allow-unrelated-histories', { cwd: target, stdio: 'pipe' })
}
