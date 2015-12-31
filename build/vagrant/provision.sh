#!/bin/bash

PROJECT_NAME="cloudify-interactive-tutorial"
PROJECT_HOME="`pwd`/$PROJECT_NAME/tutorials/intro"

#need this for machine provisioning.. but not necessarily for local
#     sudo apt-get update -y
#     sudo apt-get install git python-pip -y --fix-missing
#     sudo apt-get install build-essential python-dev unzip  -y

sudo pip install cloudify
git clone https://github.com/cloudify-cosmo/${PROJECT_NAME}.git
cd $PROJECT_NAME
sudo pip install 3rd-parties/butterfly
cd $PROJECT_HOME
curl -L -O https://github.com/cloudify-examples/simple-python-webserver-blueprint/archive/master.tar.gz
tar -xzvf master.tar.gz
cd simple-python-webserver-blueprint-master
nohup butterfly.server.py --unsecure --host=0.0.0.0 --port=8088 --login=False --shell=$PROJECT_HOME/main.py & > /dev/null


export MY_IP=`dig +short myip.opendns.com @resolver1.opendns.com`


echo "========================= FINISHED."
echo "http://$MY_IP"
echo "========================= FINISHED."


