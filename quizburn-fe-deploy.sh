#!/bin/bash

### Deploy PATH ###
export DEPLOY_PATH=/tmp/quizburn

# test everything:
type aws >/dev/null 2>&1 || { echo >&2 "aws cli tools is not installed. \n For more info: https://aws.amazon.com/cli/ \nAborting."; exit 1; }

# Start here:
rm -rf $DEPLOY_PATH

# clone repository 
echo "Cloning Midburn-Quiz repository to $DEPLOY_PATH"
git clone https://github.com/mtr574/Midburn-QuizGame.git $DEPLOY_PATH
echo ""

# remove files that should not be on 
echo "Removing unnecessary web files"
rm -rf $DEPLOY_PATH/.git
rm -rf $DEPLOY_PATH/.idea
rm -rf $DEPLOY_PATH/quizburn-fe-deploy.sh
echo "Done."
echo "" 

echo "Uploading to S3"
aws s3 sync $DEPLOY_PATH/ s3://burner-games-frontend/
echo "done."
echo ""

echo "Finish deploy. check http://burner-games-frontend"
exit 0;