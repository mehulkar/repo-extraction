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

**Notes**:

1. If a git repo isn't found at `output`, it'll unsafely delete that path and create a new directory there
1. Full history of all files will be collected, including renames
