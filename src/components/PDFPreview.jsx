export default function PDFPreview({ status, onGenerate, onPreview, onDownload, onShare, canShare }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {status === 'idle' && (
        <>
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-lg">¿Todo listo?</h3>
            <p className="text-gray-500 text-sm mt-1">Presiona el botón para generar tu PDF</p>
          </div>
          <button
            onClick={onGenerate}
            className="w-full bg-[#f97316] hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            Generar PDF
          </button>
        </>
      )}

      {status === 'generating' && (
        <>
          <div className="w-20 h-20 flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-[#1e3a5f]/20 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Generando PDF...</p>
            <p className="text-gray-400 text-sm mt-1">Procesando imágenes</p>
          </div>
        </>
      )}

      {status === 'done' && (
        <>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 text-lg">¡PDF generado!</p>
            <p className="text-gray-500 text-sm mt-1">Revísalo antes de descargar</p>
          </div>
          <div className="w-full space-y-3">
            {/* Primary: preview */}
            <button
              onClick={onPreview}
              className="w-full bg-[#f97316] hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver Vista Previa del PDF
            </button>

            {/* Secondary: direct actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onDownload}
                className="flex items-center justify-center gap-1.5 py-3 bg-[#1e3a5f] text-white font-semibold rounded-2xl text-sm transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </button>
              {canShare ? (
                <button
                  onClick={onShare}
                  className="flex items-center justify-center gap-1.5 py-3 bg-green-600 text-white font-semibold rounded-2xl text-sm transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir
                </button>
              ) : (
                <button
                  onClick={onGenerate}
                  className="flex items-center justify-center gap-1.5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-2xl text-sm transition-all active:scale-95"
                >
                  Regenerar
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-red-700">Error al generar el PDF</p>
            <p className="text-gray-500 text-sm mt-1">Intenta nuevamente</p>
          </div>
          <button
            onClick={onGenerate}
            className="w-full bg-[#f97316] text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-95"
          >
            Reintentar
          </button>
        </>
      )}
    </div>
  )
}
