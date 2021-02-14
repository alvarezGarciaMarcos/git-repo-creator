import { Command, flags } from '@oclif/command'
import { ConfigurationType } from './utils/configuration/config'
import { RepoResponse } from './utils/repo/repo'
import { prompt } from 'enquirer'
import * as shell from 'shelljs'
import { RepoUtils } from './utils/repo/utils/repo-utils'

interface PromptResponse {
  isCustomDescription: Boolean
}

export type CloneMethod =
  | "ssh"
  | "https"

export abstract class BaseCreate extends Command {
  static description = 'Create a new remote repository'
  static args = [
    { name: 'repoName', required: true }
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    public: flags.boolean({ char: 'p', description: "Change the visibility of the repository to 'public'" }),
    noClone: flags.boolean({ name: 'no-clone', description: "Do not clone/add remote of the new repository", default: false }),
    ssh: flags.boolean({ description: "Clone using ssh", exclusive: ["noClone", "http"] }),
    http: flags.boolean({ description: "Clone using http", exclusive: ["noClone", "ssh"] })
  }

  async run() {
    const { args, flags } = this.parse(BaseCreate)
    let name = args.repoName
    let isPublic: Boolean = flags.public || this.isDefaultPublic()
    let description = await this._showDescriptionPrompt()
    let response = await RepoUtils.createRepo({ name, isPublic, description }, this.getType, this)


    if (!response.message) {
      let isThereAGitRepo = await this._isThereARepoCreated()
      if (isThereAGitRepo) {
        let addRemote = await this._askAddRemote(flags.noClone);
        if (addRemote) {
          let cloningMethod = await this._showSshPrompt(flags.ssh, flags.http)
          let url: string = cloningMethod == "https" ? response.httpUrl! : response.sshUrl!
          await this._addRemote(url, flags.noClone)
          this.log("Your repo is ready and the origin has been set!!")
        } else {
          this.log("Your repository is ready!!")
        }
      } else {
        let clone = this._askCloning(flags.noClone)
        if (clone) {
          await this._cloneRepo(response, flags.ssh, flags.http, this)
        }
        this.log("Your repository is ready!!")
      }
    }
  }

  async _showDescriptionPrompt(): Promise<string> {
    let isDefaultDescription: PromptResponse = await prompt([
      {
        type: 'confirm',
        name: 'isCustomDescription',
        message: `Do you want to add a description?`,
        required: true
      },
    ]);

    if (isDefaultDescription.isCustomDescription) {
      let isDefaultDescription: { description: string } = await prompt([
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


  async _showSshPrompt(ssh: Boolean, http: Boolean): Promise<CloneMethod> {
    if (ssh)
      return "ssh"
    if (http)
      return "https"

    let cloneMethod: { cloneMethod: CloneMethod } = await prompt([
      {
        type: 'select',
        name: 'cloneMethod',
        message: `How do you want your repository?`,
        required: true,
        initial: 0,
        choices: [
          { name: "ssh", message: "ssh", value: "ssh" },
          { name: "https", message: "https", value: "https" },
        ]

      },
    ]);

    return cloneMethod.cloneMethod

  }

  async _cloneRepo(repoResponse: RepoResponse, ssh: Boolean, http: Boolean, ctx: Command) {
    if (await this._askCloning) {
      let cloningMethod: CloneMethod = await this._showSshPrompt(ssh, http)
      let url: string = ''

      switch (cloningMethod) {
        case "https":
          url = repoResponse.httpUrl!
          break;
        default:
          url = repoResponse.sshUrl!
          break;
      }

      if (shell.which('git')) {
        if (shell.exec(`git clone ${url} ${repoResponse.repoName}`).code !== 0) {
          this.log("Your repository has been created, but the cloning process has failed. Please try to clone it manually")
          this.log(`This is the url of the new repo: ${url}`)
        }

      } else {
        ctx.log("Sorry, this script needs git")
      }
    }
  }

  async _askCloning(noClone: Boolean): Promise<Boolean> {
    if (noClone)
      return false
    return true

  }

  async _askAddRemote(noClone: Boolean): Promise<Boolean> {
    if (noClone)
      return false
    return true

  }
  _isThereARepoCreated(): Boolean {
    if (shell.test('-e', ".git"))
      return true;
    else
      return false;
  }

  async _addRemote(url: string, noClone: Boolean) {
    if (noClone)
      return
    if (shell.exec(`git remote add origin ${url}`).code !== 0) {
      shell.exec("git remote remove origin")
      shell.exec(`git remote add origin ${url}`)
    }
  }


  abstract getType: ConfigurationType
  abstract isDefaultPublic(): Boolean

}
