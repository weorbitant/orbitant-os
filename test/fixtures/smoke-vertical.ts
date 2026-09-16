import marketing, { skills, agents, commands, meta } from '../../dist/npm/@orbitant/brain-marketing/dist/index.js';

const _tone: string = skills['orbitant-tone'].content;
const _dir: string = skills['orbitant-tone'].dir;
const _v: string = meta.version;
const _all: string[] = Object.values(marketing.skills).map((s) => s.content);
const _agents = Object.keys(agents);
const _commands = Object.keys(commands);
void [_tone, _dir, _v, _all, _agents, _commands];
