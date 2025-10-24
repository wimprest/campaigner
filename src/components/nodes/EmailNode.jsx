import React from 'react'
import { Handle, Position } from 'reactflow'
import { Mail } from 'lucide-react'

export default function EmailNode({ data, selected }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all ${
      selected ? 'border-blue-500 ring-8 ring-blue-500 ring-opacity-75 shadow-2xl scale-105' : 'border-blue-300'
    } min-w-[200px] max-w-[250px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="bg-blue-500 text-white px-3 py-2 rounded-t-lg flex items-center">
        <Mail className="w-4 h-4 mr-2" />
        <span className="font-medium text-sm">Email</span>
      </div>

      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm mb-1">
          {data.label || 'Email Node'}
        </div>

        {/* A/B/C Test Badge and Subjects */}
        {data.subjectVariants && data.subjectVariants.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-300">
                A/B/C Test
              </span>
              <span className="text-xs text-gray-500">
                {data.subjectVariants.filter(v => v.subject).length}/3
              </span>
            </div>
            {data.subjectVariants.filter(v => v.subject).length > 0 ? (
              <div className="space-y-0.5">
                {data.subjectVariants.slice(0, 2).map(variant => {
                  if (!variant.subject) return null
                  const colors = {
                    A: 'text-blue-600',
                    B: 'text-green-600',
                    C: 'text-purple-600'
                  }
                  return (
                    <div key={variant.id} className="text-xs text-gray-700 flex items-start">
                      <span className={`font-bold ${colors[variant.id]} mr-1 flex-shrink-0`}>
                        {variant.id}:
                      </span>
                      <span className="line-clamp-1">{variant.subject}</span>
                    </div>
                  )
                })}
                {data.subjectVariants.filter(v => v.subject).length > 2 && (
                  <div className="text-xs text-gray-500 italic">
                    +{data.subjectVariants.filter(v => v.subject).length - 2} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">
                No subjects set yet
              </div>
            )}
          </div>
        ) : (
          // Legacy single subject display
          data.subject && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Subject:</span> {data.subject}
            </div>
          )
        )}

        {data.description && (
          <div className="text-xs text-gray-500 mt-2 line-clamp-2">
            {data.description}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}
