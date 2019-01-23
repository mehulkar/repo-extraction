# Extract Ember Addon

A way to extract ember addons from existing Ember apps and maintaining source control history.

## Instructions

```bash
npm run extract -- --source [path/to/ember-app/] --component [name of component]
```

### Example

```bash
npm run extract -- --source ../tmp-extraction-playground/test-app --component foo-bar
```

## Options

1. `--source` (required)

    The path to the source Ember app. Relative or absolute path is ok.

2. `--component` (required)

    The name of the component to extract out of the `source` app.

3. `--addon-name` (optional)

    The name of the new package to create. (Will be used with `ember addon <addon-name>`).
    Defaults to `component` argument suffexied with `-addon` (e.g. `foo-bar-addon`).
