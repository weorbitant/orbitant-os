export interface SkillEntry {
  name: string;
  folder: string;
  description: string;
  version: string;
  tags: string[];
  content: string;
  frontmatter: Record<string, unknown>;
  dir: string;
}

export interface AgentEntry {
  name: string;
  description: string;
  allowedTools?: string;
  content: string;
  frontmatter: Record<string, unknown>;
  path: string;
}

export interface CommandEntry {
  name: string;
  description: string;
  content: string;
  frontmatter: Record<string, unknown>;
  path: string;
}

export interface VerticalMeta {
  name: string;
  version: string;
  vertical: string;
}

export declare const skills: Record<string, SkillEntry>;
export declare const agents: Record<string, AgentEntry>;
export declare const commands: Record<string, CommandEntry>;
export declare const meta: VerticalMeta;

declare const brain: {
  skills: Record<string, SkillEntry>;
  agents: Record<string, AgentEntry>;
  commands: Record<string, CommandEntry>;
  meta: VerticalMeta;
};
export default brain;
