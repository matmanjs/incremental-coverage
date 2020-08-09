import yaml from 'js-yaml';

export abstract class Stream {
  // 输出的内容
  content: unknown;

  constructor(content: unknown) {
    this.content = content;
  }

  abstract outToStream(): void;

  protected dumpJSON(indent?: number): string {
    return JSON.stringify(this.content, null, indent);
  }

  protected dumpYaml(): string {
    return yaml.safeDump(this.content);
  }
}

export * from './file';
export * from './stdout';
