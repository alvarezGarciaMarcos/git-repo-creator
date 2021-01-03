import {Command, flags} from '@oclif/command'
import { Configuration } from './utils/configuration/ConfigurationUtils'
import { prompt } from 'enquirer'
import { IRepoConfig } from './utils/configuration/IRepoConfig'
import Table from 'cli-table'
import { ConfigurationType } from './utils/configuration/ConfigurationType'

interface PromptResponse {
  apiKey: string;
  username: string;
}

export abstract class BaseHub extends Command {
  abstract getType(): ConfigurationType

  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({ char: 'k' }),
    username: flags.string({ char: 'u' }),
    read: flags.boolean(),
    reset: flags.boolean()
  }

  static args = []

  async run() {
    const {args, flags} = this.parse(BaseHub)
    let configuration = await Configuration.getConfigurationByType(this, this.getType())
    if(configuration.apiKey && !flags.reset && !flags.username && !flags.apiKey){
      this.printConfiguration()

    } else if(flags.reset) {
      Configuration.deleteConfiguration(this, this.getType())
      await this.showPrompt()
    } else {
    if (!flags.apiKey && !flags.username && !flags.read && !flags.reset) {
      await this.showPrompt()
    } else {
        let username = flags.username || configuration.username
        let apiKey = flags.apiKey || configuration.apiKey
        let newConf: IRepoConfig = {
            username: username,
            apiKey: apiKey
        }

        await Configuration.saveConfiguration(this, newConf, this.getType())
        this.printConfiguration()
    }
  }

  }

  private async printConfiguration() {
      let conf = await Configuration.getConfigurationByType(this, this.getType())
      let table: Table = new Table()


      table.push( 
        {"Repository provider": this.getType()},
        {"Username": conf.username},
        {"ApiKey": conf.apiKey}
       )

      this.log(table.toString())
  } 

  private async showPrompt(): Promise<PromptResponse> {
      const response: PromptResponse = await prompt([
       {
         type: 'input',
         name: 'username',
         message: `What is your ${this.getType()} username?`,
         required: true
       }, 
       {
         type: 'input',
         name: 'apiKey',
         message: `What is your ${this.getType()} personal authorization token?`,
         required: true
       }, 
      ]);

      let config: IRepoConfig = {
        apiKey: response.apiKey,
        username: response.username
      }

      await Configuration.saveConfiguration(this, config, this.getType())
      await this.printConfiguration()
      return response;

  }

}
