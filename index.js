#!/usr/bin/env node
/* eslint-env node */
require('colors');
const yargs = require('yargs').argv
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const isEmberApp = require('./lib/is-ember');
const deleteIfDir = require('./lib/delete-if');
const repoFilter = require('./lib/repo-filter');
const repoMerge = require('./lib/repo-merge');
const repoSafeCopy = require('./lib/repo-safe-copy');

function usage(message) {
  console.error(`Error: ${message}`.red);
  console.error('USAGE: ./index [--source <path>] [--component <value>] [--addon-name <value>] [--output <path>] [--config <path>]'.red);
}

function step(message, cb) {
  console.log(message.yellow);
  cb();
  console.log('\n');
}

let source, component, filesToExtract, output;

if (yargs.config) {
  const configFilePath = path.resolve(yargs.config);
  if (!fs.existsSync(configFilePath)) {
    usage(`${configFilePath} does not exist`);
    process.exit(1);
  }
  const jsonConfig = JSON.parse(fs.readFileSync(configFilePath));
  source = jsonConfig.source;
  component = jsonConfig.component;
  const onlyFiles = jsonConfig.onlyFiles || [];
  if (onlyFiles) {
    filesToExtract = [...onlyFiles];
  } else {
    const additionalFiles = jsonConfig.additionalFiles || [];
    filesToExtract = [...defaultFilesForComponent(component), ...additionalFiles];
  }

  output = jsonConfig.output;
} else {
  source = yargs.source;
  component = yargs.component;
  output = yargs.output;
  filesToExtract = defaultFilesForComponent(component);
}

const sourceAbsolutePath = path.resolve(source);
const sourceCopyPath = path.join(sourceAbsolutePath, '..', `${path.basename(sourceAbsolutePath)}-copy`);

const addonParentDirectory = path.join(output, '..');

if (!source) {
  usage('Missing source');
  process.exit(1);
}
if (!component && !filesToExtract.length) {
  usage('Please provide component name or `onlyFiles` argument in config file');
  process.exit(1);
}
if (!output) {
  usage('Missing output');
  process.exit(1);
}

step(`ensure ${source} exists and is an ember app`, () => {
  const { result: isEmber, missingFiles} = isEmberApp(sourceAbsolutePath);
  if (isEmber) {
    console.log('--> passed check'.green);
  } else {
    console.error(`--> Error: ${sourceAbsolutePath} is not an ember app. Missing ${missingFiles}`.red);
  }
});

step(`create new addon at ${output}`, () => {
  deleteIfDir(output);
  const outputFolder = path.basename(output);
  childProcess.execSync(`ember addon ${outputFolder} --skip-npm`, { cwd: addonParentDirectory })
});

step('copy source to sourceCopyPath for destructive changes', () => {
  repoSafeCopy(source, sourceCopyPath);
});

step(`extract ${filesToExtract.map(x => x.name)}`, () => {
  repoFilter(sourceCopyPath, output, filesToExtract);
  repoMerge(output, sourceCopyPath);
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
