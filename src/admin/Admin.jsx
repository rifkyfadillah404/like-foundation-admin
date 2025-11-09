import { useEffect, useState } from 'react'
import { fetchDonations, approveDonation } from './googleScriptApi.js'
import html2pdf from 'html2pdf.js'
import './admin.css'

function formatCurrency(n) {
  const num = Number(n || 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

function formatDate(dateStr) {
  if (!dateStr) {
    const now = new Date()
    return now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: '2-digit', 
      year: 'numeric' 
    })
  }
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: '2-digit', 
      year: 'numeric' 
    })
  } catch (e) {
    return dateStr
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [donations, setDonations] = useState([])
  const [approving, setApproving] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const loadDonations = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchDonations()
      setDonations(data)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDonations()
  }, [])

  const handleSearch = () => {
    const trimmedInput = searchInput.trim()
    setSearchQuery(trimmedInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  async function handleApprove(item) {
    const rowNumber = item.rowNumber
    setApproving((prev) => ({ ...prev, [rowNumber]: true }))
    
    try {
      await approveDonation(rowNumber)
      alert('Berhasil approve!')
      await loadDonations()
    } catch (e) {
      alert('Gagal approve: ' + e.message)
    } finally {
      setApproving((prev) => ({ ...prev, [rowNumber]: false }))
    }
  }

  function handleDownload(item) {
    const isApproved = item.approval === 'Approved' || item.approval === 1 || item.approval === '1'
    
    if (!isApproved) {
      alert('Silakan approve dulu sebelum download PDF')
      return
    }
    
    const logoUrl = window.location.origin + '/like.jpg'
    const bniBankLogo = window.location.origin + '/bni.jpg'
    const bsiBankLogo = window.location.origin + '/bsi.jpg'
    
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=297mm, initial-scale=1.0"><title>Bukti Penerimaan Donasi - LIKE Foundation</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page {
          size: 297mm 210mm;
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          html, body {
            width: 297mm;
            height: 210mm;
          }
        }
        body { 
          font-family: 'Poppins', Arial, sans-serif; 
          background: white;
          padding: 0;
          margin: 0;
          overflow-x: auto;
        }
        .container {
          width: 297mm;
          height: 210mm;
          max-width: 297mm;
          max-height: 210mm;
          min-width: 297mm;
          min-height: 210mm;
          margin: 0 auto;
          background: white;
          position: relative;
          padding: 15px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .header-section {
          display: flex;
          margin-bottom: 20px;
        }
        .blue-box {
          background: #2d5f7e;
          color: white;
          padding: 25px 30px;
          width: 380px;
        }
        .blue-box h1 {
          font-size: 22px;
          font-weight: 400;
          margin-bottom: 5px;
        }
        .blue-box h2 {
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
        }
        .top-right {
          flex: 1;
          padding-left: 60px;
          display: flex;
          flex-direction: column;
        }
        .org-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        .org-title {
          font-size: 24px;
          font-weight: 700;
          color: #000;
          white-space: nowrap;
        }
        .org-address {
          font-size: 11px;
          line-height: 1.5;
          color: #000;
          padding-left: 15px;
          border-left: 2px solid #e5e7eb;
        }
        .main-content {
          display: flex;
          gap: 40px;
        }
        .left-info {
          flex: 1;
        }
        .intro-text {
          font-size: 13px;
          margin-bottom: 15px;
          font-weight: 400;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          font-size: 13px;
          align-items: baseline;
        }
        .info-label {
          width: 140px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .info-colon {
          margin: 0 8px;
        }
        .info-value {
          flex: 1;
          border-bottom: 2px solid #333;
          padding-bottom: 2px;
          font-weight: 400;
          min-height: 20px;
        }
        .right-info {
          flex: 1;
        }
        .donation-text {
          font-size: 11px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bank-list {
          margin-bottom: 15px;
        }
        .bank-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 11px;
        }
        .bank-badge {
          padding: 4px 10px;
          border-radius: 3px;
          min-width: 60px;
          height: 26px;
          text-align: center;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e5e7eb;
        }
        .bank-badge img {
          height: 20px;
          width: auto;
          max-width: 50px;
          object-fit: contain;
        }
        .bank-account {
          font-weight: 700;
          margin-right: 10px;
          color: #000;
        }
        .bank-name {
          color: #000;
          font-size: 11px;
          font-style: italic;
        }
        .whatsapp-section {
          font-size: 11px;
          margin-bottom: 15px;
        }
        .whatsapp-title {
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .whatsapp-item {
          margin-bottom: 4px;
        }
        .whatsapp-number {
          font-weight: 700;
          margin-right: 10px;
        }
        .whatsapp-label {
          color: #000;
          font-size: 10px;
        }
        .bottom-section {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 500px;
        }
        .date-row {
          text-align: right;
          margin-bottom: 15px;
          font-size: 13px;
        }
        .date-label {
          font-weight: 700;
          margin-right: 10px;
        }
        .date-value {
          border-bottom: 2px solid #333;
          display: inline-block;
          min-width: 200px;
          padding-bottom: 2px;
        }
        .signature-container {
          display: flex;
          gap: 20px;
        }
        .signature-box {
          flex: 1;
        }
        .signature-title {
          background: #2d5f7e;
          color: white;
          padding: 10px;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }
        .signature-space {
          height: 100px;
          border: 2px solid #2d5f7e;
          background: white;
        }
        @media print {
          body { 
            padding: 0;
            width: 297mm;
            height: 210mm;
          }
          .container {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
          }
        }
      </style>
    </head><body>
      <div class="container">
        <div class="header-section">
          <div style="background: #2d5f7e; color: white; padding: 25px 30px; width: 380px;">
            <h1 style="font-size: 20px; font-weight: 400; margin: 0 0 5px 0;">Bukti</h1>
            <h2 style="font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0;">Penerimaan<br>Donasi</h2>
          </div>
          <div class="top-right">
            <div class="org-header">
              <img src="${logoUrl}" alt="LIKE" style="width: 50px; height: 50px; object-fit: contain;" />
              <div class="org-title">foundation</div>
              <div class="org-address">
                <strong>Jl. Mayjend Panjaitan - Karang Kulon</strong><br>
                Kel. Papahan, Kec. Tasikmadu,<br>
                Kab. Karanganyar, Jawa Tengah.
              </div>
            </div>
          </div>
        </div>
        
        <div class="main-content">
          <div class="left-info">
            <p class="intro-text">Alhamdulillah, telah terima donasi dari</p>
            <div class="info-row">
              <span class="info-label">Nama</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.nama || '')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No. WhatsApp</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.noWa || '')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Alamat</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.alamat || '')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nominal</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(formatCurrency(item.nominal || 0))}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Terbilang</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.terbilang || '')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ket. Pembayaran</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.pembayaran || '')}</span>
            </div>
            ${item.noted ? `<div class="info-row">
              <span class="info-label">Catatan</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.noted || '')}</span>
            </div>` : ''}
            <div class="info-row">
              <span class="info-label">Untuk Program</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.program || '')}</span>
            </div>
            ${item.programCustom ? `<div class="info-row">
              <span class="info-label">Catatan Program</span>
              <span class="info-colon">:</span>
              <span class="info-value">${escapeHtml(item.programCustom || '')}</span>
            </div>` : ''}
          </div>
          
          <div class="right-info">
            <div class="donation-text">
              Donasi dapat dikirimkan melalui nomer rekening
            </div>
            <div class="bank-list">
              <div class="bank-item">
                <span class="bank-badge"><img src="${bniBankLogo}" alt="BNI" /></span>
                <span class="bank-account">555 - 8800 - 585</span>
                <span class="bank-name">a.n. Lingkar Insan Kebaikan</span>
              </div>
              <div class="bank-item">
                <span class="bank-badge"><img src="${bsiBankLogo}" alt="BSI" /></span>
                <span class="bank-account">730 - 8910 - 045</span>
                <span class="bank-name">a.n. Wakaf Produktif Kebaikan</span>
              </div>
              <div class="bank-item">
                <span class="bank-badge"><img src="${bsiBankLogo}" alt="BSI" /></span>
                <span class="bank-account">730 - 8910 - 339</span>
                <span class="bank-name">a.n. Solidaritas Al Aqsha</span>
              </div>
            </div>
            
            <div class="whatsapp-section">
              <div class="whatsapp-title">Konfirmasi ke nomer WhatsApp</div>
              <div class="whatsapp-item">
                <span class="whatsapp-number">0821 - 3636 - 3648</span>
                <span class="whatsapp-label">(Hotline LIKE Foundation)</span>
              </div>
              <div class="whatsapp-item">
                <span class="whatsapp-number">083-800-100-888</span>
                <span class="whatsapp-label">(Hotline LIKE Foundation)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bottom-section">
          <div class="date-row">
            <span class="date-label">Tanggal</span>
            <span class="info-colon">:</span>
            <span class="date-value">${escapeHtml(formatDate(item.tanggal))}</span>
          </div>
          <div class="signature-container">
            <div class="signature-box">
              <div class="signature-title">Nama Petugas</div>
              <div class="signature-space"></div>
            </div>
            <div class="signature-box">
              <div class="signature-title">Donatur</div>
              <div class="signature-space"></div>
            </div>
          </div>
        </div>
      </div>
    </body></html>`
    
    // Create temporary container
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '-9999px'
    document.body.appendChild(tempDiv)
    
    // Direct download PDF for all browsers with landscape orientation
    const opt = {
      margin: 0,
      filename: `Bukti-Donasi-${item.nama}-${formatDate(item.tanggal)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: [297, 210], 
        orientation: 'landscape',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }
    
    html2pdf()
      .set(opt)
      .from(tempDiv.querySelector('.container'))
      .save()
      .then(() => {
        document.body.removeChild(tempDiv)
      })
      .catch((error) => {
        console.error('PDF generation error:', error)
        document.body.removeChild(tempDiv)
        alert('Gagal membuat PDF. Silakan coba lagi.')
      })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner-large"></div>
          <p className="loading-text">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-content">
            <div className="error-icon-wrapper">
              <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="error-details">
              <h3 className="error-title">Terjadi Kesalahan</h3>
              <p className="error-message">{error}</p>
              <button onClick={loadDonations} className="btn-retry">
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter donations based on search query
  const filteredDonations = donations.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase().trim()
    
    // Convert all fields to string first to handle numbers
    const namaStr = String(item.nama || '').toLowerCase()
    const noWaStr = String(item.noWa || '').toLowerCase()
    const programStr = String(item.program || '').toLowerCase()
    const alamatStr = String(item.alamat || '').toLowerCase()
    
    const namaMatch = namaStr.includes(query)
    const noWaMatch = noWaStr.includes(query)
    const programMatch = programStr.includes(query)
    const alamatMatch = alamatStr.includes(query)
    
    return namaMatch || noWaMatch || programMatch || alamatMatch
  })

  const pendingCount = filteredDonations.filter(d => d.approval === 'Pending').length
  const approvedCount = filteredDonations.filter(d => d.approval === 'Approved' || d.approval === 1 || d.approval === '1').length

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src="/like.jpg" alt="LIKE Foundation" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            <div>
              <h1 className="admin-title">Admin Donasi</h1>
              <p className="admin-subtitle">
                <span className="live-indicator">
                  <span className="live-dot"></span>
                  Data Real-time dari Google Sheets
                </span>
              </p>
            </div>
          </div>
          <div className="stats-container">
            <div className="stat-badge total">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Total: {filteredDonations.length}
            </div>
            <div className="stat-badge pending">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Pending: {pendingCount}
            </div>
            <div className="stat-badge approved">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Approved: {approvedCount}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', maxWidth: '450px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8', pointerEvents: 'none' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, no WA, program, atau alamat..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                    e.currentTarget.style.color = '#475569'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.3)'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
          {searchQuery && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
              Menampilkan {filteredDonations.length} dari {donations.length} data untuk "{searchQuery}"
            </div>
          )}
        </div>
        
        <div className="table-card">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Donatur</th>
                  <th>No. WhatsApp</th>
                  <th>Program</th>
                  <th className="text-right">Jumlah Donasi</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Tgl Approval</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <svg width="48" height="48" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: '600', color: '#64748b', margin: '0 0 4px 0' }}>
                            Tidak ada data ditemukan
                          </p>
                          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0' }}>
                            {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada data donasi'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((item) => {
                    const isApproved = item.approval === 'Approved' || item.approval === 1 || item.approval === '1'
                    const isApproving = approving[item.rowNumber]
                    
                    return (
                      <tr key={item.rowNumber}>
                        <td>{formatDate(item.tanggal)}</td>
                        <td>
                          <div className="donor-name">{item.nama}</div>
                        </td>
                        <td>
                          <span className="phone-number">{item.noWa}</span>
                        </td>
                        <td>{item.program}</td>
                        <td>
                          <span className="donation-amount">
                            {formatCurrency(item.nominal || 0)}
                          </span>
                        </td>
                        <td className="text-center">
                          {isApproved ? (
                            <span className="status-badge approved">
                              <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Approved
                            </span>
                          ) : (
                            <span className="status-badge pending">
                              <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          {item.tanggalApproval ? (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {formatDate(item.tanggalApproval)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!isApproved ? (
                              <button
                                onClick={() => handleApprove(item)}
                                disabled={isApproving}
                                className="btn btn-primary"
                              >
                                {isApproving ? (
                                  <>
                                    <span className="loading-spinner"></span>
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                  </>
                                )}
                              </button>
                            ) : (
                              <div style={{ padding: '10px 18px', color: '#94a3b8' }}>—</div>
                            )}
                            <button
                              onClick={() => handleDownload(item)}
                              disabled={!isApproved}
                              className="btn btn-secondary"
                            >
                              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
