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

export default function PanelForm({ onSubmit, initialValues }) {
  const [form, setForm] = useState({
    companyId: initialValues?.companyId || '',
    projectName: initialValues?.projectName || '',
    institution: initialValues?.institution || '',
    customInstitution: initialValues?.customInstitution || '',
    date: initialValues?.date || today(),
    showDescriptions: initialValues?.showDescriptions ?? true,
    showSections: initialValues?.showSections ?? false,
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.projectName.trim()) e.projectName = 'El nombre del proyecto es requerido'
    if (!form.institution) e.institution = 'Selecciona una institución'
    if (form.institution === 'Otro' && !form.customInstitution.trim())
      e.customInstitution = 'Escribe el nombre de la institución'
    if (!form.date) e.date = 'La fecha es requerida'
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
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Empresa Ejecutora
        </label>
        <select
          value={form.companyId}
          onChange={e => set('companyId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none appearance-none transition-colors"
        >
          <option value="">-- Sin empresa --</option>
          {COMPANIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {selectedCompany && (
          <p className="text-xs text-gray-500 mt-1 pl-1">RUC: {selectedCompany.ruc}</p>
        )}
      </div>

      {/* Nombre del proyecto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Nombre del Proyecto *
        </label>
        <input
          type="text"
          value={form.projectName}
          onChange={e => set('projectName', e.target.value)}
          placeholder="Ej: Instalación de ventanas - Oficina Central"
          className={`w-full px-4 py-3 rounded-xl border-2 text-base transition-colors bg-white outline-none
            ${errors.projectName ? 'border-red-400' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
        />
        {errors.projectName && <p className="text-red-500 text-xs mt-1">{errors.projectName}</p>}
      </div>

      {/* Institución */}
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

      {/* Fecha */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha *</label>
        <input
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border-2 text-base bg-white outline-none transition-colors
            ${errors.date ? 'border-red-400' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <Toggle
          label="Descripción en fotos"
          description="Texto descriptivo bajo cada imagen"
          checked={form.showDescriptions}
          onChange={v => set('showDescriptions', v)}
        />
        <Toggle
          label="Secciones"
          description="Divide las fotos en grupos con título"
          checked={form.showSections}
          onChange={v => set('showSections', v)}
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
