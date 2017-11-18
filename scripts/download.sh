#!/bin/sh
curl -L  https://sourceforge.net/projects/opencyc-backups/files/opencyc-4.0/opencyc-4.0-linux.tgz > ../opencyc.tar.gz
cd ..
tar -xvzf opencyc.tar.gz
rm opencyc.tar.gz
cd scripts
