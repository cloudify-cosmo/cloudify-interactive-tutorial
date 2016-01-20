#!/bin/bash

# http://stackoverflow.com/questions/3520936/accessing-bash-completions-for-specific-commands-programmatically

_python_argcomplete ()
{
    local IFS='
               ';
    COMPREPLY=($(IFS="$IFS"                   COMP_LINE="$COMP_LINE"                   COMP_POINT="$COMP_POINT"                   _ARGCOMPLETE_COMP_WORDBREAKS="$COMP_WORDBREAKS"                   _ARGCOMPLETE=1                   "$1" 8>&1 9>&2 1>/dev/null 2>/dev/null));
    if [[ $? != 0 ]]; then
        unset COMPREPLY;
    fi
}

CMD=$1

export COMP_WORDS=($CMD)
export COMP_LINE=$CMD
export COMP_POINT=${#COMP_LINE}
export COMP_CWORD=1
_python_argcomplete cfy
echo $COMPREPLY > autocomplete_output
#printf '%s\n' "${COMPREPLY[@]}"
