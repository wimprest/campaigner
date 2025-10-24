import React from 'react'
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

export default function ValidationPanel({ isOpen, onClose, validationResults, onIssueClick }) {
  if (!isOpen) return null

  const { isEmpty, isValid, summary, issues, nodeCount, edgeCount } = validationResults

  // Group issues by severity
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const info = issues.filter(i => i.severity === 'info')

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
      default:
        return <Info className="w-4 h-4 text-gray-600 flex-shrink-0" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-orange-50 border-orange-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      orphaned: 'Orphaned Node',
      unreachable: 'Unreachable Node',
      dead_end: 'Dead End',
      missing_content: 'Missing Content',
      disconnected_path: 'Disconnected Path',
      entry_point: 'Entry Point'
    }
    return labels[type] || type
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Validation</h2>
            <p className="text-sm text-gray-600 mt-1">
              {nodeCount} nodes, {edgeCount} connections analyzed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close validation panel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-b border-gray-200">
          {isEmpty ? (
            <div className="flex items-center space-x-3 text-gray-600">
              <Info className="w-5 h-5" />
              <span className="text-sm">Campaign is empty. Add nodes to get started.</span>
            </div>
          ) : isValid && summary.total === 0 ? (
            <div className="flex items-center space-x-3 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <div>
                <div className="font-semibold">No issues found!</div>
                <div className="text-sm text-green-600">Your campaign structure looks good.</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-700">{summary.errors}</div>
                <div className="text-xs text-red-600 mt-1">Errors</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-700">{summary.warnings}</div>
                <div className="text-xs text-orange-600 mt-1">Warnings</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-700">{summary.info}</div>
                <div className="text-xs text-blue-600 mt-1">Info</div>
              </div>
            </div>
          )}
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty || (isValid && summary.total === 0) ? (
            <div className="text-center py-12 text-gray-500">
              {isEmpty ? (
                <>
                  <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Add nodes to your campaign to see validation results.</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>Everything looks good!</p>
                  <p className="text-sm mt-2">Your campaign has no structural issues.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Errors Section */}
              {errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-red-700 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Errors ({errors.length})
                  </h3>
                  <div className="space-y-2">
                    {errors.map((issue, idx) => (
                      <div
                        key={idx}
                        onClick={() => onIssueClick(issue.nodeId)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${getSeverityColor(issue.severity)}`}
                        title="Click to open this node for editing"
                      >
                        <div className="flex items-start space-x-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-300">
                                {getTypeLabel(issue.type)}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-gray-900">
                                  {issue.nodeLabel}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                  ({issue.nodeId})
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings Section */}
              {warnings.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-orange-700 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Warnings ({warnings.length})
                  </h3>
                  <div className="space-y-2">
                    {warnings.map((issue, idx) => (
                      <div
                        key={idx}
                        onClick={() => onIssueClick(issue.nodeId)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${getSeverityColor(issue.severity)}`}
                        title="Click to open this node for editing"
                      >
                        <div className="flex items-start space-x-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-300">
                                {getTypeLabel(issue.type)}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-gray-900">
                                  {issue.nodeLabel}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                  ({issue.nodeId})
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Section */}
              {info.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-blue-700 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Information ({info.length})
                  </h3>
                  <div className="space-y-2">
                    {info.map((issue, idx) => (
                      <div
                        key={idx}
                        onClick={() => onIssueClick(issue.nodeId)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${getSeverityColor(issue.severity)}`}
                        title="Click to open this node for editing"
                      >
                        <div className="flex items-start space-x-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-300">
                                {getTypeLabel(issue.type)}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-gray-900">
                                  {issue.nodeLabel}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                  ({issue.nodeId})
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {summary.total > 0 ? (
                <span>💡 <strong>Tip:</strong> Click any issue to open that node for editing.</span>
              ) : (
                <span>Validation checks structure, connections, and content completeness.</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
