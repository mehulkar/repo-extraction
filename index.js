#!/usr/bin/env node
/* eslint-env node */
const yargs = require('yargs').argv
const path = require('path');
const fs = require('fs');
const { isGitRepo, log } = require('./lib/utils');
const repoUtils = require('./lib/repo');
const { SourcePath, Path } = require('./lib/models');

function usage(message) {
  log(`Error: ${message}`, 'error');
  log('USAGE: ./index [--config <path>]', 'error');
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

if (!outputPath) {
  usage('Missing output');
  process.exit(1);
}

if (!sourcePath) {
  usage('Missing source');
  process.exit(1);
}

if (!files.length) {
  usage('Missing files config');
  process.exit(1);
}

const source = new SourcePath(sourcePath);
const output = new Path(outputPath);

log('copy source for destructive changes');
repoUtils.safeCopy(source, source.copyPath);

log(`ensure ${source.path} is a git repo`);
if (!isGitRepo(source.path)) {
  log(`${source.path} is not git repo`, 'error');
  process.exit(1);
}

if (!isGitRepo(output.path)) {
  log(`${output.path} is not git repo. Creating`, 'warn');
  repoUtils.create(output.path);
  process.exit(1);
}

log(`extract ${files.length} files`);
repoUtils.filter(source.copyPath, output, files);
repoUtils.merge(output, source.copyPath);
