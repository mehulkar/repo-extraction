const path = require('path');

class Path {
  constructor(input) {
    this.input = input;
    this.path = path.resolve(input);
  }

  get parent() {
    return path.dirname(this.path);
  }

  get name() {
    return path.basename(this.path);
  }
}

class SourcePath extends Path {
  get copyPath() {
    return path.join(this.parent, `${this.name}-copy`);
  }
}

module.exports = {
  SourcePath,
  Path
};
