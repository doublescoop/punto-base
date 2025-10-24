// Site configuration
export const SITE_NAME = 'Punto';
export const SITE_DESCRIPTION = 'Create and publish collaborative zines on Base';

// File upload configuration
export const FILE_UPLOAD_DIR = '/uploads';
export const SECURE_DIRECTORIES = ['/uploads', '/media'];

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
];

