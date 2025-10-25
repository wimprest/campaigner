import React, { useState } from 'react'
import { Mail, AlertCircle, X, FileText } from 'lucide-react'
import { parseBulkEmails } from '../utils/emailParser'
import ReactMarkdown from 'react-markdown'

export default function SingleEmailImportDialog({ isOpen, onClose, onImport }) {
  const [pastedText, setPastedText] = useState('')
  const [parseResult, setParseResult] = useState(null)

  if (!isOpen) return null

  const handleParse = () => {
    const result = parseBulkEmails(pastedText)

    if (result.errors.length > 0) {
      setParseResult(result)
      return
    }

    if (result.emails.length === 0) {
      setParseResult({ emails: [], errors: ['No email found. Make sure to include === EMAIL START === and === EMAIL END === delimiters.'] })
      return
    }

    if (result.emails.length > 1) {
      setParseResult({ emails: [], errors: ['Multiple emails detected. This dialog only imports one email at a time. Use "Import Emails (Bulk)" from the Open menu to import multiple emails.'] })
      return
    }

    // Success - single email parsed
    onImport(result.emails[0])
    setPastedText('')
    setParseResult(null)
    onClose()
  }

  const handleClose = () => {
    setPastedText('')
    setParseResult(null)
    onClose()
  }

  const exampleFormat = `=== EMAIL START ===
TITLE: Welcome Email
DESCRIPTION: First touchpoint in onboarding
SUBJECT_A: Welcome to our platform!
SUBJECT_B: Get started today
SUBJECT_C: Your account is ready
CONTENT:
<p>Hi {{firstName}},</p>
<p>Welcome! Here's what you can do next:</p>
<ul>
  <li>Complete your profile</li>
  <li>Explore features</li>
</ul>
NOTES: Send immediately after signup
=== EMAIL END ===`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900">Import Email</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Instructions */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Paste a single formatted email below to update this node:
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
                    <strong>This will update the current email node with:</strong>
                    <ul className="mt-1 space-y-0.5 ml-4 list-disc">
                      <li>Title, Description, Subject lines (A/B/C)</li>
                      <li>Email content (HTML)</li>
                      <li>Internal notes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Paste area */}
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your formatted email here..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Errors */}
            {parseResult && parseResult.errors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleParse}
              disabled={!pastedText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import & Update
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
