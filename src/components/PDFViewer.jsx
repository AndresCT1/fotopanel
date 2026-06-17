import { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export default function PDFViewer({ pdfBlob, onClose, onDownload, onShare, onEdit, canShare }) {
  const [pageImages, setPageImages] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [renderedPages, setRenderedPages] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pdfBlob) return
    setPageImages([])
    setTotalPages(0)
    setRenderedPages(0)
    setError(null)

    let cancelled = false
    const url = URL.createObjectURL(pdfBlob)

    ;(async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise
        if (cancelled) return
        setTotalPages(pdf.numPages)

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 1.8 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')
          await page.render({ canvasContext: ctx, viewport }).promise
          if (cancelled) break
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
          setPageImages(prev => [...prev, dataUrl])
          setRenderedPages(i)
        }
      } catch (err) {
        if (!cancelled) setError('No se pudo cargar la vista previa')
      } finally {
        URL.revokeObjectURL(url)
      }
    })()

    return () => { cancelled = true }
  }, [pdfBlob])

  const isLoading = renderedPages === 0 && !error

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-[#1e3a5f] flex items-center gap-3 px-4 py-3 safe-top flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">Vista Previa del PDF</p>
          {totalPages > 0 && (
            <p className="text-blue-200 text-xs">
              {renderedPages < totalPages
                ? `Cargando página ${renderedPages + 1} de ${totalPages}...`
                : `${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}`}
            </p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-xs text-orange-300 hover:text-orange-200 font-semibold py-1.5 px-3 bg-white/10 rounded-xl"
        >
          Editar
        </button>
      </div>

      {/* Progress bar */}
      {totalPages > 0 && renderedPages < totalPages && (
        <div className="h-0.5 bg-gray-800 flex-shrink-0">
          <div
            className="h-full bg-[#f97316] transition-all duration-300"
            style={{ width: `${(renderedPages / totalPages) * 100}%` }}
          />
        </div>
      )}

      {/* Pages scroll area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-3 border-gray-700 border-t-[#f97316] rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Preparando vista previa...</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {pageImages.map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  src={src}
                  alt={`Página ${idx + 1}`}
                  className="w-full rounded-xl shadow-2xl shadow-black/50"
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {idx + 1} / {totalPages}
                </div>
              </div>
            ))}
            {/* Skeleton for pages still rendering */}
            {Array.from({ length: totalPages - renderedPages }).map((_, idx) => (
              <div key={`sk-${idx}`} className="w-full rounded-xl bg-gray-800 animate-pulse" style={{ aspectRatio: '210/297' }} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom action buttons */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-2.5 flex-shrink-0 safe-bottom">
        <button
          onClick={onDownload}
          className="w-full bg-[#1e3a5f] hover:bg-[#16304f] active:bg-[#0f2540] text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar PDF
        </button>
        {canShare && (
          <button
            onClick={onShare}
            className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartir (WhatsApp, Email...)
          </button>
        )}
      </div>
    </div>
  )
}
