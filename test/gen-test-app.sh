PLAYGROUND="$HOME/dev/tmp"
APP_NAME="test-app"

FULL_PATH="$PLAYGROUND/$APP_NAME"

echo "> go to $PLAYGROUND"
mkdir -p $PLAYGROUND
cd $PLAYGROUND

echo "> Ensure $FULL_PATH does not exist"
rm -rf "$APP_NAME" || true
echo "> generate new app"
ember new "$APP_NAME" --skip-npm > /dev/null

cd $FULL_PATH

echo "In $PWD"

echo "> Generate component"
echo "import Component from '@glimmer/component';" > app/components/foo.js
echo "export default class Foo extends Component {}" >> app/components/foo.js
echo "<h1>Hi</h1>" > app/components/foo.hbs

echo "> git commit"
git add . > /dev/null
git commit -m "add component"

echo "> come back"
cd - > /dev/null
echo "new app at $PLAYGROUND/$APP_NAME"
