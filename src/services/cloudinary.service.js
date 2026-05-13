import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from './cloudinary.config'

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - El archivo de imagen a subir
 * @param {string} folder - Carpeta en Cloudinary (ej: 'prime-burger/products')
 * @returns {Promise<string>} URL de la imagen subida
 */
export async function uploadImageToCloudinary(file, folder = 'prime-burger/products') {
  if (!file) {
    throw new Error('No file provided')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
  formData.append('folder', folder)
  formData.append('resource_type', 'auto')

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      // intentar parsear JSON, si existe
      let errMsg = 'Error uploading to Cloudinary'
      try {
        const errorBody = await response.json()
        errMsg = errorBody.error?.message || errMsg
      } catch (e) {
        // body no es JSON o está vacío
        const text = await response.text().catch(() => '')
        if (text) errMsg = text
      }

      throw new Error(errMsg)
    }

    // respuesta OK: intentar parsear JSON, si falla, lanzar error
    let data
    try {
      data = await response.json()
    } catch (e) {
      throw new Error('Cloudinary devolvió respuesta inválida')
    }

    if (!data?.secure_url) {
      throw new Error('No se recibió la URL de la imagen desde Cloudinary')
    }

    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {File[]} files - Array de archivos
 * @param {string} folder - Carpeta en Cloudinary
 * @returns {Promise<string[]>} Array de URLs de imágenes subidas
 */
export async function uploadMultipleImages(files, folder = 'prime-burger/products') {
  try {
    const uploadPromises = files.map((file) => uploadImageToCloudinary(file, folder))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

/**
 * Valida que un archivo sea una imagen
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export function isValidImageFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Valida el tamaño del archivo (máximo 5MB)
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 5)
 * @returns {boolean}
 */
export function isValidFileSize(file, maxSizeMB = 5) {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}
