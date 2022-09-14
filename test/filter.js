const repo = require('../lib/repo');

const source = '/Users/mehulkar/dev/web-tv-app';
const files = [
  'app/foo/bar.js',
  'README.md',
  'app/components/artwork-loading.js', // exists now
  'app/templates/components/artwork-placeholder.hbs' // From history
];

console.log(repo.findMissingFiles(source, files));
