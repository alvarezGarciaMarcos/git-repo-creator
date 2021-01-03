import {Command, flags} from '@oclif/command'
import { ConfigurationType } from './utils/configuration/ConfigurationType'
import { RepoResponse, RepoUtils } from './utils/repo/RepoUtils'
import { prompt} from 'enquirer'
import * as shell from 'shelljs'

interface PromptResponse {
  isCustomDescription: Boolean
}

export enum CloneMethod {
  SSH = "ssh",
  HTTPS = "https"
}

export abstract class BaseCreate extends Command {
  static description = 'Create a new remote repository'
  static args = [
      {name: 'repoName', required: true}
    ]

  static flags = {
    help: flags.help({char: 'h'}),
    public: flags.boolean({char: 'p', description: "Change the visibility of the repository to 'public'"}),
    noClone: flags.boolean({name: 'no-clone', description: "Do not clone/add remote of the new repository", default: false}),
    ssh: flags.boolean({description: "Clone using ssh", exclusive:["noClone", "http"] }),
    http: flags.boolean({description: "Clone using http", exclusive:["noClone", "ssh"]})
  }

  async run() {
    const {args, flags} = this.parse(BaseCreate)
    let name = args.repoName 
    let isPublic: Boolean = flags.public || this.isDefaultPublic()
    let description = await this.showDescriptionPrompt()
    let response = await RepoUtils.createRepo({name, isPublic, description}, this.getType, this)

    if(!response.message) {
      let isThereAGitRepo = await this.isThereARepoCreated()
      if(isThereAGitRepo) {
        let addRemote = await this.askAddRemote(flags.noClone);
        if(addRemote) {
          let cloningMethod = await this.showSshPrompt(flags.ssh, flags.http)
          let url: string = cloningMethod == CloneMethod.HTTPS ? response.httpUrl! : response.sshUrl!
          await this.addRemote(url, flags.noClone)
        }
      } else {
        let clone = this.askCloning(flags.noClone)
        if(clone) {
          let cloningMethod = await this.showSshPrompt(flags.ssh, flags.http)
          let url: string = cloningMethod == CloneMethod.HTTPS ? response.httpUrl! : response.sshUrl!
          await this.cloneRepo(response, flags.ssh, flags.http, this)
        }
      }
        this.log("Your repository is ready!!")
      }

  }

  private async showDescriptionPrompt(): Promise<string> {
    let isDefaultDescription: PromptResponse = await prompt([
      {
        type: 'confirm',
        name: 'isCustomDescription',
        message: `Do you want to add a description?`,
        required: true
      }, 
     ]);
     
     if(isDefaultDescription.isCustomDescription) {
      let isDefaultDescription: {description: string} = await prompt([
        {
          type: 'input',
          name: 'description',
          message: `Description`,
          required: false
        }, 
      ]);
      return isDefaultDescription.description
     }
     return ""
  }

  
  private async showSshPrompt(ssh: Boolean, http: Boolean): Promise<CloneMethod> {
    if(ssh)
      return CloneMethod.SSH
    if(http)
      return CloneMethod.HTTPS

    let cloneMethod: {cloneMethod: CloneMethod} = await prompt([
      {
        type: 'select',
        name: 'cloneMethod',
        message: `How do you want your repository?`,
        required: true,
        initial: 0,
        choices: [
          {name: CloneMethod.SSH, message: CloneMethod.SSH, value: CloneMethod.SSH},
          {name: CloneMethod.HTTPS, message: CloneMethod.HTTPS, value: CloneMethod.HTTPS},
        ]
        
      }, 
     ]);

     return cloneMethod.cloneMethod

  }

  private async cloneRepo(repoResponse: RepoResponse, ssh: Boolean, http: Boolean, ctx: Command) {
    if(await this.askCloning) {
      let cloningMethod: CloneMethod = await this.showSshPrompt(ssh, http)
      let url: string = ''

      switch(cloningMethod) {
        case CloneMethod.HTTPS:
          url = repoResponse.httpUrl!
          break;
        default:
          url = repoResponse.sshUrl!
          break;
      }

      if (shell.which('git')){
        shell.exec(`git clone ${url} ${repoResponse.repoName}`)

      } else {
        ctx.log("Sorry, this script needs git")
      }
    }
  }

  private async askCloning(noClone: Boolean): Promise<Boolean>{
    if(noClone)
      return false
    return true

  }
  
  private async askAddRemote(noClone: Boolean): Promise<Boolean>{
    if(noClone)
      return false
    return true 

  }
  private isThereARepoCreated(): Boolean {
    if(shell.test('-e', ".git"))
      return true;
    else 
      return false;
  }

  private async addRemote(url: string, noClone: Boolean) {
    if(noClone)
      return
    if(shell.exec(`git remote add origin ${url}`).code !== 0){
            shell.exec("git remote remove origin")
            shell.exec(`git remote add origin ${url}`)
    } 
}


  abstract getType: ConfigurationType
  abstract isDefaultPublic(): Boolean

}
