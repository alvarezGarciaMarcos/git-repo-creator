import * as path from 'path'
import * as fs from 'fs-extra'
import Command from '@oclif/command';
import { IRepoConfig } from './config';
import { ConfigurationType } from './config';

interface AppConfiguration {
    github: IRepoConfig;
    gitlab: IRepoConfig;
    bitbucket: IRepoConfig;
}

export class Configuration {

    static async deleteConfiguration(ctx: Command, type: ConfigurationType){
        let emptyConfig: AppConfiguration = this.getBaseConfig()
        await this.saveConfiguration(ctx, emptyConfig.gitlab, type);
    
    }
    static async saveConfiguration(ctx: Command, config: IRepoConfig, type: ConfigurationType) {
        let configuration: AppConfiguration = await this.getConfiguration(ctx)
        let newConfiguration: IRepoConfig = config
        switch(type) {
            case "Github":
                configuration.github = newConfiguration
                break;
            case "Gitlab":
                configuration.gitlab = newConfiguration
                break;
            default:
                configuration.bitbucket = newConfiguration
                break;
        }
        this.writeConfiguration(ctx, configuration)
        
    }

    private static async writeConfiguration(ctx: Command, configuration: AppConfiguration) {
        let filePath = path.join(ctx.config.configDir, 'config.json')
        fs.writeFile(filePath, JSON.stringify(configuration)) 
    }

    static async getGithubConfiguration(ctx: Command): Promise< IRepoConfig> {
        let configuration = await this.getConfiguration(ctx);
        return configuration.github;
    }

    static async getGitlabConfiguration(ctx: Command): Promise<IRepoConfig> {
        let configuration = await this.getConfiguration(ctx);
        return configuration['gitlab'];
    }

    static async getBitbucketConfiguration(ctx: Command): Promise<IRepoConfig> {
        let configuration = await this.getConfiguration(ctx);
        return configuration['bitbucket'];
    }
    static async getConfiguration(ctx: Command): Promise<AppConfiguration> {
        let filePath = path.join(ctx.config.configDir, 'config.json')
        let userConfig: Promise<AppConfiguration>

        if(await fs.pathExists(filePath)) {
            userConfig = await fs.readJSON(filePath)

        } else {
            // Config file not created, let's create it
            let baseConfig = this.getBaseConfig()
            await fs.createFile(filePath)
            await fs.writeFile(filePath, JSON.stringify(baseConfig))
            
            // We read the created configuration
            userConfig = await fs.readJSON(filePath)
        }
    return userConfig;
    }

    static async getConfigurationByType(ctx: Command, type: ConfigurationType): Promise<IRepoConfig> {
        let configuration: AppConfiguration = await this.getConfiguration(ctx)
        switch(type) {
            case "Github":
                return configuration.github 
            case "Gitlab":
                return configuration.gitlab
            default:
                return configuration.bitbucket 
        } 
    }

    private static getBaseConfig(): AppConfiguration {
        return {
            github: {
                apiKey: undefined,
                username: undefined
            },
            gitlab: {
                apiKey: undefined,
                username: undefined
            },
            bitbucket: {
                apiKey: undefined,
                username: undefined
            }
        }
    }
}