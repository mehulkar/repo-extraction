#!/usr/bin/env node
require('colors');
const yargs = require('yargs').argv
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const isEmberApp = require('./lib/is-ember');
const deleteIfDir = require('./lib/delete-if');
const extractFilesWithHistory = require('./lib/extract-with-history');

function usage() {
  console.error('USAGE: ./index [--source <path>] [--component <value>] [--addon-name <value>] [--config <path>]'.red);
}

function step(message, cb) {
  console.log(message.yellow);
  cb();
  console.log('\n');
}

let source, component, componentFiles, addonName;

if (yargs.config) {
  const configFilePath = path.resolve(yargs.config);
  if (!fs.existsSync(configFilePath)) {
    usage();
    process.exit(1);
  }
  const jsonConfig = JSON.parse(fs.readFileSync(configFilePath));
  source = jsonConfig.source;
  component = jsonConfig.component;
  const additionalFiles = jsonConfig.additionalFiles || [];
  componentFiles = [defaultFilesForComponent(component), ...additionalFiles];
  addonName = jsonConfig.addonName;
} else {
  if (!yargs.source || !yargs.component) {
    usage();
    process.exit(1);
  }
  source = yargs.source;
  component = yargs.component;
  componentFiles = defaultFilesForComponent(component);
  addonName = yargs['addon-name'] || `${component}-addon`;
}

const sourceAbsolutePath = path.resolve(source);
const sourceCopyPath = path.join(sourceAbsolutePath, '..', `${path.basename(sourceAbsolutePath)}-copy`);
const addonPath = path.join(sourceCopyPath, '..', addonName);
const addonParentDirectory = path.join(addonPath, '..');


step(`ensure ${source} exists and is an ember app`, () => {
  const { result: isEmber, missingFiles} = isEmberApp(sourceAbsolutePath);
  if (isEmber) {
    console.log('--> passed check'.green);
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
  console.log('---> ensure clean state of repo and checkout master branch'.grey);
  childProcess.execSync('git reset --hard HEAD', { cwd: sourceCopyPath });
  childProcess.execSync('git checkout master', { cwd: sourceCopyPath });
  console.log('---> delete all tags'.grey);
  childProcess.execSync('git tag | xargs git tag -d', { cwd: sourceCopyPath });
  console.log('---> delete all branches except master'.grey);
  childProcess.execSync('git branch | grep -v "master" | xargs git branch -D', { cwd: sourceCopyPath });
});

step(`extract ${componentFiles.map(x => x.name)}`, () => {
  extractFilesWithHistory(sourceCopyPath, addonPath, componentFiles);
});


function defaultFilesForComponent(component) {
  return [
    { name: 'js', path: path.join('app', 'components', `${component}.js`) },
    { name: 'hbs', path: path.join('app', 'templates', 'components', `${component}.hbs`) },
    { name: 'scss', path: path.join('app', 'styles', 'components', `${component}.scss`) },
    { name: 'css', path: path.join('app', 'styles', 'components', `${component}.css`) },
    { name: 'integration test', path: path.join('tests', 'integration', 'components', `${component}-test.js`) },
    { name: 'unit test', path: path.join('tests', 'unit', 'components', `${component}-test.js`) },
  ]
}
