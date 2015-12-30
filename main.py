#!/usr/bin/python

import os
import yaml
import shutil
import atexit
import socket
import subprocess
import re


class Data:
    my_path = os.path.realpath(__file__)
    my_dir = os.path.dirname(my_path)
    port = None

    def __init__(self):
        pass


data = Data()


# http://stackoverflow.com/questions/1365265/on-localhost-how-to-pick-a-free-port-number
def get_free_port():
    sock = socket.socket()
    sock.bind(('', 0))
    result = sock.getsockname()[1]
    sock.close()
    return result


def get_workspace_folder():
    return os.path.join( data.my_dir, 'dev', 'workspace', 'blueprint_' + str(data.port))


def create_workspace_folder():
    # setup a new workspace for this user with the new port
    cwd = os.getcwd()
    new_cwd = get_workspace_folder()
    shutil.copytree(cwd, new_cwd)
    os.chdir(new_cwd)


def delete_workspace_folder():
    path = get_workspace_folder()
    if os.path.isdir(path):
        shutil.rmtree(path)


# http://stackoverflow.com/questions/14907766/kill-program-listening-to-a-given-port
def kill_process_by_port():

    ports = [str(data.port)]

    popen = subprocess.Popen(['netstat', '-lpn'],
                             shell=False,
                             stdout=subprocess.PIPE)
    (output, err) = popen.communicate()

    pattern = "^tcp.*((?:{0})).* (?P<pid>[0-9]*)/.*$"
    pattern = pattern.format(')|(?:'.join(ports))
    prog = re.compile(pattern)
    for line in output.split('\n'):
        match = re.match(prog, line)
        if match:
            pid = match.group('pid')
            subprocess.Popen(['kill', '-9', pid])



def main():

    config_stream = open( data.my_dir + '/config.yaml', 'r')
    config = yaml.load(config_stream)

    data.port = get_free_port()

    # change base dir to be with blueprint
    if config['base_dir'] != '__base_dir__':
        os.chdir(config['base_dir'])
    else:
        ''' go to default location '''
        os.chdir('dev/my_blueprint')

    create_workspace_folder( )

    user_input='start'
    steps = config['steps']

    for step in steps:
        step['command'] = step['command'].replace('__port__',str( data.port ))
        print '\033[92m' + step['intro'].format('\033[94m' + step['command'] + '\033[0m \033[92m') + '\033[0m'
        while str(user_input.strip()) !=  str(step['command'].strip()):

            user_input = raw_input('cfy>')
            os.system(user_input)

def cleanup():
    kill_process_by_port()
    delete_workspace_folder()


try:
    main()
except KeyboardInterrupt:
    cleanup()


atexit.register(cleanup)
# print 'hello ' + console_output


