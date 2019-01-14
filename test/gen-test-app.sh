echo "go to target location"
mkdir - ~/dev/ioss/tmp-extraction-playground
cd ~/dev/ioss/tmp-extraction-playground
echo "remove existing test app"
rm -rf test-app || true
echo "generate new app"
ember new test-app && cd test-app
echo "generate component"
ember g component foo-bar
echo "commit component"
git add . && git commit -m "add component"
echo "come back"
cd -
