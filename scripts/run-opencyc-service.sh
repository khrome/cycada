#!/bin/sh
if ! screen -list | grep -q "opencyc"; then
    screen -d -m -L -S opencyc ./run-opencyc.sh
    echo "Starting CYC (This will take a few minutes)"
    CYC_RESULT=""
    sleep 5
    while true; do
        if [[ $CYC_RESULT != "" ]]; then
            echo "CYC is running."
            break
        fi
        CYC_RESULT=`tail screenlog.0 | grep "Ready for services."`
        sleep 8
    done
else
    echo "OpenCYC is already running."
fi
