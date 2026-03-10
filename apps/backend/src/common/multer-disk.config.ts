import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { diskStorage } from 'multer';

const UPLOAD_DIR = path.join(os.tmpdir(), 'shingari-uploads');

/**
 * Multer disk storage config to avoid holding large files in memory.
 * Files are written to temp dir, then read for upload and deleted.
 */
export const multerDiskStorage = diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    } catch {
      // Dir may already exist
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
