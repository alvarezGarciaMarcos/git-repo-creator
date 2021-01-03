import { IRepoConfig } from "../configuration/IRepoConfig";
import { RepositoryType } from "./RepositoryType";
import { RepoResponse } from "./RepoUtils";

export interface IRepo {
    createRepo(body: IRepoBody, config: IRepoConfig): Promise<RepoResponse>
}

export interface IRepoBody {
    repoName: string;
    description?: string;
    isPublic: Boolean;
    
}