import React from 'react'
import { Handle, Position } from 'reactflow'
import { GitBranch } from 'lucide-react'

export default function ConditionalNode({ data, selected }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all ${
      selected ? 'border-purple-500 ring-4 ring-purple-500 ring-opacity-50 shadow-xl scale-105' : 'border-purple-300'
    } min-w-[200px] max-w-[250px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="bg-purple-500 text-white px-3 py-2 rounded-t-lg flex items-center">
        <GitBranch className="w-4 h-4 mr-2" />
        <span className="font-medium text-sm">Conditional</span>
      </div>

      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm mb-1">
          {data.label || 'Conditional Node'}
        </div>
        {data.condition && (
          <div className="text-xs text-gray-600 mb-2">
            <span className="font-medium">If:</span> {data.condition}
          </div>
        )}
        <div className="flex justify-between text-xs mt-2">
          {data.truePath && (
            <div className="flex-1 mr-1">
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                ✓ {data.truePath}
              </div>
            </div>
          )}
          {data.falsePath && (
            <div className="flex-1 ml-1">
              <div className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                ✗ {data.falsePath}
              </div>
            </div>
          )}
        </div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-2 line-clamp-2">
            {data.description}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3" style={{ left: '33%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3" style={{ left: '66%' }} />
    </div>
  )
}
