const path = require('path');

class Source {
  constructor(input) {
    this.input = input;
    this.absPath = path.resolve(input);
  }

  get parent() {
    return path.dirname(this.absPath);
  }

  get copyPath() {
    return path.join(this.parent, `${path.basename(this.absPath)}-copy`);
  }
}

class Target {
  constructor(path) {
    this.path = path;
  }

  get parent() {
    return path.dirname(this.path);
  }

  get name() {
    return path.basename(this.path);
  }
}

module.exports = {
    Source,
    Target
}
