require('colors');
const path = require('path');
const childProcess = require('child_process');

module.exports = function(source, target, files) {
  const fileString = files.map(f => f.path).join(' ');
  const rmMergeCommitScriptPath = path.join(process.cwd(), './lib/rm_merge_commits.rb');

  console.log(`source: prune commits that do not belong to ${fileString}. This could take a while...`.grey);
  childProcess.execSync(
    `git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- ${fileString}'`,
    { cwd: source }
  );

  console.log('source: remove all merge commits'.grey);
  childProcess.execSync(
    `git filter-branch -f --prune-empty --parent-filter ${rmMergeCommitScriptPath} master`,
    { cwd: source }
  );

  console.log(`target: add ${source} as remote`.grey);
  childProcess.execSync(`git remote add source ${source}`, { cwd: target });

  console.log(`target: fetch from ${source}`.grey);
  childProcess.execSync('git fetch source', { cwd: target })

  console.log(`target: merge from ${source}`.grey);
  childProcess.execSync('git fetch source && git merge source/master --allow-unrelated-histories', { cwd: target })
}
