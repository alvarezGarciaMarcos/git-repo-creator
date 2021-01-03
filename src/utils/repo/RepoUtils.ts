import Command from "@oclif/command";
import { ConfigurationType } from "../configuration/ConfigurationType";
import { Configuration } from "../configuration/ConfigurationUtils";
import axios from 'axios'
import {GitlabRepo} from './GitlabRepo'
import {GithubRepo} from './GithubRepo'
import { IRepo, IRepoBody } from "./IRepo";
import {RepositoryType} from './RepositoryType'
import Bitbucket from "../../commands/config/bitbucket";
import { BitbucketRepo } from "./BitbucketRepo";
import { CloneMethod } from "../../base-create";

export enum RepoErrorType {
    NO_CONFIG="no_config",
    CANNOT_CREATE="cannot_create"
}

export class RepoResponse {
    message?: string;
    httpUrl?: string;
    sshUrl?: string;
    repoName?: string;
    token?: string

    constructor(message?: string, httpUrl?: string, sshUrl?: string) {
        this.message = message;
        this.httpUrl = httpUrl;
        this.sshUrl = sshUrl;
    }
}

export interface RepoCreationRequest {
    name: string;
    isPublic: Boolean;
    description?: string;
}

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
            case ConfigurationType.GITHUB:
                return new GithubRepo();
            case ConfigurationType.GITLAB:
                return new GitlabRepo();
            default:
                return new BitbucketRepo();
        }
    }
}