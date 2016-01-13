#!/usr/bin/python2

import os
import yaml
import shutil
import atexit
import socket
import subprocess
import re
import sys
import shlex


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
                try:
                    subprocess.Popen(['kill', '-9', pid])
                except:
                    pass

    def get_workspace_folder(self):
        return os.path.join(
            data.my_dir, 'workspace', 'blueprint_' + str(data.port))

    def create_workspace_folder(self):
        # setup a new workspace for this user with the new port
        cwd = os.getcwd()
        new_cwd = self.get_workspace_folder()
        shutil.copytree(cwd, new_cwd)
        os.chdir(new_cwd)

    def delete_workspace_folder(self):
        path = self.get_workspace_folder()
        if os.path.isdir(path):
            shutil.rmtree(path)


class Tutorial:
    AVAILABLE_COMMANDS = """
    * next (Continue to the next step)
    * ls (e.g ls -l - list the blueprint's files)
    * cfy (e.g. cfy -h - show Cloudify CLI's help)
    * cat (e.g. cat blueprint.yaml - view the blueprint)
    * clear (Clear the screen and print the current step)
    * restart (Restart the tutorial)
    * exit (Exit the tutorial)
    * commands (Show this command menu)
    """

    def __init__(self):
        self.previous_step_incomplete = False

    def green_print(self, content):
        print '\033[92m' + content + '\033[0m'

    def yellow_print(self, content):
        print '\033[93m' + content + '\033[0m'

    def format_command(self, content):
        return '\033[94m' + content + '\033[92m'

    def step_print(self, s):
        self.green_print(s['intro'].format(self.format_command(s['command'])))

    def run_step(self, step):
        """
        If a command is incomplete, set incomplete.
        for each step, check if incomplete and alert.

        if restart: clear and restart
        if ls or cfy or nothing: run command or do nothing
        if exit: just exit
        if good_command: run it, print summary and next
        if next: if next is the command, go to next step
        elif missing_step: alert and ask if to continue
        else: if not good_command: set missing_step
        """
        def handle_next(user_input, cmd):
            if self.previous_step_incomplete and not cmd == 'next':
                user_input = raw_input(
                    'Note that you have not completed some of the '
                    'previous steps. Continuing means you will not be '
                    'able to complete the tutorial. Would you like to '
                    'continue? (yes/no):')
                if user_input in ('y', 'yes'):
                    os.system('clear')
                    return True
            else:
                os.system('clear')
                return True

        def handle_exit():
            self.green_print('Please come again!')
            sys.exit()

        user_input = ''
        self.step_print(step)
        while str(user_input.strip()) != str(step['command'].strip()):

            step_done = False
            user_input = raw_input('cfy $ ')
            if step['command'] == 'last':
                if user_input == 'restart':
                    os.system('clear')
                    main()
                else:
                    continue

            if user_input == step['command']:
                if self.previous_step_incomplete:
                    # also need to print this if next was executed after
                    # having uncompleted steps
                    self.green_print(
                        'As you have not completed all necessary steps, you '
                        'cannot perform any other steps. If you wish to '
                        'browse through the tutorial, you can still perform '
                        'other actions. You can always `restart` if you wish.')
                    continue
                else:
                    step_done = True
                    if user_input == 'next':
                        os.system('clear')
                        break
                    # this does not take errors into account in any way.
                    # maybe should also block the user from rerunning the same
                    # step twice?
                    os.system(user_input)
                    if step.get('summary'):
                        self.green_print('\n' + step['summary'])
                    self.green_print('\nEnter "next" to continue...\n')
                    user_input = raw_input('cfy $ ')
                    if user_input == 'next':
                        os.system('clear')
                        break
            elif user_input == 'next':
                if step_done:
                    os.system('clear')
                    break
                if not self.previous_step_incomplete:
                    user_input = raw_input(
                        'This will skip a necessary step for completing the '
                        'tutorial. If you choose to continue, you will not be '
                        'able to perform any more steps. Are you sure you '
                        'want to continue? (yes/no):')
                    if user_input in ('y', 'yes'):
                        self.previous_step_incomplete = True
                        os.system('clear')
                        break
                else:
                    os.system('clear')
                    break
            elif user_input.startswith('cat'):
                if user_input.startswith(('cat ..', 'cat /', 'cat ~')):
                    self.green_print('Can only cat files within current '
                                     'directory.')
                else:
                    try:
                        output = subprocess.check_output(
                            shlex.split(user_input))
                        self.yellow_print(output + '\n')
                    except:
                        continue
            elif user_input == 'secret_command_input':
                os.system(step['command'])
            elif user_input.startswith(('ls', 'cfy')):
                os.system(user_input)
            elif user_input == 'clear':
                os.system('clear')
                self.step_print(step)
            elif user_input == 'restart':
                self.previous_step_incomplete = False
                os.system('clear')
                main()
            elif user_input == 'exit':
                handle_exit()
            elif user_input == 'help':
                self.yellow_print(self.AVAILABLE_COMMANDS)


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
