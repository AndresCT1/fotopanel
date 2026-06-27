import { useState, useEffect } from 'react'
import Header from './components/Header'
import PanelForm from './components/PanelForm'
import PhotoGrid from './components/PhotoGrid'
import PDFPreview from './components/PDFPreview'
import PDFViewer from './components/PDFViewer'
import HeaderEditModal from './components/HeaderEditModal'
import { usePDF } from './hooks/usePDF'
import { countPages } from './utils/pdfGenerator'

const VIEW = { HOME: 'home', FORM: 'form', PHOTOS: 'photos', PDF: 'pdf' }
const STORAGE_KEY = 'fotopanel_history'
const SESSION_KEY = 'fp_session'

const COMPANY_LOGO_URLS = {
  '1': '/logos/ic_logo.png',
  '2': '/logos/bryjhocar_logo.png',
}

const COMPANY_THEMES = {
  '1': { bg: '#1e3a5f', accent: '#f97316' },
  '2': { bg: '#8B1A1A', accent: '#C9A84C' },
}

// Known institutions (must match PanelForm list minus "Otro")
const KNOWN_INSTITUTIONS = [
  'Municipalidad Distrital de San Antonio',
  'Municipalidad Provincial de Mariscal Nieto',
  'Gobierno Regional de Moquegua',
]

async function loadLogoForPDF(url) {
  try {
    const resp = await fetch(url)
    if (!resp.ok) return null
    const blob = await resp.blob()
    const dataUrl = await new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.onerror = rej
      reader.readAsDataURL(blob)
    })
    const { width, height } = await new Promise((res) => {
      const img = new Image()
      img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => res({ width: 1, height: 1 })
      img.src = dataUrl
    })
    return { dataUrl, aspectRatio: width / Math.max(height, 1) }
  } catch {
    return null
  }
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveHistory(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20))) } catch {}
}

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function saveSession(panelConfig, items) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ panelConfig, items })) } catch {}
}
function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

// Reconstruct PanelForm initialValues from a resolved panelConfig
function formInitialValues(panelConfig) {
  if (!panelConfig) return null
  const isKnown = KNOWN_INSTITUTIONS.includes(panelConfig.institution)
  return {
    companyId: panelConfig.company?.id || '',
    projectName: panelConfig.projectName || '',
    institution: isKnown ? panelConfig.institution : (panelConfig.institution ? 'Otro' : ''),
    customInstitution: isKnown ? '' : (panelConfig.institution || ''),
    date: panelConfig.date || '',
  }
}

