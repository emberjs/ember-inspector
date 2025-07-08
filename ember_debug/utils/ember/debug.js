import { Debug, inspect as emberInspect } from '../ember';

export let inspect = emberInspect;
export let { registerDeprecationHandler } = Debug;
export default Debug;
