#!/bin/bash

PROJECT_NAME="cloudify-interactive-tutorial"
PROJECT_HOME="`pwd`/$PROJECT_NAME"

sudo pip install cloudify
git clone https://github.com/cloudify-cosmo/${PROJECT_NAME}.git
cd $PROJECT_NAME
sudo pip install 3rd-parties/butterfly
curl -L -O https://github.com/cloudify-examples/simple-python-webserver-blueprint/archive/master.tar.gz`
untar -xzvf master.tar.gz
butterfly.server.py --unsecure --host=0.0.0.0 --port=8088 --login=False --shell=$PROJECT_HOME/main.py

# if [ ! -e $PROJECT_HOME ];then
#     sudo apt-get update -y
#     sudo apt-get install git python-pip -y --fix-missing
#     sudo apt-get install build-essential python-dev unzip  -y

#     git clone https://github.com/cloudify-cosmo/${PROJECT_NAME}.git

#     sudo pip install cloudify
# else
#     echo "assuming installed"
# fi

# rm -rf my_blueprint # clean
# mkdir my_blueprint
# pushd my_blueprint
#     wget https://github.com/cloudify-examples/simple-python-webserver-blueprint/archive/master.zip
#     unzip master.zip
#     cd simple-python-webserver-blueprint-master
#     export BLUEPRINT_HOMEDIR=`pwd`
#     sed -i.bak s#__base_dir__#$BLUEPRINT_HOMEDIR#g $PROJECT_HOME/config.yaml
# popd

# pushd $PROJECT_HOME

#     mkdir -p dev/workspace

#     pushd 3rd-parties/butterfly
#         sudo pip install .
#     popd

#     nohup butterfly.server.py --unsecure --host=0.0.0.0 --port=8088 --login=False --shell=$PROJECT_HOME/main.py &> /dev/null &


#     pushd static

#         nohup ./server.sh &

#     popd

# popd


export MY_IP=`dig +short myip.opendns.com @resolver1.opendns.com`


echo "========================= FINISHED."
echo "http://$MY_IP"
echo "========================= FINISHED."


