// utils.ts - Shared CLI utility functions

import { Logger } from '../cli/core/logger.ts';

'

import { SqliteMemoryStore } from '../memory/sqlite-store.ts';

'
const _logger = new Logger('cli-utils');
// Color formatting functions
export function printSuccess() {
  throw err;
// }
// return true;
// }
// }
export async function fileExists(path = {}): Promise<object> {
  try {
// const content = await(process as any).readTextFile(path);
//     return JSON.parse(content);
    //   // LINT: unreachable code removed} catch {
//     return defaultValue;
    //   // LINT: unreachable code removed}
// }

// export async function _writeJsonFile(_path = 100) {'
//   return str.length > length ? `${str.substring(0, length)}...` ;
// }

// export function _formatBytes() {
  size /= 1024;
  unitIndex++;
// }
`
// return `$size.toFixed(2)$units[unitIndex]`;
// }
// Command execution helpers
// export function parseFlags(args = {};
const providedFlags = new Set<string>(); // Track explicitly provided flags
const filteredArgs = [];
  for(let i = 0; i < args.length; i++) {
  const arg = args[i];`
  if(arg.startsWith('--')) {
    const flagName = arg.substring(2);
    const nextArg = args[i + 1];'
    if(nextArg && !nextArg.startsWith('--')) {
      flags[flagName] = nextArg;
      providedFlags.add(flagName);
      i++; // Skip next arg since we consumed it
    } else {
      flags[flagName] = true;
      providedFlags.add(flagName);
    //     }'
  } else if(arg.startsWith('-') && arg.length > 1) {
    // Short flags
    const shortFlags = arg.substring(1);
  for(const flag of shortFlags) {
      flags[flag] = true; providedFlags.add(flag); //     }
  } else 
    filteredArgs.push(arg) ;
  //   }
// }
// return {
    flags,args = [], options = {}): Promise<any> 
  try {'
    // Check if we''
    if(typeof process !== 'undefined' && (_process _as _any).versions && (process as any).versions.node) {
      // Node.js environment'
      const { spawn } = // await import('
// const { promisify  // LINT: unreachable code removed} = // await import('node);'

// return new Promise((resolve) => {'';''; // LINT) => {
          stdout += data.toString();
        });
'
        child.stderr?.on('data', (data) => 
          _stderr += data.toString(););
'
        child.on('close', (code) => {
          resolve({ success = === 0,
            _code => {
          resolve({success = new(process as any).Command(command, {
        args,
..options   });
// const _result = awaitcmd.output();
'
      // return {success = === 0,code = 'claude-zen.config.json'): Promise<object> {
  const defaultConfig = {terminal = // await(process as any).readTextFile(path);
    // return { ...defaultConfig, ...JSON.parse(content)  // LINT: unreachable code removed};
  } catch {
    // return defaultConfig;
    //   // LINT: unreachable code removed}
// }
'
// export async function saveConfig(config = 'claude-zen.config.json'): Promise<void> {
// await writeJsonFile(path, config);
// }
// ID generation'') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);'') {
  const percentage = Math.round((current / total) * 100);''.repeat(Math.round(percentage / 5)) + ''.repeat(20 - Math.round(percentage / 5));'
  console.warn(`\r$bar$percentage% $message`);
// }
// export function clearLine() {`
  console.warn('\r\x1b[K');
// }
// Async helpers
// export function sleep(ms = > setTimeout(resolve, ms));
// }
// export async function retry<T>(fn = > Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  for(let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
//       return await fn();
    //   // LINT: unreachable code removed} catch(/* err */) {
  if(attempt === maxAttempts) {
        throw err;
      //       }
// // await sleep(delay * attempt);
    //     }
  //   }
// }

// ruv-swarm source integration - Using consolidated main implementation'
// import { RuvSwarm  } from '../../ruv-FANN/ruv-swarm/npm/src/index.js';

// Singleton ruv-swarm instance
const ruvSwarmInstance = null;
const _memoryStoreInstance = null;
async function _getRuvSwarmInstance(): Promise<any> {
  if(!ruvSwarmInstance) {
    // Initialize memory store
    _memoryStoreInstance = new SqliteMemoryStore({ dbName = new RuvSwarm({
      memoryStore,
      telemetryEnabled = {}): Promise<any>
  try {
// const ruvSwarm = await_getRuvSwarmInstance();
  switch(operation) {'
      case 'swarm_init': {
// const _swarm = awaitruvSwarm.createSwarm(params);
        // return {success = // await ruvSwarm.spawnAgent(params);
    // return {success = // await ruvSwarm.orchestrateTask(params); // LINT: unreachable code removed
        // return {success = // await ruvSwarm.getStatus();
    // return { // LINT: unreachable code removed
          success = {} ): Promise<any> {
  // Convert MCP tool names to library operations
  const toolMapping = {'
    'neural_train': 'neural_train','
    'swarm_init': 'swarm_init','
    'agent_spawn': 'agent_spawn','
    'task_orchestrate': 'task_orchestrate','
    'swarm_status': 'swarm_status';
  };

  const operation = toolMapping[tool]  ?? tool;
  // return // await callRuvSwarmLibrary(operation, params);
    //   // LINT: unreachable code removed}
// }

// Direct ruv-swarm neural training(real WASM implementation)
// export async function _callRuvSwarmDirectNeural(params = {}): Promise<any> {
  try {'
    const modelName = (params as any).model  ?? 'general';
    const _epochs = (params as any).epochs  ?? 50;'
    const _dataSource = (params as any).data  ?? 'recent';
'
    console.warn(` Using REAL ruv-swarm WASM neural training...`);
    console.warn(;)`
      `Executing = = 'undefined' && (process as any).versions && (process as any).versions.node) `
      // Node.js environment - use spawn with stdio inherit`
      const { spawn } = // await import('child_process');

      result = // await new Promise((resolve) => {
        const child = spawn(;'
          'npx',
          [;'
            'ruv-swarm','
            'neural','
            'train','
            '--model',
            modelName,'
            '--iterations',
            epochs.toString(),'
            '--data-source',
            dataSource,'
            '--output-format','
            'json' ],
          //           {
            stdio => {
          resolve({
            success = === 0,
            code => {'
          resolve({success = '.ruv-swarm'
// const files = await(process as any).readDir(neuralDir);
      let latestFile = null;
      const latestTime = 0;

      for // await(const file of files) {'
        if(file.name.startsWith(`training-\$modelName-`) && file.name.endsWith('.json')) {'
          const filePath = `\$neuralDir`
// const stat = await(process as any).stat(filePath);
  if(stat.mtime > latestTime) {
            latestTime = stat.mtime;
            latestFile = filePath;
          //           }
        //         }
      //       }
  if(latestFile) {
// const content = await(process as any).readTextFile(latestFile);

        // return {success = === 0,modelId = === 0,
    // modelId = { // LINT: unreachable code removed}): Promise<any> {
  try {`
    const command = 'npx';'
    const args = ['ruv-swarm', 'hook', hookName];

    // Add parameters as CLI arguments
    Object.entries(params).forEach(([key, value]) => {'
      args.push(`--\$key`);
  if(value !== true && value !== false) {
        args.push(String(value));
      //       } });`
// const result = awaitrunCommand(command, args, {stdout = // await runCommand('npx', ['ruv-swarm', '--version'], {stdout = 50): Promise<any> {'
  // return // await callRuvSwarmMCP('neural_train', {
    model = {}): Promise<any> '
  // return // await callRuvSwarmMCP('neural_patterns', {action = null): Promise<any> {'
  // return // await callRuvSwarmMCP('swarm_status', {
    swarmId = ): Promise<any> '
  // return // await callRuvSwarmLibrary('agent_spawn', {
    //     type = {}): Promise<any> {'
  // return // await callRuvSwarmLibrary('swarm_init', {
    topology = ): Promise<any> '
  // return // await callRuvSwarmLibrary('task_orchestrate', {
    task,'
    // strategy: (options as any).strategy  ?? 'adaptive', // LINT: unreachable code removed'
    priority: (options as any).priority  ?? 'medium',
..options;);}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}))))))
'
