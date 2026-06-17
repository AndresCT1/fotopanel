export default function PhotoCard({ photo, photoNumber, total, showDescription, onDescriptionChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative">
        <img
          src={photo.dataUrl}
          alt={`Foto ${photoNumber}`}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-2 left-2 bg-[#1e3a5f] text-white text-xs font-bold px-2 py-0.5 rounded-lg">
          #{photoNumber}
        </div>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors"
          aria-label="Eliminar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-2.5 pt-2 pb-2.5 space-y-2">
        {showDescription && (
          <textarea
            value={photo.description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="Pie de foto..."
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs border-2 border-gray-200 rounded-xl resize-none outline-none focus:border-[#1e3a5f] transition-colors bg-gray-50 text-center italic placeholder:not-italic placeholder:text-gray-400"
          />
        )}

        <div className="flex gap-1.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex-1 flex items-center justify-center gap-0.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
            Subir
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex-1 flex items-center justify-center gap-0.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Bajar
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
