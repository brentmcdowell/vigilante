import dotenv from 'dotenv';

dotenv.config({ silent: true });

export default {
    github: {
        user: process.env.GITHUB_USERNAME,
        token: process.env.GITHUB_SECRET,
        repo: process.env.GITHUB_REPO,
        owner: process.env.GITHUB_OWNER
    },
    cluster: {
        endpoint: process.env.KUBERNETES_API_ENDPOINT,
        user: process.env.KUBERNETES_USER,
        password: process.env.KUBERNETES_PASSWORD
    }
};