import { useState } from 'react'

const COMPANIES = [
  { id: '1', name: 'INGENIOUS CONSTRUCTIONS SERVICIOS MULTIPLES E.I.R.L', ruc: '20533100440' },
  { id: '2', name: 'BRYJHOCAR S.A.C', ruc: '20612211991' },
]

const INSTITUTIONS = [
  'Municipalidad Distrital de San Antonio',
  'Municipalidad Provincial de Mariscal Nieto',
  'Gobierno Regional de Moquegua',
  'Otro',
]

const today = () => new Date().toISOString().split('T')[0]

const PREFS_KEY = 'fp_prefs'
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } catch { return {} }
}
function savePref(key, value) {
  try {
    const p = loadPrefs()
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...p, [key]: value }))
  } catch {}
}

export default function PanelForm({ onSubmit, initialValues }) {
  const prefs = loadPrefs()

  const [form, setForm] = useState({
    companyId:        initialValues?.companyId        || '',
    projectName:      initialValues?.projectName      || '',
    institution:      initialValues?.institution      || '',
    customInstitution:initialValues?.customInstitution|| '',
    date:             initialValues?.date             || today(),
    showDescriptions: prefs.showDescriptions ?? true,
    showSections:     prefs.showSections     ?? false,
    showDate:         prefs.showDate         ?? true,
    showPagination:   prefs.showPagination   ?? true,
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const setToggle = (key, value) => { set(key, value); savePref(key, value) }

  const validate = () => {
    const e = {}
    if (!form.institution) e.institution = 'Selecciona una institución'
    if (form.institution === 'Otro' && !form.customInstitution.trim())
      e.customInstitution = 'Escribe el nombre de la institución'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) return
    const company = COMPANIES.find(c => c.id === form.companyId) || null
    onSubmit({
      ...form,
      company,
      institution: form.institution === 'Otro' ? form.customInstitution.trim() : form.institution,
    })
  }

  const selectedCompany = COMPANIES.find(c => c.id === form.companyId)

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">

      {/* Empresa */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Empresa Ejecutora</label>
        <select
          value={form.companyId}
          onChange={e => set('companyId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none appearance-none transition-colors"
        >
          <option value="">-- Sin empresa --</option>
          {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedCompany && (
          <p className="text-xs text-gray-500 mt-1 pl-1">RUC: {selectedCompany.ruc}</p>
        )}
      </div>

      {/* Nombre del proyecto — opcional */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Nombre del Proyecto
          <span className="text-gray-400 font-normal text-xs ml-2">opcional</span>
        </label>
        <input
          type="text"
          value={form.projectName}
          onChange={e => set('projectName', e.target.value)}
          placeholder="Ej: Instalación de ventanas - Oficina Central"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none transition-colors"
        />
      </div>

      {/* Institución — requerido */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Institución Destinataria *
        </label>
        <select
          value={form.institution}
          onChange={e => set('institution', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border-2 text-base bg-white outline-none appearance-none transition-colors
            ${errors.institution ? 'border-red-400' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
        >
          <option value="">-- Seleccionar institución --</option>
          {INSTITUTIONS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
      </div>

      {form.institution === 'Otro' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nombre de la Institución *
          </label>
          <input
            type="text"
            value={form.customInstitution}
            onChange={e => set('customInstitution', e.target.value)}
            placeholder="Escribe el nombre completo"
            className={`w-full px-4 py-3 rounded-xl border-2 text-base bg-white outline-none transition-colors
              ${errors.customInstitution ? 'border-red-400' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
          />
          {errors.customInstitution && <p className="text-red-500 text-xs mt-1">{errors.customInstitution}</p>}
        </div>
      )}

      {/* Fecha — con toggle */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-gray-700">Fecha</label>
          <InlineToggle
            checked={form.showDate}
            onChange={v => setToggle('showDate', v)}
            label="Incluir fecha"
          />
        </div>
        {form.showDate && (
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none transition-colors"
          />
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <Toggle
          label="Descripción en fotos"
          description="Texto descriptivo bajo cada imagen"
          checked={form.showDescriptions}
          onChange={v => setToggle('showDescriptions', v)}
        />
        <Toggle
          label="Secciones"
          description="Divide las fotos en grupos con título"
          checked={form.showSections}
          onChange={v => setToggle('showSections', v)}
        />
        <Toggle
          label="Numeración de páginas"
          description='Pie de página "Hoja X de Y" en el PDF'
          checked={form.showPagination}
          onChange={v => setToggle('showPagination', v)}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#f97316] hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-orange-200 transition-all active:scale-95"
      >
        Continuar → Agregar Fotos
      </button>
    </form>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border-2 border-gray-200 px-4 py-3.5">
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0
          ${checked ? 'bg-[#f97316]' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

// Compact inline toggle (label + small switch on same row as section header)
function InlineToggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors
        ${checked
          ? 'bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]'
          : 'bg-gray-100 border-gray-200 text-gray-400'}`}
    >
      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors
        ${checked ? 'bg-[#f97316] border-[#f97316]' : 'bg-white border-gray-300'}`} />
      {label}
    </button>
  )
}
