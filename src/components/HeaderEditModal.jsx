import { useState } from 'react'

const COMPANIES = [
  { id: '1', name: 'INGENIOUS CONSTRUCTIONS SERVICIOS MULTIPLES E.I.R.L', ruc: '20533100440' },
  { id: '2', name: 'BRYJHOCAR S.A.C', ruc: '20612211991' },
]

const KNOWN_INSTITUTIONS = [
  'Municipalidad Distrital de San Antonio',
  'Municipalidad Provincial de Mariscal Nieto',
  'Gobierno Regional de Moquegua',
]

export default function HeaderEditModal({ panelConfig, onSave, onClose }) {
  const resolvedInstitution = panelConfig?.institution || ''
  const isKnown = KNOWN_INSTITUTIONS.includes(resolvedInstitution)

  const [form, setForm] = useState({
    companyId: panelConfig?.company?.id || '',
    projectName: panelConfig?.projectName || '',
    institution: isKnown ? resolvedInstitution : (resolvedInstitution ? 'Otro' : ''),
    customInstitution: isKnown ? '' : resolvedInstitution,
    date: panelConfig?.date || '',
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.institution) e.institution = 'Selecciona una institución'
    if (form.institution === 'Otro' && !form.customInstitution.trim())
      e.customInstitution = 'Escribe el nombre de la institución'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const company = COMPANIES.find(c => c.id === form.companyId) || null
    onSave({
      ...panelConfig,
      company,
      projectName: form.projectName,
      institution: form.institution === 'Otro' ? form.customInstitution.trim() : form.institution,
      date: form.date,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-10">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Editar encabezado</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 pt-4">
            {/* Empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Empresa Ejecutora</label>
              <select
                value={form.companyId}
                onChange={e => set('companyId', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none appearance-none"
              >
                <option value="">-- Sin empresa --</option>
                {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Nombre del proyecto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre del Proyecto
                <span className="text-gray-400 font-normal text-xs ml-2">opcional</span>
              </label>
              <input
                type="text"
                value={form.projectName}
                onChange={e => set('projectName', e.target.value)}
                placeholder="Ej: Instalación de ventanas"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none"
              />
            </div>

            {/* Institución */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Institución Destinataria</label>
              <select
                value={form.institution}
                onChange={e => set('institution', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-base bg-white outline-none appearance-none
                  ${errors.institution ? 'border-red-400' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
              >
                <option value="">-- Seleccionar --</option>
                {KNOWN_INSTITUTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                <option value="Otro">Otro</option>
              </select>
              {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
            </div>

            {form.institution === 'Otro' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la Institución</label>
                <input
                  type="text"
                  value={form.customInstitution}
                  onChange={e => set('customInstitution', e.target.value)}
                  placeholder="Escribe el nombre completo"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-base bg-white outline-none
                    ${errors.customInstitution ? 'border-red-400' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
                />
                {errors.customInstitution && <p className="text-red-500 text-xs mt-1">{errors.customInstitution}</p>}
              </div>
            )}

            {/* Fecha — solo si showDate está activado */}
            {panelConfig?.showDate && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1e3a5f] text-base bg-white outline-none"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-[#f97316] hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-orange-200 transition-all active:scale-95"
            >
              Guardar y regenerar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
