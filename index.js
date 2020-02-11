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
const { Source, Target } = require('./lib/models');

function usage(message) {
  console.error(`Error: ${message}`.red);
  console.error('USAGE: ./index [--config <path>]'.red);
}

if (!yargs.config) {
  usage('Missing config');
  process.exit(1);
}

const configFilePath = path.resolve(yargs.config);
if (!fs.existsSync(configFilePath)) {
  usage(`${configFilePath} does not exist`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFilePath));

const {
  source: sourcePath,
  output: outputPath,
  files = []
} = config;

const source = new Source(sourcePath);
const output = new Target(outputPath);

if (!source) {
  usage('Missing source');
  process.exit(1);
}
if (!files.length) {
  usage('Missing files config');
  process.exit(1);
}

if (!output) {
  usage('Missing output');
  process.exit(1);
}

console.log(`ensure ${source} exists and is an ember app`);
const { result: isEmber, missingFiles} = isEmberApp(source.absPath);
if (isEmber) {
  console.log('--> passed check'.green);
} else {
  console.error(`--> Error: ${source.absPath} is not an ember app. Missing ${missingFiles}`.red);
}

console.log(`create new addon at ${output}`);
deleteIfDir(output.path);
childProcess.execSync(`ember addon ${output.name} --skip-npm`, { cwd: output.parent })

console.log('copy source to source.copyPath for destructive changes');
repoSafeCopy(source, source.copyPath);

console.log(`extract ${files.map(x => x.name)}`);
repoFilter(source.copyPath, output, files);
repoMerge(output, source.copyPath);
