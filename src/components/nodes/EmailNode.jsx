import React from 'react'
import { Handle, Position } from 'reactflow'
import { Mail } from 'lucide-react'

export default function EmailNode({ data, selected }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${
      selected ? 'border-blue-500' : 'border-blue-300'
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
        {data.subject && (
          <div className="text-xs text-gray-600 mb-1">
            <span className="font-medium">Subject:</span> {data.subject}
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
