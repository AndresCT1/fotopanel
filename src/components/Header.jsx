export default function Header({ title, onBack, onClear, showClear }) {
  return (
    <header className="sticky top-0 z-50 bg-[#1e3a5f] text-white shadow-lg safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="Volver"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {!onBack && (
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <span className="font-bold text-lg tracking-wide">{title}</span>
        </div>
        {showClear && onClear && (
          <button
            onClick={onClear}
            className="text-xs bg-white/10 hover:bg-white/20 active:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>
    </header>
  )
}
