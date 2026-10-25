/**
 * File validation per SRS v1.1 FR-23:
 * - Accept only JPG, PNG, and PDF files
 * - Maximum 10 MB per file
 * - Maximum 5 files per upload stage
 */

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES_PER_UPLOAD = 5;

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSingleFile(file: File): FileValidationResult {
  const errors: string[] = [];

  // Check file type
  const isTypeAllowed = ALLOWED_FILE_TYPES.includes(file.type);
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (!isTypeAllowed && !isExtAllowed) {
    errors.push(`"${file.name}" is not supported. Only JPG, PNG, and PDF files are allowed.`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(`"${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFileList(
  newFiles: File[],
  existingCount: number = 0
): FileValidationResult {
  const errors: string[] = [];

  if (newFiles.length + existingCount > MAX_FILES_PER_UPLOAD) {
    errors.push(`You can upload at most ${MAX_FILES_PER_UPLOAD} files in total.`);
  }

  for (const file of newFiles) {
    const single = validateSingleFile(file);
    if (!single.valid) {
      errors.push(...single.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
