const fs = require('fs');
const path = require('path');

module.exports = function(target) {
  const verificationFiles = ['package.json', '.ember-cli'];

  const missingFiles = verificationFiles.reduce((memo, file) => {
    if (!fs.existsSync(path.join(target, file))) {
      memo.push(file);
    }
    return memo;
  }, []);

  if (missingFiles.length === 0) {
    return { result: true };
  } else {
    return { result: false, missingFiles };
  }
}
