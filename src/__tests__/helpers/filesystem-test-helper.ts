/**
 * File System Test Helper - File System Testing Utilities
 *
 * Comprehensive file system testing support for both mocked and real environments
 */

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, relative, resolve } from 'path';

export interface FileSystemTestHelper {
  createTempDir(prefix?: string): Promise<string>;
  createFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  readFile(path: string): Promise<string>;
  fileExists(path: string): Promise<boolean>;
  deleteFile(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  listFiles(path: string): Promise<string[]>;
  copyFile(src: string, dest: string): Promise<void>;
  moveFile(src: string, dest: string): Promise<void>;
  getFileStats(path: string): Promise<any>;
  watchFile(path: string, callback: (event: string) => void): () => void;
  createSymlink(target: string, link: string): Promise<void>;
  cleanup(): Promise<void>;
}

export class RealFileSystemTestHelper implements FileSystemTestHelper {
  private tempDirs: string[] = [];
  private createdFiles: string[] = [];
  private watchers: Array<() => void> = [];

  async createTempDir(prefix: string = 'test'): Promise<string> {
    const tempPath = join(
      tmpdir(),
      `claude-test-${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}`
    );

    await fs.mkdir(tempPath, { recursive: true });
    this.tempDirs.push(tempPath);
    return tempPath;
  }

  async createFile(path: string, content: string): Promise<void> {
    const dir = dirname(path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path, content, 'utf8');
    this.createdFiles.push(path);
  }

  async createDirectory(path: string): Promise<void> {
    await fs.mkdir(path, { recursive: true });
    this.tempDirs.push(path);
  }

  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf8');
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await fs.unlink(path);
      const index = this.createdFiles.indexOf(path);
      if (index > -1) {
        this.createdFiles.splice(index, 1);
      }
    } catch (error) {
      // File might not exist
    }
  }

  async deleteDirectory(path: string): Promise<void> {
    try {
      await fs.rm(path, { recursive: true, force: true });
      const index = this.tempDirs.indexOf(path);
      if (index > -1) {
        this.tempDirs.splice(index, 1);
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(path, { withFileTypes: true });
      return entries.filter((entry) => entry.isFile()).map((entry) => join(path, entry.name));
    } catch {
      return [];
    }
  }

  async copyFile(src: string, dest: string): Promise<void> {
    const destDir = dirname(dest);
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(src, dest);
    this.createdFiles.push(dest);
  }

  async moveFile(src: string, dest: string): Promise<void> {
    const destDir = dirname(dest);
    await fs.mkdir(destDir, { recursive: true });
    await fs.rename(src, dest);

    const srcIndex = this.createdFiles.indexOf(src);
    if (srcIndex > -1) {
      this.createdFiles[srcIndex] = dest;
    } else {
      this.createdFiles.push(dest);
    }
  }

  async getFileStats(path: string): Promise<any> {
    const stats = await fs.stat(path);
    return {
      size: stats.size,
      mtime: stats.mtime,
      ctime: stats.ctime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      mode: stats.mode,
    };
  }

  watchFile(path: string, callback: (event: string) => void): () => void {
    let watcher: any = null;

    const startWatching = async () => {
      try {
        const { watch } = await import('chokidar');
        watcher = watch(path);
        watcher.on('all', (event: string) => callback(event));
      } catch {
        // Fallback to basic fs.watch if chokidar not available
        try {
          watcher = fs.watch(path, (event) => callback(event));
        } catch {
          // File watching not available
        }
      }
    };

    startWatching();

    const stopWatching = () => {
      if (watcher) {
        if (typeof watcher.close === 'function') {
          watcher.close();
        } else if (typeof watcher.unwatch === 'function') {
          watcher.unwatch(path);
        }
      }
    };

    this.watchers.push(stopWatching);
    return stopWatching;
  }

  async createSymlink(target: string, link: string): Promise<void> {
    const linkDir = dirname(link);
    await fs.mkdir(linkDir, { recursive: true });
    await fs.symlink(target, link);
    this.createdFiles.push(link);
  }

  async cleanup(): Promise<void> {
    // Stop all watchers
    this.watchers.forEach((stop) => {
      try {
        stop();
      } catch {
        // Ignore errors when stopping watchers
      }
    });
    this.watchers = [];

    // Clean up created files
    await Promise.allSettled(this.createdFiles.map((file) => this.deleteFile(file)));
    this.createdFiles = [];

    // Clean up temp directories
    await Promise.allSettled(this.tempDirs.map((dir) => this.deleteDirectory(dir)));
    this.tempDirs = [];
  }
}

export class MockFileSystemTestHelper implements FileSystemTestHelper {
  private files = new Map<string, string>();
  private directories = new Set<string>();
  private watchers = new Map<string, Array<(event: string) => void>>();

  async createTempDir(prefix: string = 'test'): Promise<string> {
    const tempPath = `/mock/temp/${prefix}-${Date.now()}`;
    this.directories.add(tempPath);
    return tempPath;
  }

