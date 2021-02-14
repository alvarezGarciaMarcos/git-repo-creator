export type ConfigurationType =
    |"Github"
    |"Gitlab"
    |"Bitbucket"


export interface IRepoConfig {
    apiKey?: string;
    username?: string;
}