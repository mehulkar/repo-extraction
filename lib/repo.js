/* eslint-env node */

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const { safeDelete, log } = require('./utils');

function filter(sourceRepoPath, targetRepoPath, files) {
  const fileString = files.join(' ');

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

function merge(home, alien) {
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

function safeCopy(input, output) {
  if (!fs.existsSync(input)) {
    throw new Error(`${input} not found`);
  }
  safeDelete(output);
  log(`---> deleting node_moules in ${input}`);
  safeDelete(path.join(input), 'node_modules');
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

function create(targetPath) {
  log(`creating git repo at ${targetPath}`)
  safeDelete(targetPath);
  childProcess.execSync(`mkdir -p ${targetPath}`);
  childProcess.execSync(`git init ${targetPath}`, { cwd: targetPath });
}

module.exports = {
  filter, merge, safeCopy, create
}
