import { IRepoConfig } from "../configuration/config";

export interface IRepo {
    createRepo(body: IRepoBody, config: IRepoConfig): Promise<RepoResponse>
}

export interface IRepoBody {
    repoName: string;
    description?: string;
    isPublic: Boolean;
}


export interface RepoCreationRequest {
    name: string;
    isPublic: Boolean;
    description?: string;
}

export interface RepoResponse {
    message?: string;
    httpUrl?: string;
    sshUrl?: string;
    repoName?: string;
    token?: string

}