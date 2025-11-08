const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL

export async function fetchDonations(statusFilter = null) {
  try {
    if (!API_URL) {
      throw new Error('VITE_GOOGLE_SHEETS_URL tidak ditemukan di file .env')
    }

    console.log('Fetching donations from:', API_URL)
    
    const url = statusFilter 
      ? `${API_URL}?action=list&status=${statusFilter}`
      : `${API_URL}?action=list`
    
    console.log('Request URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', [...response.headers.entries()])
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('Response data:', result)
    
    if (result.result !== 'success') {
      throw new Error(result.message || 'Failed to fetch donations')
    }
    
    return result.data || []
  } catch (error) {
    console.error('Error fetching donations:', error)
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Gagal koneksi ke Google Apps Script. Pastikan:\n1. Script sudah di-deploy sebagai Web App\n2. Akses diset ke "Anyone"\n3. URL script benar di file .env')
    }
    throw new Error(`Gagal mengambil data donasi: ${error.message}`)
  }
}

export async function approveDonation(rowNumber) {
  try {
    if (!API_URL) {
      throw new Error('VITE_GOOGLE_SHEETS_URL tidak ditemukan di file .env')
    }

    console.log('Approving donation, row:', rowNumber)
    
    const url = `${API_URL}?action=approve&row=${rowNumber}`
    console.log('Approve URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })
    
    console.log('Approve response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('Approve result:', result)
    
    if (result.result !== 'success') {
      throw new Error(result.message || 'Failed to approve donation')
    }
    
    return result.data
  } catch (error) {
    console.error('Error approving donation:', error)
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Gagal koneksi ke Google Apps Script. Cek koneksi internet dan deployment script.')
    }
    throw new Error(`Gagal approve donasi: ${error.message}`)
  }
}

export async function rejectDonation(rowNumber) {
  try {
    const url = `${API_URL}?action=reject&row=${rowNumber}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.result !== 'success') {
      throw new Error(result.message || 'Failed to reject donation')
    }
    
    return result.data
  } catch (error) {
    console.error('Error rejecting donation:', error)
    throw new Error(`Gagal reject donasi: ${error.message}`)
  }
}
