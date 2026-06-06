import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, CheckCircle, AlertCircle, X, Download } from 'lucide-react'
import api from '@/lib/api'
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const SAMPLE_CSV = `name,phone,email,tags
Rahul Sharma,+919876543210,rahul@example.com,customer|vip
Priya Patel,+919898989898,priya@example.com,lead
Amit Kumar,+919999999999,,customer`

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState('upload') // upload | preview | done

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0]
    if (f) {
      setFile(f)
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleImport = async () => {
    if (!file) return toast.error('Please select a CSV file')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(res.data.data)
      setStep('done')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setStep('upload')
    if (step === 'done') onSuccess?.()
    else onClose?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Contacts" size="md">
      <ModalBody className="space-y-4">
        {step === 'upload' && (
          <>
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">CSV Format Required</p>
              <p className="text-xs">Your CSV must include columns: <code className="bg-blue-100 px-1 rounded">name</code>, <code className="bg-blue-100 px-1 rounded">phone</code></p>
              <p className="text-xs mt-1">Optional: <code className="bg-blue-100 px-1 rounded">email</code>, <code className="bg-blue-100 px-1 rounded">tags</code> (pipe-separated)</p>
            </div>

            {/* Sample download */}
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-2 text-sm text-brand-purple font-semibold hover:underline"
            >
              <Download size={14} />
              Download sample CSV
            </button>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                isDragActive ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50',
                file && 'border-green-400 bg-green-50'
              )}
            >
              <input {...getInputProps()} />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <File size={22} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              ) : isDragActive ? (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={28} className="text-brand-purple" />
                  <p className="text-brand-purple font-semibold">Drop it here!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Drag & drop your CSV here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse • Max 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {step === 'done' && result && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-whatsapp/10 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-whatsapp" />
            </div>
            <div>
              <p className="font-bold text-gray-900 font-jakarta text-xl">{result.imported} contacts imported!</p>
              <p className="text-sm text-gray-500 mt-1">out of {result.total} rows in your CSV</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-green-600">{result.imported}</p>
                <p className="text-xs text-green-700">Imported</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-red-500">{result.errors?.length || 0}</p>
                <p className="text-xs text-red-600">Errors</p>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div className="text-left bg-red-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-red-700 mb-2">Errors:</p>
                {result.errors.slice(0, 10).map((e, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-start gap-1">
                    <AlertCircle size={11} className="mt-0.5 shrink-0" />
                    {e}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          {step === 'done' ? 'Close' : 'Cancel'}
        </Button>
        {step === 'upload' && (
          <Button
            variant="gradient"
            loading={loading}
            disabled={!file}
            onClick={handleImport}
            leftIcon={<Upload size={14} />}
          >
            Import Contacts
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

export default ImportModal
