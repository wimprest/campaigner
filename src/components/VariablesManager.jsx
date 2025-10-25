import React, { useState } from 'react'
import { X, Plus, Edit2, Trash2, Variable, Check } from 'lucide-react'
import toast from 'react-hot-toast'

// Common variable presets
const COMMON_PRESETS = [
  { name: 'firstName', defaultValue: 'John', description: "Recipient's first name" },
  { name: 'lastName', defaultValue: 'Doe', description: "Recipient's last name" },
  { name: 'email', defaultValue: 'john@example.com', description: "Recipient's email address" },
  { name: 'company', defaultValue: 'Acme Inc', description: "Recipient's company name" },
  { name: 'phone', defaultValue: '555-0123', description: "Recipient's phone number" },
  { name: 'jobTitle', defaultValue: 'Manager', description: "Recipient's job title" },
  { name: 'city', defaultValue: 'New York', description: "Recipient's city" },
  { name: 'country', defaultValue: 'USA', description: "Recipient's country" },
]

export default function VariablesManager({ isOpen, onClose, variables, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', defaultValue: '', description: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  if (!isOpen) return null

  const handleAdd = () => {
    if (!editForm.name.trim()) {
      toast.error('Variable name is required')
      return
    }

    // Check for duplicate names
    if (variables.some(v => v.name === editForm.name.trim())) {
      toast.error('Variable name already exists')
      return
    }

    // Validate variable name (alphanumeric and underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(editForm.name.trim())) {
      toast.error('Variable name must start with a letter and contain only letters, numbers, and underscores')
      return
    }

    const newVariable = {
      id: Date.now().toString(),
      name: editForm.name.trim(),
      defaultValue: editForm.defaultValue.trim(),
      description: editForm.description.trim()
    }

    onUpdate([...variables, newVariable])
    setEditForm({ name: '', defaultValue: '', description: '' })
    setIsAdding(false)
    toast.success(`Variable "{{${newVariable.name}}}" created!`)
  }

  const handleUpdate = () => {
    if (!editForm.name.trim()) {
      toast.error('Variable name is required')
      return
    }

    // Check for duplicate names (excluding current)
    if (variables.some(v => v.id !== editingId && v.name === editForm.name.trim())) {
      toast.error('Variable name already exists')
      return
    }

    // Validate variable name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(editForm.name.trim())) {
      toast.error('Variable name must start with a letter and contain only letters, numbers, and underscores')
      return
    }

    const updatedVariables = variables.map(v =>
      v.id === editingId
        ? { ...v, name: editForm.name.trim(), defaultValue: editForm.defaultValue.trim(), description: editForm.description.trim() }
        : v
    )

    onUpdate(updatedVariables)
    setEditingId(null)
    setEditForm({ name: '', defaultValue: '', description: '' })
    toast.success('Variable updated!')
  }

  const handleDelete = (id) => {
    const variable = variables.find(v => v.id === id)
    if (window.confirm(`Delete variable "{{${variable.name}}}"?\n\nThis will not remove it from existing emails.`)) {
      onUpdate(variables.filter(v => v.id !== id))
      toast.success('Variable deleted')
    }
  }

  const startEdit = (variable) => {
    setEditingId(variable.id)
    setEditForm({ name: variable.name, defaultValue: variable.defaultValue, description: variable.description })
    setIsAdding(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setEditForm({ name: '', defaultValue: '', description: '' })
  }

  const addPreset = (preset) => {
    if (variables.some(v => v.name === preset.name)) {
      toast.error(`Variable "{{${preset.name}}}" already exists`)
      return
    }

    const newVariable = {
      id: Date.now().toString(),
      ...preset
    }

    onUpdate([...variables, newVariable])
    toast.success(`Variable "{{${preset.name}}}" added!`)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <Variable className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900">Campaign Variables</h2>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {variables.length} variable{variables.length !== 1 ? 's' : ''}
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
            {/* Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Variables</strong> let you personalize emails. Use <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">{'{{'}</code>variableName<code className="px-1 py-0.5 bg-blue-100 rounded text-xs">{'}}'}</code> in email content.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Example: "Hi <code className="px-1 py-0.5 bg-blue-100 rounded">{'{{'}</code>firstName<code className="px-1 py-0.5 bg-blue-100 rounded">{'}}'}</code>" → "Hi John"
              </p>
            </div>

            {/* Add New / Common Presets Toggle */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => {
                  setIsAdding(true)
                  setEditingId(null)
                  setShowPresets(false)
                  setEditForm({ name: '', defaultValue: '', description: '' })
                }}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Variable
              </button>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {showPresets ? 'Hide' : 'Show'} Common Presets ({COMMON_PRESETS.length})
              </button>
            </div>

            {/* Common Presets */}
            {showPresets && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Common Presets:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => addPreset(preset)}
                      disabled={variables.some(v => v.name === preset.name)}
                      className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                        variables.some(v => v.name === preset.name)
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="font-medium text-xs">
                        {variables.some(v => v.name === preset.name) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {'{{'}{preset.name}{'}}'}
                      </div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Form */}
            {isAdding && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Variable</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variable Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g., firstName, companyName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use: {'{{'}{editForm.name || 'variableName'}{'}}'}  in emails</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Default Value
                    </label>
                    <input
                      type="text"
                      value={editForm.defaultValue}
                      onChange={(e) => setEditForm({ ...editForm, defaultValue: e.target.value })}
                      placeholder="e.g., John"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="e.g., Customer's first name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={handleAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Add Variable
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Variables List */}
            {variables.length === 0 && !isAdding ? (
              <div className="text-center py-8 text-gray-500">
                <Variable className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No variables defined yet</p>
                <p className="text-xs mt-1">Click "Add Variable" or use common presets to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {variables.map(variable => (
                  <div
                    key={variable.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      editingId === variable.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {editingId === variable.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Variable Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Default Value
                          </label>
                          <input
                            type="text"
                            value={editForm.defaultValue}
                            onChange={(e) => setEditForm({ ...editForm, defaultValue: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleUpdate}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <code className="px-2 py-1 bg-gray-100 text-blue-600 rounded text-sm font-mono font-semibold">
                              {'{{'}{variable.name}{'}}'}
                            </code>
                            {variable.defaultValue && (
                              <span className="ml-2 text-xs text-gray-500">
                                → {variable.defaultValue}
                              </span>
                            )}
                          </div>
                          {variable.description && (
                            <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <button
                            onClick={() => startEdit(variable)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit variable"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(variable.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete variable"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Variables are saved with your campaign and exported in JSON files
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
