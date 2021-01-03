import Command from "@oclif/command";
import axios from "axios";
import { readlink } from "fs-extra";
import { config } from "shelljs";
import { ConfigurationType } from "../configuration/ConfigurationType";
import { Configuration } from "../configuration/ConfigurationUtils";
import { IRepoConfig } from "../configuration/IRepoConfig";
import { IRepo, IRepoBody } from "./IRepo";
import { RepositoryType } from "./RepositoryType";
import { RepoResponse } from "./RepoUtils";

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
        return axios.post(url, body, {headers: headers})
            .then(response => {
                res.httpUrl = response.data["http-url"] 
                res.sshUrl = response.data["ssh-url-to-repo"]
                res.token = configuration.apiKey
                return res

            })
            .catch(error => {
                res.message = this.constructMessage(error.response.data.message)
                return res
            })

    }

    private constructMessage(message: {name: string[], path: string[]}) {
        return `name ${message.name[0]}; path ${message.path[0]}`;
    }

}