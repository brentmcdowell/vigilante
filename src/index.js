

import Github from './modules/github.js';
import Cluster from './modules/cluster.js';

//Check current state every 10 seconds
setInterval(() => {
    Cluster.getInstances()
    .then(Github.diff)
    .then(diff => {
        var cleanup = [], startup = [];

        if(diff.deleted.length) {
            cleanup = Promise.all(diff.deleted.map(id => Cluster.destroy(id)));
        }

        if(diff.created.length) {
            startup = Promise.all(diff.created.map(id => Cluster.init(id)));
        }

        return Promise.all([cleanup, startup]);
    })
    .then(results => {
        console.log('Cleanup: ', results[0]);
        console.log('Startup: ', results[1]);
    })
    .catch(console.log);
}, 1000 * 10 /*60 * 30*/);

//import http from 'http';
/*
Cluster.getInstances()
    .then(console.log)
    .then(() => Cluster.init(1))
    .then(console.log)
    .then(Cluster.getInstances)
    .then(console.log)
    .then(() => Cluster.destroy(1))
    .catch(console.log)
    .then(Cluster.getInstances)
    .then(console.log);
*/