  async createFile(path: string, content: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    this.files.set(normalizedPath, content);

    // Ensure parent directories exist
    const dir = dirname(normalizedPath);
    if (dir !== normalizedPath) {
      this.directories.add(dir);
    }

    this.triggerWatchers(normalizedPath, 'add');
  }

  async createDirectory(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    this.directories.add(normalizedPath);
  }

  async readFile(path: string): Promise<string> {
    const normalizedPath = this.normalizePath(path);
    const content = this.files.get(normalizedPath);

    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    }

    return content;
  }

  async fileExists(path: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(path);
    return this.files.has(normalizedPath) || this.directories.has(normalizedPath);
  }

  async deleteFile(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    if (this.files.delete(normalizedPath)) {
      this.triggerWatchers(normalizedPath, 'unlink');
    }
  }

  async deleteDirectory(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);

    // Remove the directory
    this.directories.delete(normalizedPath);

    // Remove all files and subdirectories under this path
    const pathPrefix = normalizedPath + '/';

    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(pathPrefix)) {
        this.files.delete(filePath);
      }
    }

    for (const dirPath of this.directories) {
      if (dirPath.startsWith(pathPrefix)) {
        this.directories.delete(dirPath);
      }
    }
  }

  async listFiles(path: string): Promise<string[]> {
    const normalizedPath = this.normalizePath(path);
    const pathPrefix = normalizedPath === '/' ? '' : normalizedPath + '/';
    const files: string[] = [];

    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(pathPrefix)) {
        const relativePath = filePath.substring(pathPrefix.length);
        if (relativePath && !relativePath.includes('/')) {
          files.push(filePath);
        }
      }
    }

    return files.sort();
  }

  async copyFile(src: string, dest: string): Promise<void> {
    const content = await this.readFile(src);
    await this.createFile(dest, content);
  }

  async moveFile(src: string, dest: string): Promise<void> {
    const content = await this.readFile(src);
    await this.createFile(dest, content);
    await this.deleteFile(src);
  }

  async getFileStats(path: string): Promise<any> {
    const normalizedPath = this.normalizePath(path);

    if (!this.fileExists(normalizedPath)) {
      throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
    }

    const isFile = this.files.has(normalizedPath);
    const isDirectory = this.directories.has(normalizedPath);
    const content = this.files.get(normalizedPath) || '';

    return {
      size: content.length,
      mtime: new Date(),
      ctime: new Date(),
      isFile,
      isDirectory,
      mode: isFile ? 0o644 : 0o755,
    };
  }

  watchFile(path: string, callback: (event: string) => void): () => void {
    const normalizedPath = this.normalizePath(path);

    if (!this.watchers.has(normalizedPath)) {
      this.watchers.set(normalizedPath, []);
    }

    this.watchers.get(normalizedPath)!.push(callback);

    return () => {
      const callbacks = this.watchers.get(normalizedPath);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }

        if (callbacks.length === 0) {
          this.watchers.delete(normalizedPath);
        }
      }
    };
  }

  async createSymlink(target: string, link: string): Promise<void> {
    // For mock filesystem, just create a file with special content
    await this.createFile(link, `__SYMLINK__:${target}`);
  }

  async cleanup(): Promise<void> {
    this.files.clear();
    this.directories.clear();
    this.watchers.clear();
  }

  // Mock-specific methods

  /**
   * Get all files in the mock filesystem
   */
  getAllFiles(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [path, content] of this.files.entries()) {
      result[path] = content;
    }
    return result;
  }

  /**
   * Get all directories in the mock filesystem
   */
  getAllDirectories(): string[] {
    return Array.from(this.directories).sort();
  }

  /**
   * Simulate file system events
   */
  simulateFileEvent(path: string, event: string): void {
    this.triggerWatchers(path, event);
  }

  private normalizePath(path: string): string {
    return resolve(path).replace(/\\/g, '/');
  }

  private triggerWatchers(path: string, event: string): void {
    const callbacks = this.watchers.get(path);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          // Ignore callback errors
        }
      });
    }
  }
}

// Factory functions
export function createRealFileSystemHelper(): FileSystemTestHelper {
  return new RealFileSystemTestHelper();
}

export function createMockFileSystemHelper(): FileSystemTestHelper {
  return new MockFileSystemTestHelper();
}

// Helper functions for common patterns
export async function createTestProject(
  helper: FileSystemTestHelper,
  projectName: string,
  files: Record<string, string>
): Promise<string> {
  const projectDir = await helper.createTempDir(projectName);

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(projectDir, filePath);
    await helper.createFile(fullPath, content);
  }

  return projectDir;
}

export async function createTestWorkspace(
  helper: FileSystemTestHelper,
  workspaceName: string
): Promise<{
  workspaceDir: string;
  srcDir: string;
  testDir: string;
  configDir: string;
}> {
  const workspaceDir = await helper.createTempDir(workspaceName);
  const srcDir = join(workspaceDir, 'src');
  const testDir = join(workspaceDir, 'tests');
  const configDir = join(workspaceDir, 'config');

  await Promise.all([
    helper.createDirectory(srcDir),
    helper.createDirectory(testDir),
    helper.createDirectory(configDir),
  ]);

  return { workspaceDir, srcDir, testDir, configDir };
}
