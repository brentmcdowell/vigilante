import GitHubClient from 'github';
import _ from 'lodash';

import Config from './config.js';

const client = new GitHubClient({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
        'user-agent': 'The-Vigilante'
    },
    Promise: Promise,
    timeout: 5000
});

client.authenticate({
    type: 'basic',
    username: Config.github.user,
    password: Config.github.token
});

export default {
    diff(prIds) {
        return client.pullRequests.getAll({
            owner: Config.github.owner,
            repo: Config.github.repo,
            state: 'open',
            per_page: 100
        })
        .then(openPrs => openPrs.map(pr => parseInt(pr.number)))
        .then(openPrIds => ({
            deleted: _.difference(prIds, openPrIds),
            created: _.difference(openPrIds, prIds)
        }));
    }
}