import axios from "axios";
import { IRepoConfig } from "../configuration/IRepoConfig";
import { IRepo, IRepoBody } from "./IRepo";
import { RepositoryType } from "./RepositoryType";
import { RepoResponse } from "./RepoUtils";

interface BitbucketBodyRequest {
    key: string;
    name: string;
    description?: string;
    is_private: Boolean;
}

export class BitbucketRepo implements IRepo {
    async createRepo(b: IRepoBody, config: IRepoConfig): Promise<RepoResponse> {
        let res: RepoResponse = {}
        let url = `https://api.bitbucket.org/2.0/repositories/${config.username}/${b.repoName}`
        let body: BitbucketBodyRequest = {
            "key": "PRJ",
            "name": b.repoName,
            "description": "The description for my cool project.",
            "is_private": true
        }

        if (b.isPublic) {
            body.is_private = false
        }

        return axios.post(url, body, {
            auth: {
                username: config.username!,
                password: config.apiKey!
            }
        })
        .then(response => {
            res.httpUrl = response.data.links.clone[0].href
            res.sshUrl = response.data.links.clone[1].href
            res.token = config.apiKey
            return res
        })
        .catch(error => {
            res.message = error.response.data.error.message 
            return res
        })

    }

}