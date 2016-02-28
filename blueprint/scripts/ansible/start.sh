#!/bin/bash -e 


function install_python_package_if_needed() {
    package_name=$1

    ctx logger info "Installing ${package_name}..."

    set -e
    if ! type ${package_name} > /dev/null; then
        pip install ${package_name}
        ctx logger info "Installed ${package_name}"
    fi
    set +e
}

function install_ansible() {
    install_python_package_if_needed 'ansible'
}

function install_repex() {
    install_python_package_if_needed 'repex'
}

function manipulate_playbook() {
    # We need this manipulation because both Ansible and Cloudify use double curly braces to pass variables
    # This function will replace "Place holders" with the variables intended to Ansible
    rpx repl -p $PLAYBOOK_PATH -r 'ansible_veriable_sys_update' -w 'echo "{{ sys_update }}"'
    rpx repl -p $PLAYBOOK_PATH -r 'ansible_veriable_deploy' -w 'echo "{{ deploy }}"'
    rpx repl -p $PLAYBOOK_PATH -r ansible_items -w "{{ item }}"
    rpx repl -p $PLAYBOOK_PATH -r butterfly_pid_stdout -w {{butterfly_PID.stdout}}
    rpx repl -p $PLAYBOOK_PATH -r ansible_host_external_ip -w {{ext_ip.stdout}}
}


function main() {

    ANSIBLE_DIRECTORY="/tmp/$(ctx execution-id)/ansible"
    PLAYBOOK_FILENAME="main.yaml"
    # This is currently hardcoded but should be a property in the blueprint
    PLAYBOOK_PATH="${ANSIBLE_DIRECTORY}/${PLAYBOOK_FILENAME}"

    TEMP_CONF_PATH="$(ctx download-resource-and-render resources/ansible.cfg)"
    TEMP_VAR_PATH="$(ctx download-resource-and-render resources/default.yml)"
    TEMP_PLAYBOOK="$(ctx download-resource-and-render resources/${PLAYBOOK_FILENAME})"
    ANSIBLE_INVENTORY_FILE="$(ctx download-resource-and-render resources/inventory)"

    # Setting up Ansible system variable
    export ANSIBLE_CONFIG_PATH=$ANSIBLE_DIRECTORY/ansible.cfg
    ANSIBLE_VAR_PATH="$ANSIBLE_DIRECTORY/default.yml"
    ANSIBLE_INVENTORY_PATH="$ANSIBLE_DIRECTORY/inventory"


    install_ansible
    install_repex

    # I need to confirm this is a must
    ctx instance runtime-properties confpath "${ANSIBLE_CONFIG_PATH}"

    mkdir -p ${ANSIBLE_DIRECTORY}/roles
    cp $TEMP_CONF_PATH $ANSIBLE_CONFIG_PATH
    cp $TEMP_VAR_PATH $ANSIBLE_VAR_PATH

    # Move the Inventory file to the running location
    cp $ANSIBLE_INVENTORY_FILE $ANSIBLE_INVENTORY_PATH
    # We input the host public IP from the blueprint runtime enviorment
    rpx repl -p $ANSIBLE_INVENTORY_PATH -r HOST -w $tutorial_application_host_public_ip
    cp $TEMP_PLAYBOOK $PLAYBOOK_PATH

    manipulate_playbook

    ctx logger info "Running Ansible Playbook..."
    ansible-playbook ${PLAYBOOK_PATH} > ${ANSIBLE_DIRECTORY}/output.log 2>&1
    ctx logger info "Playbook execution complete!"
}

main