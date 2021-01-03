import { IRepo } from './i-repo'

export abstract class BaseRepo implements IRepo {
    repoName: string;

    constructor(repoName: string) {
      this.repoName = repoName
    }

    createRepo() {
      let headers = this.getHeaders()
      let body = this.getBody(this.repoName)
      let url = this.getUrl()

      console.log(headers, body, url)
    }

    abstract getHeaders(): Record<string, string>;
    abstract getBody(repoName: string): Record<string, string>;
    abstract getUrl(): string;
}
