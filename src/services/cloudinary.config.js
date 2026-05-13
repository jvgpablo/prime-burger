// Configuración de Cloudinary
// Lee valores desde variables de entorno Vite (usa .env.local)
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmxuwxixs',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'prime_burger_upload',
  defaultFolder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'prime-burger/products',
}

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`

/**
 * Nota: Para crear un Upload Preset:
 * 1. Ve a https://console.cloudinary.com/
 * 2. Settings → Upload
 * 3. Crea un nuevo preset sin autenticación (Unsigned)
 * 4. Cópialo en VITE_CLOUDINARY_UPLOAD_PRESET o deja el valor por defecto
 */
