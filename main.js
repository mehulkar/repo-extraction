#!/usr/bin/env node
require('colors');
const yargs = require('yargs').argv
const path = require('path');
const childProcess = require('child_process');
const isEmberApp = require('./lib/is-ember');
const deleteIfDir = require('./lib/delete-if');

function usage() {
  console.log('USAGE:');
  console.log('./main --source path/to/repo/source --component foo-bar\n');
}

function step(message, cb) {
  console.log(message.yellow);
  cb();
  console.log('\n');
}

if (!yargs.source || !yargs.component) {
  console.error('Error: Bad args');
  usage();
  process.exit(1);
}

const { source, component } = yargs;
const sourceAbsolutePath = path.resolve(source);
const sourceCopyPath = path.join(sourceAbsolutePath, '..', `${path.basename(sourceAbsolutePath)}-copy`);
const rmMergeCommitScriptPath = path.join(process.cwd(), './rm_merge_commits.rb');

const addonName = `${component}-addon`;
const addonParentDirectory = path.join(sourceCopyPath, '..');
const addonPath = path.join(addonParentDirectory, addonName);

const componentFiles = [
  { name: 'js', path: path.join('app', 'components', `${component}.js`) },
  { name: 'hbs', path: path.join('app', 'templates', 'components', `${component}.hbs`) },
  { name: 'scss', path: path.join('app', 'styles', 'components', `${component}.scss`) },
  { name: 'css', path: path.join('app', 'styles', 'components', `${component}.css`) },
  { name: 'integration test', path: path.join('tests', 'integration', 'components', `${component}-test.js`) },
  { name: 'unit test', path: path.join('tests', 'unit', 'components', `${component}-test.js`) },
];

step(`source: ensure ${source} exists and is an ember app`, () => {
  const { result: isEmber, missingFiles} = isEmberApp(sourceAbsolutePath);
  if (isEmber) {
    console.log('--> passed check'.grey);
  } else {
    console.error(`--> Error: ${sourceAbsolutePath} is not an ember app. Missing ${missingFiles}`.red);
  }
});

step('source: copy source to sourceCopyPath for destructive changes', () => {
  deleteIfDir(sourceCopyPath);
  childProcess.execSync(`cp -R ${source} ${sourceCopyPath}`);
});

step('sourceCopyPath: ensure clean state of repo', () => {
  childProcess.execSync('git reset --hard HEAD', { cwd: sourceCopyPath });
});

step(`sourceCopyPath: prune all commits that do not belong to ${component}. This could take a while...`, () => {
  const fileString = componentFiles.map(f => f.path).join(' ');
  const cmd = `git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- ${fileString}'`;
  childProcess.execSync(cmd, { cwd: sourceCopyPath });
});

step('sourceCopyPath: remove all merge commits', () => {
  const cmd = `git filter-branch -f --prune-empty --parent-filter ${rmMergeCommitScriptPath} master`;
  childProcess.execSync(cmd, { cwd: sourceCopyPath });
});

step(`addon: create new addon at ${addonPath}`, () => {
  deleteIfDir(addonPath);
  childProcess.execSync(`ember addon ${addonName} --skip-npm`, { cwd: addonParentDirectory })
});

step(`addon: add ${sourceCopyPath} as remote`, () => {
  childProcess.execSync(`git remote add source ${sourceCopyPath}`, { cwd: addonPath })
});

step('addon: merge remote into addon repo', () => {
  childProcess.execSync('git remote -v', { cwd: addonPath })
  childProcess.execSync('git fetch source && git merge source/master --allow-unrelated-histories', { cwd: addonPath })
});
