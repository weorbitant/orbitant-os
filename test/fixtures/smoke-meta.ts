import brain, { marketing } from '@weorbitant/orbitant-os';

const a: string = marketing.meta.version; // named value import must work
const b = brain.operations.meta.name;
void [a, b];
