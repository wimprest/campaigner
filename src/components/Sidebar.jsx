import React from 'react'
import { Mail, HelpCircle, GitBranch, Zap, Clock } from 'lucide-react'

const nodeTypeConfig = [
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    color: 'bg-blue-500',
    description: 'Send an email to contacts'
  },
  {
    type: 'survey',
    label: 'Survey',
    icon: HelpCircle,
    color: 'bg-green-500',
    description: 'Ask a question with multiple options'
  },
  {
    type: 'conditional',
    label: 'Conditional',
    icon: GitBranch,
    color: 'bg-purple-500',
    description: 'Branch based on conditions'
  },
  {
    type: 'action',
    label: 'Action',
    icon: Zap,
    color: 'bg-orange-500',
    description: 'Perform a generic action'
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    color: 'bg-red-500',
    description: 'Wait before continuing'
  }
]

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Node Types</h2>
      <div className="space-y-3">
        {nodeTypeConfig.map((node) => {
          const Icon = node.icon
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className="flex items-start p-3 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-move hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className={`${node.color} p-2 rounded-lg mr-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{node.label}</h3>
                <p className="text-xs text-gray-600 mt-1">{node.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 text-sm mb-2">How to use</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Drag nodes onto the canvas</li>
          <li>• Connect nodes by dragging from handles</li>
          <li>• Click nodes to edit content</li>
          <li>• Use controls to zoom/pan</li>
        </ul>
      </div>
    </aside>
  )
}
