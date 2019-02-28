# Extract Ember Addon

A way to extract ember addons from existing Ember apps and maintaining source control history.

## Instructions

```bash
npm run extract -- [--source <path>] [--component <value>] [--addon-name <value>] [--output <path>] [--config <path>]
```

### Example

```bash
npm run extract -- --source ../tmp-extraction-playground/test-app --component foo-bar
```

## Options

1. `--source` (required)

    The path to the source Ember app. Relative or absolute path is ok.

1. `--component` (required)

    The name of the component to extract out of the `source` app.

1. `--output` (required)

    The path to where the new addon should go.

1. `--addon-name` (optional)

    The name of the new package to create. (Will be used with `ember addon <addon-name>`).
    Defaults to `component` argument suffexied with `-addon` (e.g. `foo-bar-addon`).

1. `--config` (optional)

    If provided, the other arguments are ignored. Should be a JSON file with the following structure:

    ```json
    {
      "source": "/some/path",
      "component": "foo-bar",
      "addonName": "my-package-name",
      "output": "/some/path/for/new/addon",
      "additionalFiles": [
        { "name": "file1", "path": "app/sub/file1" },
        { "name": "file2", "path": "app/sub/file2" },
        { "name": "file3", "path": "app/sub/file3" },
        { "name": "file4", "path": "app/sub/file4" }
      ],
      "onlyFiles": [
        { "name": "file1", "path": "app/some/other/file1" },
        { "name": "file2", "path": "app/some/other/file2" },
        { "name": "file3", "path": "app/some/other/file3" },
        { "name": "file4", "path": "app/some/other/file4" }
      ]
    }
    ```

    `additionalFiles` and `onlyFiles` should start with "app/" (a relative path within the
    source directory).

    If `onlyFiles` is provided, `component` and `additionalFiles` will be ignored.
