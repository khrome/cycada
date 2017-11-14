Cycada
======

CYC 4 queries in node.js on localhost or remote.

Currently experimental

Usage
-----

require the library

    var CycServer = require('cyclops');

make a connection

    var cyc = new CycServer({
        host : '<host>',
        port : <port>
    });

search for a concept

    cyc.concepts('<name>', function(err, results){

    });

perform a query [TBD]

    cyc.infer('<query>', function(err, results){

    });

Enjoy,

-Abbey Hawk Sparrow
