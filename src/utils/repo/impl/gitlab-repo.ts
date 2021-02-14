import axios from "axios";
import { IRepoConfig } from "../../configuration/config";
import { IRepo, IRepoBody } from "../repo";
import { RepoResponse } from "../repo";

interface GitlabBodyRequest {
    name: string;
    visibility: string;
    description?: string;
}

export class GitlabRepo implements IRepo {
    async createRepo(b: IRepoBody, configuration: IRepoConfig): Promise<RepoResponse> {
        let url: string = 'https://gitlab.com/api/v4/projects'

        let headers = {
            "PRIVATE-TOKEN": configuration.apiKey
        }

        let body: GitlabBodyRequest = {
            name: b.repoName,
            visibility: b.isPublic ? 'public' : 'private',
            description: b.description
        }

        let res: RepoResponse = {}
        return axios.post(url, body, { headers: headers })
            .then(response => {
                res.httpUrl = response.data["http_url_to_repo"]
                res.sshUrl = response.data["ssh_url_to_repo"]
                res.token = configuration.apiKey
                return res

            })
            .catch(error => {
                res.message = this._constructMessage(error.response.data.message)
                return res
            })

    }

    _constructMessage(message: { name: string[], path: string[] }) {
        return `name ${message.name[0]}; path ${message.path[0]}`;
    }

}