# Extract Ember Addon

A way to extract ember addons from existing Ember apps and maintaining source control history.

## Instructions

```bash
# IN SOURCE REPO
echo "remove all commits for files"
git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- file1 file2 file3'

# TODO: run new_parent.rb to remove all merge commits
git filter-branch -f --prune-empty --parent-filter ./rm_merge_commits.rb master


# IN NEW ADDON REPO
echo "ADD the SOURCE_REPO path"
git add remote source_repo ../repo1/relative/address

echo "fetch source_repo and merge master branches"
git fetch source_repo && git merge source_repo/master --allow-unrelated-histories
```

## TODO

Make this a script that accepts an addon name, a component name, and does everything else automatically.
