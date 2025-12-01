import { Octokit } from '@octokit/rest';

// Cliente GitHub API básico
export class GitHubAPI {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.owner = owner;
    this.repo = repo;
  }

  // Leer archivo
  async readFile(path: string): Promise<string> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if ('content' in response.data && 'encoding' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return content;
      }
      throw new Error('Invalid file response');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  // Crear archivo
  async createFile(path: string, content: string, message: string): Promise<void> {
    try {
      const encodedContent = Buffer.from(content).toString('base64');
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: encodedContent,
      });
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }

  // Actualizar archivo
  async updateFile(path: string, content: string, message: string, sha: string): Promise<void> {
    try {
      const encodedContent = Buffer.from(content).toString('base64');
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: encodedContent,
        sha,
      });
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }

  // Borrar archivo
  async deleteFile(path: string, message: string, sha: string): Promise<void> {
    try {
      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        sha,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Listar archivos en directorio
  async listFiles(path: string): Promise<any[]> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
}

