import { useState } from 'react'

const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL

export default function TestAPI() {
  const [result, setResult] = useState('')
  const [testing, setTesting] = useState(false)

  async function testConnection() {
    setTesting(true)
    setResult('Testing...')
    
    const logs = []
    
    try {
      logs.push('=== API Connection Test ===\n')
      logs.push(`Environment Variable: ${API_URL ? '✓ Found' : '✗ Missing'}\n`)
      logs.push(`URL: ${API_URL}\n\n`)
      
      if (!API_URL) {
        logs.push('❌ ERROR: VITE_GOOGLE_SHEETS_URL not found in .env file\n')
        setResult(logs.join(''))
        return
      }
      
      const testUrl = `${API_URL}?action=list`
      logs.push(`Testing URL: ${testUrl}\n\n`)
      logs.push('Sending request...\n')
      
      const response = await fetch(testUrl, {
        method: 'GET',
        redirect: 'follow'
      })
      
      logs.push(`Response Status: ${response.status} ${response.statusText}\n`)
      logs.push(`Response Type: ${response.type}\n`)
      logs.push(`Response URL: ${response.url}\n\n`)
      
      logs.push('Response Headers:\n')
      for (const [key, value] of response.headers.entries()) {
        logs.push(`  ${key}: ${value}\n`)
      }
      logs.push('\n')
      
      if (!response.ok) {
        const errorText = await response.text()
        logs.push(`❌ ERROR Response:\n${errorText}\n`)
        setResult(logs.join(''))
        return
      }
      
      const data = await response.json()
      logs.push('✓ Response Data:\n')
      logs.push(JSON.stringify(data, null, 2))
      logs.push('\n\n')
      
      if (data.result === 'success') {
        logs.push(`✅ SUCCESS! Found ${data.count} donations\n`)
      } else {
        logs.push(`⚠️ WARNING: ${data.message || 'Unexpected response'}\n`)
      }
      
    } catch (error) {
      logs.push(`\n❌ EXCEPTION CAUGHT:\n`)
      logs.push(`Error Type: ${error.constructor.name}\n`)
      logs.push(`Error Message: ${error.message}\n`)
      logs.push(`Error Stack:\n${error.stack}\n\n`)
      
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        logs.push('🔍 DIAGNOSIS: CORS or Network Error\n\n')
        logs.push('Possible causes:\n')
        logs.push('1. Apps Script not deployed as Web App\n')
        logs.push('2. Access not set to "Anyone"\n')
        logs.push('3. Wrong deployment URL\n')
        logs.push('4. Network/firewall blocking request\n')
        logs.push('5. Script not saved or deployed\n\n')
        logs.push('Solution:\n')
        logs.push('- Go to Apps Script → Deploy → Manage deployments\n')
        logs.push('- Make sure "Who has access" = "Anyone"\n')
        logs.push('- Copy the deployment URL (ends with /exec)\n')
        logs.push('- Update .env with correct URL\n')
        logs.push('- Restart dev server: npm run dev\n')
      }
    } finally {
      setTesting(false)
      setResult(logs.join(''))
    }
  }

  async function testDirectAccess() {
    if (!API_URL) {
      alert('URL not found in .env')
      return
    }
    window.open(`${API_URL}?action=list`, '_blank')
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'monospace' }}>
      <h2>Google Apps Script API Test</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={testConnection} 
          disabled={testing}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          {testing ? 'Testing...' : 'Run Connection Test'}
        </button>
        
        <button 
          onClick={testDirectAccess}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Open API URL in New Tab
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: '16px',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'Consolas, Monaco, monospace',
        fontSize: '12px',
        maxHeight: '70vh',
        overflow: 'auto'
      }}>
        {result || 'Click "Run Connection Test" to start testing...'}
      </div>
      
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <strong>📋 Quick Checklist:</strong>
        <ul style={{ marginTop: '8px', fontSize: '14px' }}>
          <li>✓ Apps Script deployed as Web app</li>
          <li>✓ Execute as: Me (your email)</li>
          <li>✓ Who has access: <strong>Anyone</strong></li>
          <li>✓ Deployment URL ends with /exec</li>
          <li>✓ URL copied to .env file</li>
          <li>✓ Dev server restarted after .env change</li>
        </ul>
      </div>
    </div>
  )
}
