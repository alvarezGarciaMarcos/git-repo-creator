import { IRepoConfig } from '../../configuration/config';
import { IRepo, IRepoBody } from '../repo'
import axios from 'axios';
import { RepoResponse } from '../repo';

interface GithubBodyRequest {
    name: string;
    private: Boolean;
    description?: string;

}

export class GithubRepo implements IRepo {

    async createRepo(b: IRepoBody, config: IRepoConfig): Promise<RepoResponse> {
        let username = config.username
        let apiKey = config.apiKey

        let url = `https://api.github.com/user/repos`;
        let body: GithubBodyRequest = {
            name: b.repoName,
            private: !b.isPublic,
            description: b.description
        }
        let res: RepoResponse = {}

        return axios.post(url, body, {
            auth: {
                username: username!,
                password: apiKey!
            }
        })
            .then(response => {
                res.sshUrl = response.data["ssh_url"]
                res.httpUrl = response.data["html_url"]
                res.token = apiKey
                return res
            })
            .catch(error => {
                res.message = error.response.data.errors[0].message
                return res
            })

    }
}