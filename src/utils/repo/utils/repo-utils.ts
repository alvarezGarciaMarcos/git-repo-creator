import Command from "@oclif/command";
import { ConfigurationType } from "../../configuration/config";
import { Configuration } from "../../configuration/configuration-utils";
import {GitlabRepo} from '../impl/gitlab-repo'
import {GithubRepo} from '../impl/github-repo'
import { IRepo, IRepoBody, RepoCreationRequest, RepoResponse } from "../repo";
import { BitbucketRepo } from "../impl/bitbucket-repo";


export class RepoUtils {
    static async createRepo(request: RepoCreationRequest, type: ConfigurationType, ctx: Command): Promise<RepoResponse>{
        
        let config = await Configuration.getConfigurationByType(ctx, type)

        let repo = this.getRepo(type)
        let response: RepoResponse = {}
        if(config.username && config.apiKey){
            let b: IRepoBody = {
                repoName : request.name,
                isPublic : request.isPublic,
                description: request.description,
            }
            let repoUrl: RepoResponse = await repo.createRepo(b, config)
            repoUrl.repoName = request.name
            return repoUrl;
        } else {
            response.message = "You have to setup your account"
            return response
        }
        

    }

    static getRepo(type: ConfigurationType): IRepo {
        switch(type) {
            case "Github":
                return new GithubRepo();
            case "Gitlab":
                return new GitlabRepo();
            default:
                return new BitbucketRepo();
        }
    }
}