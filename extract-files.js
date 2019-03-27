#!/usr/bin/env node
require('colors');
const yargs = require('yargs').argv
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const isGit = require('./lib/is-git');
const deleteIfDir = require('./lib/delete-if');
const extractFilesWithHistory = require('./lib/extract-with-history');

function usage(message) {
  console.error(`Error: ${message}`.red);
  console.error('USAGE: ./extract-files [--source <path>] [--output <path>] [--config <path>]'.red);
}

function step(message, cb) {
  console.log(message.yellow);
  cb();
  console.log('\n');
}

if (!yargs.config) {
  usage('Missing config option');
  process.exit(1);
}

const configFilePath = path.resolve(yargs.config);

if (!fs.existsSync(configFilePath)) {
  usage(`${configFilePath} does not exist`);
  process.exit(1);
}

const jsonConfig = JSON.parse(fs.readFileSync(configFilePath));
console.log('------------------');
console.log(jsonConfig);
console.log('------------------');
const {
  source,
  onlyFiles = [],
  output,
} = jsonConfig;


const filesToExtract = onlyFiles;
const sourceAbsolutePath = path.resolve(source);
const sourceCopyPath = path.join(sourceAbsolutePath, '..', `${path.basename(sourceAbsolutePath)}-copy`);
const outputParentDirectory = path.join(output, '..');

if (!source) {
  usage('Missing source');
  process.exit(1);
}
if (!filesToExtract.length) {
  usage('Please provide component name or `onlyFiles` argument in config file');
  process.exit(1);
}

if (!output) {
  usage('Missing output');
  process.exit(1);
}

step(`ensure ${source} exists and is a git repo`, () => {
  if (isGit(sourceAbsolutePath)) {
    console.log('--> passed check'.green);
  } else {
    console.error(`--> Error: ${sourceAbsolutePath} is not a git repo.`);
  }
});

step(`create new repo ${output}, cwd: ${outputParentDirectory}`, () => {
  deleteIfDir(output);
  const outputFolder = path.basename(output);
  childProcess.execSync(`mkdir -p ${outputFolder}`, { cwd: outputParentDirectory })
  childProcess.execSync(`git init`, { cwd: output })
});

step('copy source to sourceCopyPath for destructive changes', () => {
  deleteIfDir(sourceCopyPath);
  childProcess.execSync(`cp -R ${source} ${sourceCopyPath}`);
  console.log('---> ensure clean state of repo and checkout master branch'.grey);
  childProcess.execSync('git reset --hard HEAD', { cwd: sourceCopyPath });
  childProcess.execSync('git checkout master', { cwd: sourceCopyPath });
  console.log('---> delete all tags'.grey);
  childProcess.execSync('git tag | xargs git tag -d', { cwd: sourceCopyPath });
  console.log('---> delete all branches except master'.grey);
  childProcess.execSync('git branch | grep -v "master" | xargs git branch -D', { cwd: sourceCopyPath });
  console.log('---> remove all remotes'.grey);
  childProcess.execSync('git remote | xargs git remote rm', { cwd: sourceCopyPath });
});

if (!filesToExtract.every(x => x.path)) {
  console.log('---> All the supplied file names were not found. Please check config file!');
  process.exit(1);
}

step(`extract ${filesToExtract.map(x => x.name)}`, () => {
  extractFilesWithHistory(sourceCopyPath, output, filesToExtract);
});
