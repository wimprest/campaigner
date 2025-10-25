import React, { useState } from 'react'
import { Mail, AlertCircle, CheckCircle, X, FileText } from 'lucide-react'
import { parseBulkEmails } from '../utils/emailParser'
import ReactMarkdown from 'react-markdown'

export default function BulkEmailImportDialog({ isOpen, onClose, onImport }) {
  const [pastedText, setPastedText] = useState('')
  const [parseResult, setParseResult] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  if (!isOpen) return null

  const handleParse = () => {
    const result = parseBulkEmails(pastedText)
    setParseResult(result)
    setShowPreview(true)
  }

  const handleImport = () => {
    if (parseResult && parseResult.emails.length > 0) {
      onImport(parseResult.emails)
      setPastedText('')
      setParseResult(null)
      setShowPreview(false)
      onClose()
    }
  }

  const handleBack = () => {
    setShowPreview(false)
  }

  const exampleFormat = `=== EMAIL START ===
TITLE: Welcome Email
DESCRIPTION: First touchpoint in the onboarding series. Focuses on:
- Value proposition
- Quick wins
- Community connection
SUBJECT_A: Welcome to our platform!
SUBJECT_B: Get started with your new account
SUBJECT_C: Your account is ready!
CONTENT:
<p>Hi {{firstName}},</p>
<p>Welcome to our platform! We're excited to have you.</p>
<p><strong>Here's what you can do next:</strong></p>
<ul>
  <li>Complete your profile</li>
  <li>Explore our features</li>
</ul>
NOTES: **Send timing:** Immediately after signup

**Key points:**
1. Keep it warm and welcoming
2. Focus on immediate value
=== EMAIL END ===`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900">
                {showPreview ? 'Preview Imported Emails' : 'Import Emails (Bulk)'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!showPreview ? (
              <>
                {/* Instructions */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Paste your formatted email content below. Each email should follow this structure:
                  </p>
                  <details className="mb-4">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                      Show example format
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-xs overflow-x-auto">
                      {exampleFormat}
                    </pre>
                  </details>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <strong>Supported fields:</strong>
                        <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                          <li><strong>TITLE:</strong> Email name (required)</li>
                          <li><strong>DESCRIPTION:</strong> Details (optional, markdown supported)</li>
                          <li><strong>SUBJECT_A:</strong> First subject line (required)</li>
                          <li><strong>SUBJECT_B/C:</strong> A/B test variants (optional)</li>
                          <li><strong>CONTENT:</strong> Email HTML (required)</li>
                          <li><strong>NOTES:</strong> Internal notes (optional, markdown supported)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paste area */}
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your formatted emails here..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </>
            ) : (
              <>
                {/* Parse results */}
                {parseResult.errors.length > 0 && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-red-800">
                        <strong>Errors found:</strong>
                        <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                          {parseResult.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {parseResult.emails.length > 0 && (
                  <>
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">
                          Successfully parsed {parseResult.emails.length} email{parseResult.emails.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Preview emails */}
                    <div className="space-y-4">
                      {parseResult.emails.map((email, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center mb-3">
                            <Mail className="w-4 h-4 text-blue-600 mr-2" />
                            <h3 className="font-bold text-gray-900">{email.title}</h3>
                          </div>

                          {email.description && (
                            <div className="mb-3">
                              <div className="text-xs font-medium text-gray-500 mb-1">Description:</div>
                              <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                                <ReactMarkdown>{email.description}</ReactMarkdown>
                              </div>
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 mb-1">Subject Lines:</div>
                            <div className="space-y-1">
                              {email.subjectA && (
                                <div className="text-sm">
                                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium mr-2">A</span>
                                  {email.subjectA}
                                </div>
                              )}
                              {email.subjectB && (
                                <div className="text-sm">
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium mr-2">B</span>
                                  {email.subjectB}
                                </div>
                              )}
                              {email.subjectC && (
                                <div className="text-sm">
                                  <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium mr-2">C</span>
                                  {email.subjectC}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 mb-1">Content Preview:</div>
                            <div className="text-sm text-gray-700 line-clamp-3 bg-white p-2 rounded border border-gray-200">
                              <div dangerouslySetInnerHTML={{ __html: email.content }} />
                            </div>
                          </div>

                          {email.notes && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-1">Internal Notes:</div>
                              <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                                <ReactMarkdown>{email.notes}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            {!showPreview ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParse}
                  disabled={!pastedText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Parse & Preview
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleImport}
                  disabled={!parseResult || parseResult.emails.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {parseResult?.emails.length || 0} Email{parseResult?.emails.length !== 1 ? 's' : ''}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
