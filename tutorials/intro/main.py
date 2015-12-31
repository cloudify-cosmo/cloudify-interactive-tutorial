#!/usr/bin/python2

import os
import yaml
import shutil
import atexit
import socket
import subprocess
import re
import sys


class Data:
    my_path = os.path.realpath(__file__)
    my_dir = os.path.dirname(my_path)
    port = None

    def __init__(self):
        pass


class Intro:

    # http://stackoverflow.com/questions/1365265/on-localhost-how-to-pick-a-free-port-number
    def get_free_port(self):
        sock = socket.socket()
        sock.bind(('', 0))
        result = sock.getsockname()[1]
        sock.close()
        while int(result) > 39000:
            result = self.get_free_port()
        return result

    # http://stackoverflow.com/questions/14907766/kill-program-listening-to-a-given-port
    def kill_process_by_port(self):

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

    def get_workspace_folder(self):
        return os.path.join(
            data.my_dir, 'workspace', 'blueprint_' + str(data.port))

    def create_workspace_folder(self):
        # setup a new workspace for this user with the new port
        cwd = os.getcwd()
        new_cwd = self.get_workspace_folder()
        shutil.copytree(cwd, new_cwd)
        # os.chdir(os.path.join(
        # new_cwd, 'simple-python-webserver-blueprint-master'))
        os.chdir(new_cwd)

    def delete_workspace_folder(self):
        path = self.get_workspace_folder()
        if os.path.isdir(path):
            shutil.rmtree(path)


class Tutorial:

    def green_print(self, content):
        print '\033[92m' + content + '\033[0m'

    def run_step(self, step):
        user_input = ''
        print '\033[92m\n' + step['intro'].format(
            '\033[94m' + step['command'] + '\033[0m \033[92m') + '\033[0m'
        while str(user_input.strip()) != str(step['command'].strip()):

            user_input = raw_input('cfy $ ')
            if user_input == 'restart':
                os.system('clear')
                main()
            if user_input == 'exit':
                self.green_print('Please come again!')
                sys.exit()
            if step['command'] == 'exit':
                if user_input == 'exit':
                    self.green_print('Please come again!')
                    sys.exit()
                else:
                    continue
            if user_input == 'next':
                os.system('clear')
                break
            if user_input == step['command']:
                os.system(user_input)
                if step.get('summary'):
                    self.green_print('\n' + step['summary'])
                self.green_print('\nEnter "next" to continue...\n')
                user_input = raw_input('cfy $ ')
                if user_input == 'next':
                    os.system('clear')
                    break


def main():

    i = Intro()
    t = Tutorial()

    os.system('clear')
    with open(os.path.join(data.my_dir, 'config.yaml'), 'r') as config_stream:
        config = yaml.load(config_stream)

    # change base dir to be with blueprint
    base_dir = os.path.join(
        data.my_dir, 'simple-python-webserver-blueprint-master')
    os.chdir(base_dir)

    data.port = i.get_free_port()
    i.create_workspace_folder()

    steps = config['steps']

    for step in steps:
        step['command'] = step['command'].replace('__port__', str(data.port))
        t.run_step(step)


def cleanup():
    i = Intro()
    i.kill_process_by_port()
    i.delete_workspace_folder()


data = Data()

try:
    main()
finally:
    cleanup()

# even if the interpreter is shutdown.. cleanup should be done
atexit.register(cleanup)