export default function App() {
  const [view, setView] = useState(VIEW.HOME)
  const [panelConfig, setPanelConfig] = useState(() => loadSession()?.panelConfig ?? null)
  const [items, setItems] = useState(() => loadSession()?.items ?? [])
  const [history, setHistory] = useState(loadHistory)
  const [showPreview, setShowPreview] = useState(false)
  const [showHeaderEdit, setShowHeaderEdit] = useState(false)
  const [pdfLogo, setPdfLogo] = useState(null)
  const [lastCompanyId, setLastCompanyId] = useState(
    () => { try { return localStorage.getItem('fp_company') || null } catch { return null } }
  )
  const { status, pdfBlob, generate, download, share, reset } = usePDF()

  const canShare = !!navigator.share

  useEffect(() => { saveHistory(history) }, [history])

  // Persist photos + config in sessionStorage so accidental reloads don't lose work
  useEffect(() => { saveSession(panelConfig, items) }, [panelConfig, items])

  // Load logo as base64 whenever the selected company changes
  useEffect(() => {
    const id = panelConfig?.company?.id
    const url = id ? COMPANY_LOGO_URLS[id] : null
    if (!url) { setPdfLogo(null); return }
    loadLogoForPDF(url).then(setPdfLogo)
  }, [panelConfig?.company?.id])

  const photoCount = items.filter(i => i.type === 'photo').length
  const pageCount = countPages(items, panelConfig?.showSections)

  // ── New panel — resets all state before going to form ───────────────────────
  const handleNewPanel = () => {
    setPanelConfig(null)
    setItems([])
    reset()
    setShowPreview(false)
    clearSession()
    setView(VIEW.FORM)
  }

  // ── Form submit — photos are NEVER cleared here ─────────────────────────────
  const handleFormSubmit = (config) => {
    setPanelConfig(config)
    reset()
    const id = config.company?.id || ''
    setLastCompanyId(id || null)
    try { localStorage.setItem('fp_company', id) } catch {}
    setView(VIEW.PHOTOS)
  }

  // ── Header edit — updates config and auto-regenerates from PDF view ─────────
  const handleHeaderSave = async (updatedConfig) => {
    setShowHeaderEdit(false)
    setPanelConfig(updatedConfig)

    // If company changed, load new logo before generating
    let logo = pdfLogo
    const newId = updatedConfig.company?.id
    if (newId !== panelConfig?.company?.id) {
      const url = newId ? COMPANY_LOGO_URLS[newId] : null
      logo = url ? await loadLogoForPDF(url) : null
      setPdfLogo(logo)
    }

    reset()
    setShowPreview(false)
    const result = await generate({ ...updatedConfig, items, logo })
    if (result) {
      setHistory(h => [{
        id: Date.now(),
        projectName: updatedConfig.projectName,
        institution: updatedConfig.institution,
        company: updatedConfig.company?.name || null,
        date: updatedConfig.date,
        photoCount,
        createdAt: new Date().toISOString(),
      }, ...h])
      setShowPreview(true)
    }
  }

  // ── PDF generation ───────────────────────────────────────────────────────────
  const handleGeneratePDF = async () => {
    if (photoCount === 0) return
    reset()
    setShowPreview(false)
    setView(VIEW.PDF)
    const result = await generate({ ...panelConfig, items, logo: pdfLogo })
    if (result) {
      setHistory(h => [{
        id: Date.now(),
        projectName: panelConfig.projectName,
        institution: panelConfig.institution,
        company: panelConfig.company?.name || null,
        date: panelConfig.date,
        photoCount,
        createdAt: new Date().toISOString(),
      }, ...h])
      setShowPreview(true)
    }
  }

  const handleDownload = () => download(panelConfig.projectName, panelConfig.date)
  const handleShare = () => share(panelConfig.projectName, panelConfig.date)

  const handleClearAll = () => {
    if (confirm('¿Limpiar todo y volver al inicio?')) {
      setPanelConfig(null)
      setItems([])
      reset()
      setShowPreview(false)
      clearSession()
      setView(VIEW.HOME)
    }
  }

  // ── Items operations ─────────────────────────────────────────────────────────
  const addPhoto = (photo) => setItems(i => [...i, photo])

  const addSection = (atIndex) => {
    const section = { type: 'section', id: Date.now() + Math.random(), title: '' }
    setItems(i => { const a = [...i]; a.splice(atIndex, 0, section); return a })
  }

  const removeItem = (index) => setItems(i => i.filter((_, idx) => idx !== index))

  const updateItem = (index, changes) =>
    setItems(i => i.map((item, idx) => idx === index ? { ...item, ...changes } : item))

  const moveUp = (index) => {
    if (index === 0) return
    setItems(i => { const a = [...i]; [a[index - 1], a[index]] = [a[index], a[index - 1]]; return a })
  }

  const moveDown = (index) => {
    setItems(i => {
      if (index === i.length - 1) return i
      const a = [...i]; [a[index], a[index + 1]] = [a[index + 1], a[index]]; return a
    })
  }

  const clearHistory = () => {
    if (confirm('¿Eliminar todo el historial?')) {
      setHistory([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // ── PDF Viewer overlay ───────────────────────────────────────────────────────
  const pdfViewerOverlay = showPreview && pdfBlob && (
    <PDFViewer
      pdfBlob={pdfBlob}
      onClose={() => setShowPreview(false)}
      onDownload={handleDownload}
      onShare={handleShare}
      onEdit={() => { setShowPreview(false); setView(VIEW.PHOTOS) }}
      canShare={canShare}
    />
  )

  // ── HOME ─────────────────────────────────────────────────────────────────────
  if (view === VIEW.HOME) {
    const activeTheme = COMPANY_THEMES[lastCompanyId] || COMPANY_THEMES['1']
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="pb-10" style={{ backgroundColor: activeTheme.bg }}>
            <div className="px-6 pt-10 pb-2 flex flex-col items-center text-center">
              <CompanyBadge companyId={lastCompanyId} />
              <h1 className="text-3xl font-black text-white tracking-tight">FotoPanel</h1>
              <p className="text-white/70 text-sm mt-2 max-w-xs">Genera paneles fotográficos profesionales para presentar a instituciones</p>
            </div>
          </div>

          <div className="flex-1 px-4 -mt-5">
            <button
              onClick={handleNewPanel}
              className="w-full bg-[#f97316] hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-5 rounded-2xl text-lg shadow-xl shadow-orange-300/40 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Panel Fotográfico
            </button>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-700 text-base">Historial</h2>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 font-medium">
                    Borrar historial
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-10 flex flex-col items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No hay paneles generados aún</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.projectName}</p>
                        {item.company && <p className="text-xs text-[#f97316] font-medium truncate">{item.company}</p>}
                        <p className="text-xs text-gray-500 truncate">{item.institution}</p>
                        <p className="text-xs text-gray-400">{item.photoCount} fotos · {formatShortDate(item.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pb-8 px-4 text-center">
            <p className="text-xs text-gray-400 mt-6">FotoPanel · Todo funciona sin conexión</p>
          </div>
        </div>
        {pdfViewerOverlay}
      </>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────────────────
  if (view === VIEW.FORM) {
    // If panelConfig exists the user is coming back from PHOTOS — go back there, not HOME
    const handleFormBack = () => panelConfig ? setView(VIEW.PHOTOS) : setView(VIEW.HOME)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          title={panelConfig ? 'Editar configuración' : 'Nuevo Panel'}
          onBack={handleFormBack}
        />
        <div className="flex-1 px-4 pt-5 pb-6">
          <PanelForm onSubmit={handleFormSubmit} initialValues={formInitialValues(panelConfig)} />
        </div>
      </div>
    )
  }

  // ── PHOTOS ───────────────────────────────────────────────────────────────────
  if (view === VIEW.PHOTOS) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header
            title="Agregar Fotos"
            onBack={() => setView(VIEW.FORM)}
            onClear={handleClearAll}
            showClear
          />

          <ProjectStrip panelConfig={panelConfig} />

          <div className="flex-1 px-4 pt-4 overflow-y-auto">
            <PhotoGrid
              items={items}
              showDescriptions={panelConfig?.showDescriptions}
              showSections={panelConfig?.showSections}
              onAddPhoto={addPhoto}
              onAddSection={addSection}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
            />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 safe-bottom">
            <button
              onClick={handleGeneratePDF}
              disabled={photoCount === 0}
              className="w-full bg-[#f97316] hover:bg-orange-500 active:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:shadow-none disabled:scale-100"
            >
              {photoCount === 0
                ? 'Agrega al menos 1 foto'
                : `Generar PDF · ${photoCount} fotos · ${pageCount} ${pageCount === 1 ? 'hoja' : 'hojas'}`}
            </button>
          </div>
        </div>
        {pdfViewerOverlay}
      </>
    )
  }

  // ── PDF ───────────────────────────────────────────────────────────────────────
  if (view === VIEW.PDF) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header
            title="Vista Previa PDF"
            onBack={status !== 'generating' ? () => setView(VIEW.PHOTOS) : undefined}
            onClear={status !== 'generating' ? handleClearAll : undefined}
            showClear={status !== 'generating'}
          />

          <div className="bg-[#1e3a5f]/5 border-b border-[#1e3a5f]/10 px-4 py-2.5 flex items-center gap-2">
            {panelConfig?.company?.id && COMPANY_LOGO_URLS[panelConfig.company.id] && (
              <img src={COMPANY_LOGO_URLS[panelConfig.company.id]} alt="" className="h-8 w-auto object-contain flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1e3a5f] truncate">{panelConfig?.projectName || 'Sin nombre de proyecto'}</p>
              <p className="text-xs text-gray-500">{photoCount} fotos · {pageCount} {pageCount === 1 ? 'hoja' : 'hojas'}</p>
            </div>
            {status !== 'generating' && (
              <button
                onClick={() => setShowHeaderEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white text-xs font-semibold rounded-xl flex-shrink-0 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar encabezado
              </button>
            )}
          </div>

          <div className="flex-1 px-4">
            <PDFPreview
              status={status}
              onGenerate={handleGeneratePDF}
              onPreview={() => setShowPreview(true)}
              onDownload={handleDownload}
              onShare={handleShare}
              canShare={canShare}
            />
          </div>
        </div>

        {pdfViewerOverlay}

        {showHeaderEdit && (
          <HeaderEditModal
            panelConfig={panelConfig}
            onSave={handleHeaderSave}
            onClose={() => setShowHeaderEdit(false)}
          />
        )}
      </>
    )
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function ProjectStrip({ panelConfig }) {
  const logoUrl = panelConfig?.company?.id ? COMPANY_LOGO_URLS[panelConfig.company.id] : null
  return (
    <div className="bg-[#1e3a5f]/5 border-b border-[#1e3a5f]/10 px-4 py-2.5 flex items-center gap-2">
      {logoUrl && (
        <img src={logoUrl} alt="" className="h-8 w-auto object-contain flex-shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#1e3a5f] truncate">{panelConfig?.projectName}</p>
        <p className="text-xs text-gray-500 truncate">{panelConfig?.company?.name || panelConfig?.institution}</p>
      </div>
    </div>
  )
}

function CompanyBadge({ companyId }) {
  const logoUrl = companyId ? COMPANY_LOGO_URLS[companyId] : null
  const theme = COMPANY_THEMES[companyId] || null

  if (logoUrl) {
    return (
      <div
        className="w-36 h-20 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-black/20 p-3"
        style={theme ? { border: `2px solid ${theme.accent}` } : undefined}
      >
        <img src={logoUrl} alt="Logo empresa" className="w-full h-full object-contain" />
      </div>
    )
  }

  return (
    <div
      className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl"
      style={{ backgroundColor: theme?.accent || '#f97316' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  )
}
