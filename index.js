#!/usr/bin/env node
/* eslint-env node */
require('colors');
const yargs = require('yargs').argv
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const { safeDelete , isGitRepo } = require('./lib/utils');
const repoFilter = require('./lib/repo-filter');
const repoMerge = require('./lib/repo-merge');
const repoSafeCopy = require('./lib/repo-safe-copy');
const { SourcePath, Path } = require('./lib/models');

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
  usage(`Missing ${configFilePath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFilePath));

const {
  source: sourcePath,
  output: outputPath,
  files = []
} = config;

if (!output) {
  usage('Missing output');
  process.exit(1);
}

if (!source) {
  usage('Missing source');
  process.exit(1);
}

if (!files.length) {
  usage('Missing files config');
  process.exit(1);
}

const source = new SourcePath(sourcePath);
const output = new Path(outputPath);

console.log(`create new addon at ${output.path}`);
safeDelete(output.path);
childProcess.execSync(`ember addon ${output.name} --skip-npm`, { cwd: output.parent })

console.log('copy source to source.copyPath for destructive changes');
repoSafeCopy(source, source.copyPath);

console.log(`ensure ${source.path} exists and is an ember app`);
if (!isGitRepo(source.path)) {
  console.error(`${source.path} is not git repo.`.red);
}

if (!isGitRepo(output.path)) {
  console.error(`${source.path} is not git repo.`.red);
}

console.log(`extract ${files.map(x => x.name)}`);
repoFilter(source.copyPath, output, files);
repoMerge(output, source.copyPath);
