#!/bin/bash

set -e

echo "provision script started"

PROJECT_NAME="cloudify-interactive-tutorial"
CONTENT_NAME="simple-python-webserver-blueprint"
CONTENT_HOME="`pwd`/${CONTENT_NAME}"

#need this for machine provisioning.. but not necessarily for local
sudo apt-get update -y &> /dev/null
sudo apt-get install libffi-dev git python-pip build-essential python-dev unzip -y --fix-missing &> /dev/null

### install nvm
if ! hash nvm 2> /dev/null; then
    ( curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash ) &> /dev/null
    . ~/.nvm/nvm.sh &> /dev/null
else
    echo "nvm already installed"
fi

if ! hash node 2> /dev/null; then
    echo "installing node"
    NODE_VERSION=4.2.1
    ( nvm install ${NODE_VERSION} || nvm use ${NODE_VERSION} ) &> /dev/null
    nvm alias default ${NODE_VERSION}
else
    echo "node already installed"
fi


# install interactive tutorial
echo "installing interactive-tutorial"
npm install -g cloudify-cosmo/${PROJECT_NAME} &> /dev/null

# install cloudify
echo "installing cloudify & butterfly"
if ! hash cfy 2>/dev/null; then
    sudo pip install cloudify &> /dev/null
    activate_cfy_bash_completion
else
    echo "cloudify already installed"
fi

if ! hash butterfly 2>/dev/null; then
    sudo pip install butterfly=2.0.0 &> /dev/null
else
    echo "butterfly already installed"
fi

# install the content (blueprint) to work with
rm -rf ${CONTENT_HOME}
mkdir -p ${CONTENT_HOME}

if [ "$WALKTHROUGH_ROOT" = "" ]; then
    echo "export WALKTHROUGH_ROOT=\"${CONTENT_HOME}\"" >> ~/.bashrc
fi

pushd ${CONTENT_HOME}
    echo "downloading blueprint"
    ( curl -L https://github.com/cloudify-examples/${CONTENT_NAME}/archive/master.tar.gz | tar xz --strip-components=1 ) &> /dev/null
popd

export EXTERNAL_IP=`dig +short myip.opendns.com @resolver1.opendns.com`
echo "export EXTERNAL_IP=\"${EXTERNAL_IP}\"" >> ~/.bashrc

echo "starting butterfly"
MOTD_FILE=`cfy-tutorial motd`
PORT_NUMBER=8088
fuser -k -TERM -n tcp ${PORT_NUMBER} || echo "no port to clean"
nohup butterfly.server.py --unsecure --host=0.0.0.0 --port=${PORT_NUMBER} --motd=${MOTD_FILE} --login=False --shell="cfy-tutorial" & > /dev/null


export MY_IP=`dig +short myip.opendns.com @resolver1.opendns.com`
echo "export EXTERNAL_IP=\"${EXTERNAL_IP}\"" >> ~/.bashrc

echo "========================= FINISHED."
echo "http://${EXTERNAL_IP}:${PORT_NUMBER}"
echo "========================= FINISHED."


