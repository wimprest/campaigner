import React from 'react'
import { Handle, Position } from 'reactflow'
import { Zap } from 'lucide-react'

export default function ActionNode({ data, selected }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all ${
      selected ? 'border-orange-500 ring-4 ring-orange-500 ring-opacity-50 shadow-xl scale-105' : 'border-orange-300'
    } min-w-[200px] max-w-[250px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="bg-orange-500 text-white px-3 py-2 rounded-t-lg flex items-center">
        <Zap className="w-4 h-4 mr-2" />
        <span className="font-medium text-sm">Action</span>
      </div>

      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm mb-1">
          {data.label || 'Action Node'}
        </div>
        {data.actionType && (
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-medium">Type:</span> {data.actionType}
          </div>
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
