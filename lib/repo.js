/* eslint-env node */

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const { safeDelete, hideWhile, log } = require('./utils');

function findMissingFiles(repoPath, files) {
  const fileString = files.join(' ');

  // Git log of all the passed files
  // --all to check all history, branches, renamed files
  // --pretty=format to reduce the output size
  // https://stackoverflow.com/questions/6505557/how-to-tell-if-git-has-ever-tracked-file-x
  const cmd = `git log --oneline --all --pretty=format: --name-only -- ${fileString} | sort -u`;
  const res = childProcess.execSync(cmd, {
    cwd: repoPath,
    stdio: 'pipe'
  });
  const output = res.toString();
  const foundFiles = output.split('\n').filter(Boolean);

  for (const file of files) {
    if (!foundFiles.includes(file)) {
      log(`cmd: ${cmd}`, 'warn');
      log(
        `Found files:\n${output
          .split('\n')
          .map(x => `\t${x}`)
          .join('\n')}`,
        'warn'
      );
      return file;
    }
  }

  return true;
}

function filter(repoPath, files) {
  log(`filtering ${repoPath} down to ${files.length} files`);
  log('validating passed files');
  const firstMissingFile = findMissingFiles(repoPath, files);
  if (firstMissingFile) {
    throw new Error(`Missing file: ${firstMissingFile}`);
  }
  const fileString = files.join(' ');
  const cmd = `git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- ${fileString}'`;
  log(`pruning commits. This could take a while...\n${cmd}`);
  childProcess.execSync(cmd, { cwd: repoPath, stdio: 'inherit' });

  log('removing merge commits. This could take a while...');
  const script = './lib/rm_merge_commits.rb';
  const parentFilterScript = path.join(process.cwd(), script);
  childProcess.execSync(
    `git filter-branch -f --prune-empty --parent-filter ${parentFilterScript} master`,
    { cwd: repoPath, stdio: 'inherit' }
  );
}

function merge(home, alien) {
  if (!fs.existsSync(home)) {
    throw new Error(`${home} does not exist`);
  }

  if (!fs.existsSync(alien)) {
    throw new Error(`${alien} does not exist`);
  }

  log(`add ${alien} as remote "alien"`);
  childProcess.execSync(`git remote add alien ${alien}`, {
    cwd: home,
    stdio: 'pipe'
  });

  log(`fetch from ${alien}`);
  childProcess.execSync('git fetch alien', { cwd: home, stdio: 'pipe' });

  log(`merge from ${alien}`);
  childProcess.execSync('git merge alien/master --allow-unrelated-histories', {
    cwd: home,
    stdio: 'pipe'
  });
}

function safeCopy(input, output) {
  if (!fs.existsSync(input)) {
    throw new Error(`${input} not found`);
  }
  safeDelete(output);
  const nodeModulesPath = path.join(input, 'node_modules');
  hideWhile(nodeModulesPath, () => {
    childProcess.execSync(`cp -R ${input} ${output}`);
    log('ensure clean state of repo and checkout master branch');
    childProcess.execSync('git reset --hard HEAD', { cwd: output });
    childProcess.execSync('git checkout master', { cwd: output });

    log('delete all tags');
    childProcess.execSync('git tag | xargs git tag -d', { cwd: output });

    log('delete all branches except master');
    childProcess.execSync(
      'git branch | grep -v "master" | xargs git branch -D',
      {
        cwd: output
      }
    );
  });
}

function create(targetPath) {
  log(`creating git repo at ${targetPath}`);
  safeDelete(targetPath);
  childProcess.execSync(`mkdir -p ${targetPath}`);
  childProcess.execSync(`git init ${targetPath}`, { cwd: targetPath });
}

module.exports = {
  filter,
  merge,
  safeCopy,
  create,
  findMissingFiles // Exported for tests/filter.js test.
};
