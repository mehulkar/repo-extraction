const fs = require('fs');
const path = require('path');

module.exports = function(target) {
  const verificationPaths = ['.git'];

  const missingPaths = verificationPaths.reduce((memo, verificationPath) => {
    if (!fs.existsSync(path.join(target, verificationPath))) {
      memo.push(verificationPath);
    }
    return verificationPath;
  }, []);

  if (missingPaths.length === 0) {
    return { result: true };
  } else {
    return { result: false, missingPaths };
  }
}
