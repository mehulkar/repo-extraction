# Repo Extraction

A tool to extract code out of a repo.

## Usage

```bash
npm run extract -- [--config <path>]
```

### Example

```bash
npm run extract -- --source ../tmp-extraction-playground/test-app --component foo-bar
```

#### Config

Should be a JSON file with the following structure:

```json
{
  "source": "/some/path",
  "output": "/some/path/for/new/addon",
  "files": [
    { "name": "file1", "path": "app/sub/file1" },
    { "name": "file2", "path": "app/sub/file2" },
    { "name": "file3", "path": "app/sub/file3" },
    { "name": "file4", "path": "app/sub/file4" }
  ]
}
```

`files` should be a relative path within the source directory, omitting the `./`.
