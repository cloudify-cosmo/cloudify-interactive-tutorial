# cloudify-interactive-tutorial

## Summary

Deploys Cloudify Interactive tutorial Application using cfy local on AWS.

A bit more detailed explanation:

In Cloudify, you describe applications and their infrastructure in blueprints. Blueprints are files that are supported by scripts and other resources in a single archive. You can also import other code using plugins.

cfy local refers to executing Cloudify blueprints in local mode.

The blueprint in this repository sets up interactive tutorial application on AWS infrastructure. AWS plugin will initiate the instance on Europe West region and the application code will be deployed by Ansible


This blueprint consist of: Keypair, ElasticIP, Security Group and Compute instance. The tutorial application will eventually be hosted on the Compute instance.
Prior to running the blueprint you'll need to make some adjustments to the input file regarding the AWS environment.

### Set up an AWS environment:

You'll need to make some adjustments to the input file to provide your own AWS credentials.
Edit inputs/inputs.yaml and add you access key and secret
You can also change the region, instance type and AMI (AMI must be support hvm)

Now, execute the install workflow for the infrastructure:

For AWS:

```bash
(cfy local init --install-plugins -p tutorial-blueprint.yaml -i inputs/inputs.yaml && cfy local execute -w install --task-retries=9 --task-retry-interval=10)
```


To see the application, you can go to http://[THE APPLICATION URL]:8088/.

To uninstall the application run:
```bash
cfy local execute -w uninstall --task-retries=9 --task-retry-interval=10
```

### Once server is deployed you should consider closing port 22 that was used by Ansible.

## Update Tutorial deployment

Make sure port 22 is open for Ansible to allow the deployment

Run ansible-playbook with the inventory file specified and change the value of "deploy" in default.yml from false to true.

This will update the Tutorial code and skip unneeded installations