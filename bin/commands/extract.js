/* eslint-env node */

const path = require('path');
const fs = require('fs');
const { isGitRepo, log } = require('../../lib/utils');
const repoUtils = require('../../lib/repo');
const { SourcePath, Path } = require('../../lib/models');

function usage(message) {
  log(`Error: ${message}`, 'error');
  log('USAGE: ./bin/index extract [--config <path>]', 'error');
}

module.exports.command = 'extract';
module.exports.desc = 'Extract from repo';

module.exports.builder = function(yargs) {
  yargs
    .option('config', {
      describe: 'Path to config file with list of apps'
    })
    .demandOption(['config'])
    .coerce(['config'], path.resolve)
    .version(false)
    .help();
};

module.exports.handler = async function(argv) {
  const config = JSON.parse(fs.readFileSync(argv.config));

  const { source: sourcePath, output: outputPath, files = [] } = config;

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
  repoUtils.safeCopy(source.path, source.copyPath);

  log(`ensure ${source.copyPath} is a git repo`);
  if (!isGitRepo(source.copyPath)) {
    log(`${source.copyPath} is not git repo`, 'error');
    process.exit(1);
  }

  if (!isGitRepo(output.path)) {
    log(`${output.path} is not git repo. Creating`, 'warn');
    repoUtils.create(output.path);
  }

  try {
    repoUtils.filter(source.copyPath, files);
    repoUtils.merge(output.path, source.copyPath);
  } catch (e) {
    log(e.message || e, 'error');
  }
};
