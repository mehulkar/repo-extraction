# Repo Extraction

A tool to extract code out of a repo.

## Usage

```bash
npx @apple/repo-extraction --config <path>
```

### Config

Should be a JSON file with the following structure:

```json
{
  "source": "/some/path",
  "output": "/some/path/for/new/addon",
  "files": [
    "app/sub/file1",
    "app/sub/file2",
    "app/sub/file3",
    "app/sub/file4"
  ]
}
```

`files` should be a relative path within the source directory, omitting the `./`.
