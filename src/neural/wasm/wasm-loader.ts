/**
 * WASM Module Loader - Temporary stub implementation
 * TODO: Implement full WASM loading functionality
 */

export class WasmModuleLoader {
  private loaded = false;

  constructor() {}

  async load(): Promise<void> {
    if (this.loaded) return;
    
    // TODO: Implement actual WASM loading
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async initialize(): Promise<void> {
    await this.load();
  }
}

export default WasmModuleLoader;