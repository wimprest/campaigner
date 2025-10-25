import React from 'react'
import { X, Clock, Download, RotateCcw, Trash2, FileJson, Package } from 'lucide-react'

export default function VersionHistoryPanel({
  isOpen,
  onClose,
  versions,
  onRestore,
  onDelete,
  onExport,
  onExportAll
}) {
  if (!isOpen) return null

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatFileSize = (nodes, edges) => {
    // Rough estimate of data size
    const estimate = JSON.stringify({ nodes, edges }).length
    if (estimate < 1024) return `${estimate} bytes`
    if (estimate < 1024 * 1024) return `${(estimate / 1024).toFixed(1)} KB`
    return `${(estimate / (1024 * 1024)).toFixed(1)} MB`
  }

  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Version History</h2>
            <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              {versions.length} {versions.length === 1 ? 'version' : 'versions'}
            </span>
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
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm mb-2">No saved versions yet</p>
              <p className="text-gray-400 text-xs">
                Click "Save Version" in the toolbar to create a snapshot of your campaign
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedVersions.map((version, index) => (
                <div
                  key={version.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {version.name}
                        </h3>
                        {index === 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(version.timestamp)}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                    <div className="bg-gray-50 rounded px-2 py-1.5">
                      <div className="text-gray-500 mb-0.5">Campaign</div>
                      <div className="font-medium text-gray-900 truncate" title={version.campaignName}>
                        {version.campaignName || 'Untitled'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded px-2 py-1.5">
                      <div className="text-gray-500 mb-0.5">Nodes</div>
                      <div className="font-medium text-gray-900">{version.nodeCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded px-2 py-1.5">
                      <div className="text-gray-500 mb-0.5">Edges</div>
                      <div className="font-medium text-gray-900">{version.edgeCount}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRestore(version.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium"
                      title="Restore this version"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => onExport(version.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                      title="Export this version as JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => onDelete(version.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                      title="Delete this version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {versions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Versions are stored locally in your browser
              </div>
              <button
                onClick={onExportAll}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Package className="w-4 h-4" />
                <span>Export All Versions</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
