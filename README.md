Cycada
======

CYC 4 queries in node.js on localhost or remote.

Currently experimental and slow enough it's not a good choice for client interactive code paths.

Installation
------------

    npm install cycada

Running opencyc 4.0 requires Java already be installed on your system. The OpenCYC binary will be downloaded and unpacked on npm `postinstall` but it will not execute without an existing java install on your system.


Running
-------

To run the CYC service interactively:

    npm run start

To terminate all instances of CYC (in case something gets hung):

    npm run stop

To run CYC as a service (requires [screen](https://www.gnu.org/software/screen/manual/screen.html)):

    npm run service-start

If you need to access the running instance (To Exit: CTRL + a d)

    screen opencyc

Then to stop the service:

    npm run service-stop

Usage
-----

require the library

    var CycServer = require('cycada');

make a connection

    var cyc = new CycServer({
        host : '<host>',
        port : <port>
    });

search for a concept

    cyc.concepts('<name>', function(err, results){
        //do something with the results
    });

perform a query [TBD - I don't currently need it, contact me if you do]

    cyc.infer('<query>', function(err, results){

    });

Roadmap
-------

- Finish inferences
- Investigate supporting [proprietary CYC](http://dev.cyc.com)
- Keystore based caching
- Investigate supporting [UMBEL](https://en.wikipedia.org/wiki/UMBEL)

Enjoy,

-Abbey Hawk Sparrow
