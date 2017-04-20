import Kubernetes from 'k8s';
import _ from 'lodash';

import Config from './config';

const LABEL_SOURCE = 'vigilante';
const NS_PREFIX = 'qa-';
const NS_PREFIX_REGEX = new RegExp(`^${NS_PREFIX}`, 'i');

const api = Kubernetes.api({
    endpoint: Config.cluster.endpoint,
    version: '/api/v1',
    strictSSL: false,
    auth: {
        user: Config.cluster.user,
        password: Config.cluster.password
    }
});

export default {
    async getInstances() {
        let response = await api.get('namespaces');

        if(response.kind !== 'NamespaceList') {
            throw new Error('Invalid response from cluster');
        }

        return response.items
        .filter(ns => ns.metadata.name.match(NS_PREFIX_REGEX) && ns.status.phase !== 'Terminating')
        .map(ns => parseInt(ns.metadata.name.replace(NS_PREFIX_REGEX, ''), 10));
    },

    async init(id) {
        let exists = await this.exists(id);
        if(exists) {
            return false;
        }

        let result = await api.post('namespaces', {
            kind: 'Namespace',
            apiVersion: 'v1',
            metadata: {
                name: `${NS_PREFIX}${id}`,
                labels: {
                    name: `${NS_PREFIX}${id}`,
                    source: LABEL_SOURCE
                }
            }
        });
        
        if(result.kind !== 'Namespace') {
            console.log(`Failed to init QA Namespace ${id}: ${result.message}`);

            return false;
        }

        return id;
    },

    async destroy(id) {
        let namespace = await api.get(`namespaces/${NS_PREFIX}${id}`);

        if(namespace.kind !== 'Namespace') {
            console.log(namespace);
            return false;
        }

        if(!namespace.metadata.labels || namespace.metadata.labels.source !== LABEL_SOURCE) {
            console.log(`Cannot destroy QA Namespace ${namespace.metadata.name} - source does not match "${LABEL_SOURCE}"`);

            return false;
        }

        let result = await api.delete(`namespaces/${NS_PREFIX}${id}`);

        if(typeof result !== 'object') {
            result = JSON.parse(result);
        }

        if(result.kind !== 'Namespace' || result.status.phase !== 'Terminating') {
            console.log(`Failed to clean up QA Namespace ${id}: ${result}`);

            return false;
        }

        return id;
    },

    async exists(id) {
        let instances = await this.getInstances();

        return instances.find(value => value == id) ? true : false;
    }
};