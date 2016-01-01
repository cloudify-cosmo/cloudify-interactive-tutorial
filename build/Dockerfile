FROM centos:latest
MAINTAINER Gigaspaces, cosmo-admin@gigaspaces.com

ENV PROJECT_NAME="cloudify-interactive-tutorial"
ENV PROJECT_HOME="/${PROJECT_NAME}/tutorials/intro" \
    BRANCH="master"

RUN yum update -y && \
   curl --silent --show-error --retry 5 https://bootstrap.pypa.io/get-pip.py | python
RUN yum install gcc python-devel libffi-devel openssl-devel -y && \
   pip install cloudify
RUN curl -L https://github.com/cloudify-cosmo/${PROJECT_NAME}/archive/${BRANCH}.tar.gz -o /tmp/project && tar -xzvf /tmp/project && \
   mv ${PROJECT_NAME}-${BRANCH} ${PROJECT_NAME} && cd ${PROJECT_NAME} && \
   pip install 3rd-parties/butterfly && \
   cd $PROJECT_HOME && \
   curl -L https://github.com/cloudify-examples/simple-python-webserver-blueprint/archive/${BRANCH}.tar.gz -o /tmp/blueprint && tar -xzvf /tmp/blueprint && \
   rm /tmp/*;
   # yum remove -y gcc python-devel libffi-devel openssl-devel


EXPOSE 8088/tcp 35000-39000

WORKDIR ${PROJECT_HOME}/simple-python-webserver-blueprint-${BRANCH}
CMD butterfly.server.py --unsecure --host=0.0.0.0 --port=8088 --login=False --shell=$PROJECT_HOME/main.py