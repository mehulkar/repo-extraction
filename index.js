#!/usr/bin/env node
require('colors');
const yargs = require('yargs').argv
const path = require('path');
const childProcess = require('child_process');
const isEmberApp = require('./lib/is-ember');
const deleteIfDir = require('./lib/delete-if');
const extractFilesWithHistory = require('./lib/extract-with-history');

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

console.log(yargs);

const { source, component } = yargs;
const sourceAbsolutePath = path.resolve(source);
const sourceCopyPath = path.join(sourceAbsolutePath, '..', `${path.basename(sourceAbsolutePath)}-copy`);

let addonName = yargs.addon_name || `${component}-addon`;

const addonPath = path.join(sourceCopyPath, '..', addonName);
const addonParentDirectory = path.join(addonPath, '..');

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

step(`create new addon at ${addonPath}`, () => {
  deleteIfDir(addonPath);
  childProcess.execSync(`ember addon ${addonName} --skip-npm`, { cwd: addonParentDirectory })
});

step('copy source to sourceCopyPath for destructive changes', () => {
  deleteIfDir(sourceCopyPath);
  childProcess.execSync(`cp -R ${source} ${sourceCopyPath}`);
  console.log('---> ensure clean state of repo'.grey);
  childProcess.execSync('git reset --hard HEAD', { cwd: sourceCopyPath });
});

step(`extract ${componentFiles}`, () => {
  extractFilesWithHistory(sourceCopyPath, addonPath, componentFiles);
});
