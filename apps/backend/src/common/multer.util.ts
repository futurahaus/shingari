import * as fs from 'fs/promises';
import { Express } from 'express';

/**
 * Gets a Buffer from a Multer file, whether it was stored in memory or on disk.
 * When using diskStorage, reads from file.path and returns the buffer.
 * Call cleanupMulterFile() after upload to remove temp files from disk.
 */
export async function getBufferFromMulterFile(
  file: Express.Multer.File,
): Promise<Buffer> {
  if (file.buffer) {
    return file.buffer;
  }
  if (file.path) {
    return fs.readFile(file.path);
  }
  throw new Error('Multer file has neither buffer nor path');
}

/**
 * Removes the temp file from disk when using diskStorage.
 * Safe to call even if file was in memory (no-op).
 */
export async function cleanupMulterFile(
  file: Express.Multer.File,
): Promise<void> {
  if (file.path) {
    try {
      await fs.unlink(file.path);
    } catch {
      // Ignore cleanup errors (file may already be gone)
    }
  }
}
