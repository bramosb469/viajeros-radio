// Formatear hora en formato HH:MM
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

// Obtener nombre del día de la semana en español
export function getDayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayOfWeek] || ''
}

// Obtener día de semana actual (0-6, domingo=0)
export function getCurrentDayOfWeek(): number {
  return new Date().getDay()
}

// Obtener hora actual como string HH:MM
export function getCurrentTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// Clasificar nombre de clase condicional
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Extraer ID de video de YouTube desde URL
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/v\/([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Extraer ID de playlist de YouTube desde URL  
export function extractYouTubePlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([\w-]+)/)
  return match ? match[1] : null
}

// Detectar tipo de URL de YouTube
export function detectYouTubeType(url: string): 'video' | 'playlist' | null {
  if (extractYouTubePlaylistId(url) && !extractYouTubeId(url)) return 'playlist'
  if (extractYouTubeId(url)) return 'video'
  return null
}

// Generar thumbnail URL de YouTube
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

// Sanitizar texto para prevenir XSS básico
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Formatear fecha en español
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Formatear fecha corta
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
  })
}
