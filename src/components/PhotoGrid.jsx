import { useRef } from 'react'
import PhotoCard from './PhotoCard'

export default function PhotoGrid({
  items, showDescriptions, showSections,
  onAddPhoto, onAddSection, onRemoveItem, onUpdateItem, onMoveUp, onMoveDown,
}) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const dataUrl = await compressImage(file, 1200, 0.75)
      onAddPhoto({ dataUrl, description: '', id: Date.now() + Math.random(), type: 'photo' })
    }
    e.target.value = ''
  }

  const photoCount = items.filter(i => i.type === 'photo').length

  // Build rows: group consecutive photos into pairs, sections are solo rows
  const rows = buildRows(items)

  return (
    <div className="space-y-3 pb-6">
      {/* Upload buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex flex-col items-center gap-2 py-4 bg-[#1e3a5f] text-white rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Tomar Foto
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex flex-col items-center gap-2 py-4 bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] rounded-2xl font-semibold text-sm shadow-sm active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Galería
        </button>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleFile} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />

      {/* Counter */}
      {photoCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-gray-600">
            {photoCount} {photoCount === 1 ? 'foto cargada' : 'fotos cargadas'}
          </span>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {rows.map((row, rowIdx) =>
            row.type === 'section' ? (
              <SectionCard
                key={row.item.id}
                item={row.item}
                index={row.index}
                isFirst={row.index === 0}
                isLast={row.index === items.length - 1}
                onTitleChange={title => onUpdateItem(row.index, { title })}
                onRemove={() => onRemoveItem(row.index)}
                onMoveUp={() => onMoveUp(row.index)}
                onMoveDown={() => onMoveDown(row.index)}
              />
            ) : (
              <div key={rowIdx} className="grid grid-cols-2 gap-3">
                {row.photos.map(({ photo, index, photoNumber }) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    photoNumber={photoNumber}
                    total={photoCount}
                    showDescription={showDescriptions}
                    onDescriptionChange={desc => onUpdateItem(index, { description: desc })}
                    onRemove={() => onRemoveItem(index)}
                    onMoveUp={() => onMoveUp(index)}
                    onMoveDown={() => onMoveDown(index)}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Add section button */}
      {showSections && (
        <button
          type="button"
          onClick={() => onAddSection(items.length)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#1e3a5f]/30 hover:border-[#1e3a5f]/60 text-[#1e3a5f]/60 hover:text-[#1e3a5f] rounded-2xl text-sm font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Agregar sección
        </button>
      )}
    </div>
  )
}

function SectionCard({ item, index, isFirst, isLast, onTitleChange, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-[#1e3a5f] rounded-2xl overflow-hidden shadow-md">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <input
          type="text"
          value={item.title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Título de sección..."
          className="flex-1 bg-transparent text-white placeholder-white/50 font-semibold text-sm outline-none min-w-0"
        />
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm font-medium">No hay fotos aún</p>
      <p className="text-xs mt-1">Toma o selecciona fotos para comenzar</p>
    </div>
  )
}

// Build display rows from flat items array
function buildRows(items) {
  const rows = []
  let photoBuffer = []
  let globalPhotoIdx = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type === 'section') {
      if (photoBuffer.length > 0) {
        rows.push({ type: 'photos', photos: [...photoBuffer] })
        photoBuffer = []
      }
      rows.push({ type: 'section', item, index: i })
    } else if (item.type === 'photo') {
      globalPhotoIdx++
      photoBuffer.push({ photo: item, index: i, photoNumber: globalPhotoIdx })
      if (photoBuffer.length === 2) {
        rows.push({ type: 'photos', photos: [...photoBuffer] })
        photoBuffer = []
      }
    }
  }
  if (photoBuffer.length > 0) rows.push({ type: 'photos', photos: [...photoBuffer] })
  return rows
}

function compressImage(file, maxDimension, quality) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
