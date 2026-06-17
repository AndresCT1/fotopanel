import { useState } from 'react'

export function useCamera() {
  const [cameraError, setCameraError] = useState(null)

  const checkPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Tu dispositivo no soporta acceso a la cámara')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      setCameraError(null)
      return true
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Permiso de cámara denegado. Ve a la configuración del navegador para habilitarlo.')
      } else {
        setCameraError('No se pudo acceder a la cámara.')
      }
      return false
    }
  }

  return { cameraError, checkPermission, setCameraError }
}
