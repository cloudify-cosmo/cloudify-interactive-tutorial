#!/usr/bin/python

import os
import yaml
import shutil


my_path = os.path.realpath(__file__)
my_dir = os.path.dirname(my_path)
config_stream = open( my_dir + '/config.yaml', 'r')
config = yaml.load(config_stream)

port_file = os.path.join( my_dir, 'port')
last_port = int(open(port_file,'r').read())
new_port = last_port + 1
open(port_file,'w').write(str(new_port))


# change base dir to be with blueprint
if config['base_dir'] != '__base_dir__':
    os.chdir(config['base_dir'])
else:
    ''' go to default location '''
    os.chdir('dev/my_blueprint')

# setup a new workspace for this user with the new port
cwd = os.getcwd()
new_cwd = os.path.join(my_dir, 'dev','workspace','blueprint_' + str(new_port))
shutil.copytree(cwd, new_cwd)
os.chdir(new_cwd)

user_input='start'
steps = config['steps']

for step in steps:
    step['command'] = step['command'].replace('__port__',str(new_port))
    print '\033[92m' + step['intro'].format('\033[94m' + step['command'] + '\033[0m \033[92m') + '\033[0m'
    while str(user_input.strip()) !=  str(step['command'].strip()):

        user_input = raw_input('cfy>')
        os.system(user_input)


# print 'hello ' + console_output


