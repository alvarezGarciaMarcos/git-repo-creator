import Command from '@oclif/command';
import { IRepoConfig } from '../configuration/IRepoConfig';
import {IRepo, IRepoBody} from './IRepo'
import {Configuration} from '../configuration/ConfigurationUtils'
import { ConfigurationType } from '../configuration/ConfigurationType';
import axios from 'axios';
import { RepositoryType } from './RepositoryType';
import { RepoResponse } from './RepoUtils';
import { CloneMethod } from '../../base-create';

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

    async doesExist(repoName: string) {
        "https://api.github.com/repos/{owner}/{repo}"
    }

}