#!/usr/bin/python

import os
import yaml



config_stream = open(os.path.dirname(os.path.realpath(__file__)) + '/config.yaml', 'r')
config = yaml.load(config_stream)

# change base dir to be with blueprint
if config['base_dir'] != '__base_dir__':
    os.chdir(config['base_dir'])


user_input='start'
steps = config['steps']

for step in steps:
    print '\033[92m' + step['intro'].format('\033[94m' + step['command'] + '\033[0m \033[92m') + '\033[0m'
    while str(user_input.strip()) !=  str(step['command'].strip()):

        user_input = raw_input('cfy>')
        os.system(user_input)


# print 'hello ' + console_output


