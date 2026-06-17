import { useState } from 'react'
import { generatePDF } from '../utils/pdfGenerator'

export function usePDF() {
  const [status, setStatus] = useState('idle') // idle | generating | done | error
  const [pdfBlob, setPdfBlob] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)

  const generate = async ({ company, projectName, institution, date, items, showDescriptions, showSections, logo }) => {
    setStatus('generating')
    setPdfBlob(null)
    setPdfDoc(null)
    try {
      const pdf = await generatePDF({ company, projectName, institution, date, items, showDescriptions, showSections, logo })
      const blob = pdf.output('blob')
      setPdfBlob(blob)
      setPdfDoc(pdf)
      setStatus('done')
      return { pdf, blob }
    } catch (err) {
      console.error(err)
      setStatus('error')
      return null
    }
  }

  const download = (projectName, date) => {
    if (!pdfDoc) return
    const safeName = projectName.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').replace(/\s+/g, '_')
    const safeDate = date.replace(/-/g, '')
    pdfDoc.save(`PanelFotografico_${safeName}_${safeDate}.pdf`)
  }

  const share = async (projectName, date) => {
    if (!pdfBlob || !navigator.share) return false
    const safeName = projectName.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').replace(/\s+/g, '_')
    const safeDate = date.replace(/-/g, '')
    const file = new File([pdfBlob], `PanelFotografico_${safeName}_${safeDate}.pdf`, { type: 'application/pdf' })
    try {
      await navigator.share({ files: [file], title: 'Panel Fotográfico', text: projectName })
      return true
    } catch { return false }
  }

  const reset = () => {
    setStatus('idle')
    setPdfBlob(null)
    setPdfDoc(null)
  }

  return { status, pdfBlob, generate, download, share, reset }
}
