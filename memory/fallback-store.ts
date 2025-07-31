/** Fallback memory store for MCP server */
/** Provides basic memory functionality when persistent storage is unavailable */

// =============================================================================
// FALLBACK STORE TYPES
// =============================================================================

/** Store operation result */
export interface StoreResult {
  success: boolean;
  error?: string;
  key?: string;
  deleted?: number;
  contextId?: string;
  itemCount?: number;
  message?: string;
}

/** Retrieve operation result */
export interface RetrieveResult {
  success: boolean;
  error?: string;
  value?: unknown;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/** List operation result */
export interface ListResult {
  success: boolean;
  error?: string;
  keys?: string[];
}

/** Context operation result */
export interface ContextResult {
  success: boolean;
  error?: string;
  context?: ContextItem[];
}

/** Stats operation result */
export interface StatsResult {
  success: boolean;
  error?: string;
  stats?: {
    memoryEntries: number;
    contexts: number;
    totalSize: number;
  };
}

/** Store entry */
export interface StoreEntry {
  value: unknown;
  timestamp: number;
  ttl: number | null;
  metadata: Record<string, unknown>;
}

/** Store options */
export interface StoreOptions {
  ttl?: number | null;
  metadata?: Record<string, unknown>;
}

/** Context item */
export interface ContextItem {
  timestamp: number;
  [key: string]: unknown;
}

/** Memory store interface */
export interface MemoryStore {
  initialize(): Promise<StoreResult>;
  store(key: string, value: unknown, options?: StoreOptions): Promise<StoreResult>;
  retrieve(key: string): Promise<RetrieveResult>;
  list(pattern?: string): Promise<ListResult>;
  delete(key: string): Promise<StoreResult>;
  clear(): Promise<StoreResult>;
  getContext(contextId: string): Promise<ContextResult>;
  addToContext(contextId: string, item: ContextItem): Promise<StoreResult>;
  getStats(): Promise<StatsResult>;
}

// =============================================================================
// FALLBACK STORE IMPLEMENTATION
// =============================================================================

/** In-memory fallback store implementation */
export class FallbackStore implements MemoryStore {
  private memory: Map<string, StoreEntry>;
  private contexts: Map<string, ContextItem[]>;
  private initialized: boolean;

  constructor() {
    this.memory = new Map<string, StoreEntry>()
    this.contexts = new Map<string, ContextItem[]>()
    this.initialized = false;
  }

  /** Initialize the fallback store
   * @returns Initialization result
   */

  async initialize(): Promise<StoreResult> {
    this.initialized = true;
    return { success: true, message: 'Fallback store initialized' };
  }

  /** Store a key-value pair
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Storage options
   * @returns Store operation result
   */

  async store(key: string, value: unknown, options: StoreOptions = {}): Promise<StoreResult> {
    try {
      const entry: StoreEntry = {
        value: value,
        timestamp: Date.now(),
        ttl: options.ttl ?? null,
        metadata: options.metadata ?? {}
      };
      this.memory.set(key, entry)
      return { success: true, key };
    } catch(error) {
      console.error('Fallback store error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** Retrieve a value by key
   * @param key - Storage key
   * @returns Retrieve operation result
   */

  async retrieve(key: string): Promise<RetrieveResult> {
    try {
      const entry = this.memory.get(key)
      if (!entry) {
        return { success: false, error: 'Key not found' };
      }

      // Check TTL expiration
      if (entry.ttl && entry.timestamp + entry.ttl < Date.now()) {
        this.memory.delete(key)
        return { success: false, error: 'Key expired' };
      }

      return {
        success: true,
        value: entry.value,
        metadata: entry.metadata,
        timestamp: new Date(entry.timestamp).toISOString()
      };
    } catch(error) {
      console.error('Fallback retrieve error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** List keys matching pattern
   * @param pattern - Optional pattern to match
   * @returns List operation result
   */

  async list(pattern?: string): Promise<ListResult> {
    try {
      let keys = Array.from(this.memory.keys())
      
      if (pattern) {
        const regex = new RegExp(pattern)
        keys = keys.filter(key => regex.test(key))
      }

      return { success: true, keys };
    } catch(error) {
      console.error('Fallback list error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** Delete a key 
   * @param key - Storage key
   * @returns Store operation result
   */

  async delete(key: string): Promise<StoreResult> {
    try {
      const existed = this.memory.has(key)
      if (existed) {
        this.memory.delete(key)
        return { success: true, key, deleted: 1 };
      } else {
        return { success: false, error: 'Key not found' };
      }
    } catch(error) {
      console.error('Fallback delete error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** Clear all stored data 
   * @returns Store operation result
   */


  async clear(): Promise<StoreResult> {
    try {
      const count = this.memory.size;
      this.memory.clear()
      this.contexts.clear()
      return { success: true, deleted: count, message: 'All data cleared' };
    } catch(error) {
      console.error('Fallback clear error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** Get context items 
   * @param contextId - Context identifier
   * @returns Context operation result
   */


  async getContext(contextId: string): Promise<ContextResult> {
    try {
      const context = this.contexts.get(contextId) || [];
      return { success: true, context };
    } catch(error) {
      console.error('Fallback getContext error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** Add item to context 
   * @param contextId - Context identifier
   * @param item - Context item to add
   * @returns Store operation result
   */


  async addToContext(contextId: string, item: ContextItem): Promise<StoreResult> {
    try {
      const context = this.contexts.get(contextId) || [];
      context.push({ ...item, timestamp: Date.now() })
      this.contexts.set(contextId, context)
      return { success: true, contextId, itemCount: context.length };
    } catch(error) {
      console.error('Fallback addToContext error:', error)
      return { success: false, error: (error as Error).message };
    }
  }

  /** Get storage statistics 
   * @returns Stats operation result
   */


  async getStats(): Promise<StatsResult> {
    try {
      const stats = {
        memoryEntries: this.memory.size,
        contexts: this.contexts.size,
        totalSize: Array.from(this.contexts.values()).reduce((sum, items) => sum + items.length, 0)
      };
      return { success: true, stats };
    } catch(error) {
      console.error('Fallback getStats error:', error)
      return { success: false, error: (error as Error).message };
    }
  }
}

export default FallbackStore;