import React from 'react'
import { Handle, Position } from 'reactflow'
import { HelpCircle } from 'lucide-react'

export default function SurveyNode({ data, selected }) {
  const responsePaths = data.responsePaths || []
  const questions = data.questions || []

  // Get all response options from all questions
  const allResponseOptions = questions.flatMap(q => q.responseOptions || [])

  // Get first question for preview
  const firstQuestion = questions[0]

  // Calculate handle positions based on number of paths
  const getHandlePosition = (index, total) => {
    if (total === 1) return 50
    const spacing = 80 / (total + 1)
    return 10 + spacing * (index + 1)
  }

  const questionTypeLabels = {
    radio: 'Radio',
    text: 'Text Input',
    range: 'Range',
    checkbox: 'Checkbox'
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all ${
      selected ? 'border-green-500 ring-4 ring-green-500 ring-opacity-50 shadow-xl scale-105' : 'border-green-300'
    } min-w-[220px] max-w-[280px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="bg-green-500 text-white px-3 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <HelpCircle className="w-4 h-4 mr-2" />
          <span className="font-medium text-sm">Survey</span>
        </div>
        <span className="text-xs bg-green-600 px-2 py-0.5 rounded">
          {questions.length} Question{questions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm mb-1">
          {data.label || 'Survey Node'}
        </div>
        {firstQuestion && firstQuestion.text && (
          <div className="text-xs text-gray-600 mb-2">
            <span className="font-medium">Q1:</span> {firstQuestion.text}
            {questions.length > 1 && (
              <span className="text-gray-500 ml-1">(+{questions.length - 1} more)</span>
            )}
          </div>
        )}
        {allResponseOptions.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {allResponseOptions.length} total option{allResponseOptions.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Show response paths */}
        {responsePaths.length > 0 && (
          <div className="mt-2 space-y-1">
            {responsePaths.map((path) => {
              const optionCount = path.mappedOptions?.length || 0
              const hasScoreThresholds = (path.scoreMin !== null && path.scoreMin !== undefined) ||
                                         (path.scoreMax !== null && path.scoreMax !== undefined)
              const hasAdvancedRules = path.advancedRules?.enabled

              return (
                <div
                  key={path.id}
                  className="flex items-center justify-between text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${path.color}20`,
                    borderLeft: `3px solid ${path.color}`
                  }}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="font-medium text-gray-800 truncate">
                      {path.label}
                    </span>
                    <div className="flex items-center ml-1 space-x-1">
                      {hasAdvancedRules && (
                        <span
                          className="px-1 py-0.5 bg-purple-500 text-white rounded text-xs font-bold"
                          title="Advanced AND/OR/NOT logic rules enabled"
                        >
                          🧠
                        </span>
                      )}
                      {hasScoreThresholds && (
                        <span
                          className="px-1 py-0.5 bg-blue-500 text-white rounded text-xs font-bold"
                          title={`Score range: ${path.scoreMin ?? '−∞'} to ${path.scoreMax ?? '+∞'}`}
                        >
                          🎯
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs ml-1 flex-shrink-0">
                    ({optionCount})
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {data.description && (
          <div className="text-xs text-gray-500 mt-2 line-clamp-2">
            {data.description}
          </div>
        )}
      </div>

      {/* Dynamic output handles - one per response path */}
      {responsePaths.map((path, index) => (
        <Handle
          key={path.id}
          type="source"
          position={Position.Bottom}
          id={path.id}
          className="w-3 h-3"
          style={{
            left: `${getHandlePosition(index, responsePaths.length)}%`,
            backgroundColor: path.color
          }}
        />
      ))}
    </div>
  )
}
