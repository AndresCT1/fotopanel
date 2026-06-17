import { jsPDF } from 'jspdf'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 13
const HEADER_H = 48
const ACCENT_H = 1.5
const SECTION_H = 10
const SECTION_GAP = 4
const FOOTER_H = 10
const GAP = 8

export async function generatePDF({ company, projectName, institution, date, items, showDescriptions, showSections }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const formattedDate = formatDate(date)
  const pages = buildPages(items, showSections)
  const totalPages = pages.length

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) pdf.addPage()
    const { sectionTitle, photos } = pages[pageIdx]

    drawHeader(pdf, company, projectName, institution, formattedDate)

    if (sectionTitle) drawSectionBar(pdf, sectionTitle)

    const layout = computeLayout(!!sectionTitle, showDescriptions)

    for (let slot = 0; slot < photos.length; slot++) {
      const photo = photos[slot]
      const photoY = layout.contentTop + slot * (layout.photoH + layout.descH + (slot > 0 ? GAP : 0))
      await drawPhoto(pdf, photo.dataUrl, MARGIN, photoY, PAGE_W - MARGIN * 2, layout.photoH)
      if (showDescriptions && photo.description) {
        drawDescription(pdf, photo.description, photoY + layout.photoH)
      }
    }

    drawFooter(pdf, pageIdx + 1, totalPages)
  }

  return pdf
}

function buildPages(items, showSections) {
  const pages = []
  let currentSectionTitle = null
  let buffer = []

  const flush = () => {
    while (buffer.length > 0) {
      const batch = buffer.splice(0, 2)
      pages.push({ sectionTitle: currentSectionTitle, photos: batch })
      currentSectionTitle = null
    }
  }

  for (const item of items) {
    if (item.type === 'section' && showSections) {
      flush()
      currentSectionTitle = item.title || 'Sección'
    } else if (item.type === 'photo') {
      buffer.push(item)
    }
  }
  flush()

  return pages
}

export function countPages(items, showSections) {
  let pages = 0
  let buffer = 0
  for (const item of items) {
    if (item.type === 'section' && showSections) {
      if (buffer > 0) { pages += Math.ceil(buffer / 2); buffer = 0 }
    } else if (item.type === 'photo') {
      buffer++
      if (buffer === 2) { pages++; buffer = 0 }
    }
  }
  if (buffer > 0) pages++
  return pages
}

function computeLayout(hasSection, showDescriptions) {
  const contentTop = MARGIN + HEADER_H + ACCENT_H + (hasSection ? SECTION_H + SECTION_GAP : 0)
  const contentBottom = PAGE_H - FOOTER_H - MARGIN
  const descH = showDescriptions ? 9 : 0
  const photoH = (contentBottom - contentTop - GAP - descH * 2) / 2
  return { contentTop, photoH, descH }
}

function drawHeader(pdf, company, projectName, institution, date) {
  pdf.setFillColor(30, 58, 95)
  pdf.rect(0, 0, PAGE_W, HEADER_H, 'F')
  pdf.setFillColor(249, 115, 22)
  pdf.rect(0, HEADER_H, PAGE_W, ACCENT_H, 'F')

  const textMaxW = PAGE_W - MARGIN * 2 - 32
  let curY = 8

  if (company) {
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9.5)
    const nameLines = pdf.splitTextToSize(company.name, textMaxW)
    pdf.text(nameLines.slice(0, 2), MARGIN, curY)
    curY += Math.min(nameLines.length, 2) * 4.5

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(170, 205, 235)
    pdf.text(`RUC: ${company.ruc}`, MARGIN, curY)
    curY += 4

    pdf.setDrawColor(150, 185, 215)
    pdf.setLineWidth(0.25)
    pdf.line(MARGIN, curY, PAGE_W - MARGIN, curY)
    curY += 5
  }

  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  const projLines = pdf.splitTextToSize(projectName.toUpperCase(), textMaxW)
  pdf.text(projLines.slice(0, 1), MARGIN, curY)
  curY += 5.5

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(170, 205, 235)
  pdf.text(institution, MARGIN, curY)
  curY += 4.5

  pdf.text(date, MARGIN, curY)

  // Logo box
  const lx = PAGE_W - MARGIN - 26
  pdf.setFillColor(249, 115, 22)
  pdf.roundedRect(lx, 5, 26, HEADER_H - 10, 3, 3, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('FOTO', lx + 13, HEADER_H / 2 - 1, { align: 'center' })
  pdf.text('PANEL', lx + 13, HEADER_H / 2 + 5, { align: 'center' })
}

function drawSectionBar(pdf, title) {
  const barY = HEADER_H + ACCENT_H
  pdf.setFillColor(30, 58, 95)
  pdf.rect(0, barY, PAGE_W, SECTION_H, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text(title.toUpperCase(), PAGE_W / 2, barY + 6.8, { align: 'center' })
}

async function drawPhoto(pdf, dataUrl, x, y, maxW, maxH) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = img.width / img.height
      let drawW = maxW, drawH = drawW / ratio
      if (drawH > maxH) { drawH = maxH; drawW = drawH * ratio }
      const offsetX = x + (maxW - drawW) / 2
      const fmt = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      pdf.setDrawColor(215, 215, 215)
      pdf.setLineWidth(0.3)
      pdf.rect(offsetX - 0.5, y - 0.5, drawW + 1, drawH + 1)
      pdf.addImage(dataUrl, fmt, offsetX, y, drawW, drawH)
      resolve()
    }
    img.src = dataUrl
  })
}

function drawDescription(pdf, description, photoBottomY) {
  pdf.setTextColor(80, 80, 80)
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(7.5)
  const lines = pdf.splitTextToSize(description, PAGE_W - MARGIN * 2 - 8)
  pdf.text(lines.slice(0, 2), PAGE_W / 2, photoBottomY + 5.5, { align: 'center' })
}

function drawFooter(pdf, current, total) {
  const footerY = PAGE_H - FOOTER_H
  pdf.setFillColor(245, 245, 245)
  pdf.rect(0, footerY, PAGE_W, FOOTER_H, 'F')
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.2)
  pdf.line(MARGIN, footerY, PAGE_W - MARGIN, footerY)
  pdf.setTextColor(120, 120, 120)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.text('Panel Fotográfico', MARGIN, PAGE_H - 4)
  pdf.text(`Hoja ${current} de ${total}`, PAGE_W / 2, PAGE_H - 4, { align: 'center' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}
