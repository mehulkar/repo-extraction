const recursive = require('recursive-readdir');
const fs = require('fs');
const { log } = require('./utils');

module.exports = async function(dirs) {
  let retVal = [];

  for (const dir of dirs) {
    log(`Scanning ${dir} for files`);
    let isDirectory = false;
    try {
      const stats = fs.statSync(dir);
      isDirectory = stats.isDirectory();
    } catch (e) {
      log(e, 'error');
    }

    if (isDirectory) {
      const filesInDir = await recursive(dir, [ignoreFunc]);
      retVal = [...retVal, ...filesInDir];
    } else {
      log(`Skipping ${dir}, not a directory`);
    }
  }

  return retVal;
};

function ignoreFunc(file, stats) {
  if (stats.isDirectory()) {
    // Ignore node_modules directory
    if (file.match(/node_modules/)) {
      return true;
    }

    // Do not ignore if it's a directory, or recursion will stop
    return false;
  }

  return false;
}
