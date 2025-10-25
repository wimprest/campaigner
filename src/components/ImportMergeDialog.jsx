import React from 'react'
import { AlertCircle, FileJson, FilePlus, RefreshCw } from 'lucide-react'

export default function ImportMergeDialog({
  isOpen,
  onClose,
  onReplace,
  onAppend,
  importData
}) {
  if (!isOpen || !importData) return null

  const { campaignName, nodes, edges } = importData

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileJson className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900">Import Campaign</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                You're importing:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {campaignName || 'Untitled Campaign'}
                </div>
                <div className="text-xs text-gray-600">
                  {nodes?.length || 0} nodes, {edges?.length || 0} connections
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <strong>Choose how to import:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• <strong>Replace:</strong> Clear current canvas and load imported campaign</li>
                    <li>• <strong>Append:</strong> Add imported nodes to existing campaign</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onReplace}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Replace Current
              </button>
              <button
                onClick={onAppend}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Append to Current
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
