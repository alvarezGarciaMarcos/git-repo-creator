export interface IRepo {
    getBody(repoName: string): Record<string, string>;
    getHeaders(): Record<string, string>;
    getUrl(): string;
}
