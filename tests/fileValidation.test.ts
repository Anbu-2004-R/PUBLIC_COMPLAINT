import { describe, it, expect } from 'vitest';
import {
  validateSingleFile,
  validateFileList,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from '../src/utils/fileValidation';

describe('File Validation Rules (SRS FR-23)', () => {
  it('accepts valid JPG, PNG, and PDF files within 10MB limit', () => {
    const validJpg = new File(['dummy content'], 'inspection_photo.jpg', { type: 'image/jpeg' });
    const validPng = new File(['dummy content'], 'site_diagram.png', { type: 'image/png' });
    const validPdf = new File(['dummy content'], 'lab_certificate.pdf', { type: 'application/pdf' });

    expect(validateSingleFile(validJpg).valid).toBe(true);
    expect(validateSingleFile(validPng).valid).toBe(true);
    expect(validateSingleFile(validPdf).valid).toBe(true);
  });

  it('rejects unsupported file formats like executable or text files', () => {
    const invalidExe = new File(['payload'], 'script.exe', { type: 'application/x-msdownload' });
    const invalidDoc = new File(['text'], 'notes.docx', { type: 'application/msword' });

    const resultExe = validateSingleFile(invalidExe);
    expect(resultExe.valid).toBe(false);
    expect(resultExe.errors[0]).toContain('not supported');

    const resultDoc = validateSingleFile(invalidDoc);
    expect(resultDoc.valid).toBe(false);
  });

  it('rejects files exceeding 10 MB in size', () => {
    const oversizedFile = new File(['dummy'], 'giant_map.png', { type: 'image/png' });
    Object.defineProperty(oversizedFile, 'size', { value: MAX_FILE_SIZE_BYTES + 1024 });

    const result = validateSingleFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('exceeds the 10 MB limit');
  });

  it('enforces maximum 5 files limit per upload stage', () => {
    const files = Array.from({ length: 6 }).map(
      (_, i) => new File(['data'], `photo_${i}.jpg`, { type: 'image/jpeg' })
    );

    const result = validateFileList(files, 0);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain(`at most ${MAX_FILES_PER_UPLOAD} files`);
  });
});
