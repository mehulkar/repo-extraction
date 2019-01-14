# IN SOURCE REPO
echo "remove all commits for files"
git filter-branch --prune-empty --index-filter 'git rm -r --cached * && git reset $GIT_COMMIT -- file1 file2 file3'

# TODO: run new_parent.rb to remove all merge commits
echo "DO THIS"


# IN NEW ADDON REPO
echo "ADD the SOURCE_REPO path"
git add remote source_repo ../repo1/relative/address

echo "fetch source_repo and merge master branches"
git fetch source_repo && git merge source_repo/master --allow-unrelated-histories
