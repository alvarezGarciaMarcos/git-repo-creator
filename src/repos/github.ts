import { BaseRepo } from './base-repo';

export class Github extends BaseRepo {
    getHeaders(): Record<string, string> {
        return {
            "Authorization": "token"
        }
    }
    getBody(repoName: string): Record<string, string> {
        return {
            "name": repoName
        }
    }
    getUrl(): string {
        return "https://api.github.com/alvarezGarciaMarcos/repos"
    }
}
