#!/usr/bin/env node
/* eslint-env node */

require('yargs')
  .commandDir('./commands')
  .demandCommand()
  .help().argv;
