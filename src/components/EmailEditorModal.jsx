import React, { useState, useEffect, useRef } from 'react'
import { X, Mail, Settings, Plus, Edit, Trash2, Save, AlertCircle, Variable, Eye, ChevronDown } from 'lucide-react'
import {
  getTemplateList,
  getTemplate,
  addCustomTemplate,
  updateTemplate,
  deleteCustomTemplate,
  isCustomTemplate,
  getAllTemplates
} from '../utils/emailTemplates'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import toast from 'react-hot-toast'

export default function EmailEditorModal({ isOpen, node, onSave, onClose, variables = [] }) {
  const [localData, setLocalData] = useState(node.data)
  const [emailEditMode, setEmailEditMode] = useState('visual')
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [templates, setTemplates] = useState(getTemplateList())
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({ key: '', name: '', description: '', mjml: '', visualContent: '' })
  const [templateEditMode, setTemplateEditMode] = useState('code')
  const [showVariableDropdown, setShowVariableDropdown] = useState(false)
  const [emailPreviewMode, setEmailPreviewMode] = useState(false)
  const quillRef = useRef(null)

  useEffect(() => {
    setLocalData(node.data)
  }, [node])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Variable insertion for email editor
  const insertVariable = (variableName) => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      const selection = quill.getSelection()
      const cursorPosition = selection ? selection.index : quill.getLength()
      quill.insertText(cursorPosition, `{{${variableName}}}`)
      quill.setSelection(cursorPosition + variableName.length + 4)
    }
    setShowVariableDropdown(false)
    toast.success(`Variable {{${variableName}}} inserted!`)
  }

  // Replace variables with default values for preview
  const replaceVariablesWithDefaults = (content) => {
    if (!content) return content
    let previewContent = content
    variables.forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g')
      previewContent = previewContent.replace(regex, variable.defaultValue || `{{${variable.name}}}`)
    })
    return previewContent
  }

  const loadEmailTemplate = (templateKey) => {
    const template = getTemplate(templateKey)
    if (template) {
      setLocalData((prev) => ({
        ...prev,
        mjmlTemplate: template.mjml,
        emailTemplate: templateKey
      }))
    }
  }

  const handleSave = () => {
    onSave(localData)
  }

  const refreshTemplates = () => {
    setTemplates(getTemplateList())
  }

  const extractTextFromMJML = (mjml) => {
    // Extract text content from MJML tags, preserving structure with proper spacing
    if (!mjml) return ''

    let text = mjml

    // Convert mj-text to paragraphs with proper spacing
    text = text.replace(/<mj-text[^>]*>/gi, '<p style="margin-bottom: 1em;">')
    text = text.replace(/<\/mj-text>/gi, '</p>')

    // Convert mj-button to styled links (like buttons)
    text = text.replace(/<mj-button[^>]*href="([^"]*)"[^>]*>/gi, '<p style="margin: 1.5em 0;"><a href="$1" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">')
    text = text.replace(/<\/mj-button>/gi, '</a></p>')

    // Convert mj-divider to horizontal rule with spacing
    text = text.replace(/<mj-divider[^>]*>/gi, '<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e0e0;">')

    // Convert list items
    text = text.replace(/<mj-list>/gi, '<ul style="margin: 1em 0; padding-left: 20px;">')
    text = text.replace(/<\/mj-list>/gi, '</ul>')
    text = text.replace(/<mj-li[^>]*>/gi, '<li style="margin: 0.5em 0;">')
    text = text.replace(/<\/mj-li>/gi, '</li>')

    // Add section breaks with visual spacing
    text = text.replace(/<mj-section[^>]*>/gi, '<div style="margin-bottom: 2em;">')
    text = text.replace(/<\/mj-section>/gi, '</div>')

    // Remove MJML wrapper tags
    text = text.replace(/<\/?mjml>/gi, '')
    text = text.replace(/<\/?mj-body[^>]*>/gi, '')
    text = text.replace(/<\/?mj-column[^>]*>/gi, '')

    // Remove other MJML tags but keep content
    text = text.replace(/<mj-[^>]*>/gi, '')
    text = text.replace(/<\/mj-[^>]*>/gi, '')

    // Clean up extra whitespace while preserving HTML structure
    text = text.replace(/>\s+</g, '><')
    text = text.trim()

    return text
  }

  const handleEditTemplate = (templateKey) => {
    const template = getTemplate(templateKey)
    if (template) {
      const hasMJML = template.mjml.includes('<mjml>')
      setTemplateForm({
        key: templateKey,
        name: template.name,
        description: template.description,
        mjml: template.mjml,
        visualContent: hasMJML ? extractTextFromMJML(template.mjml) : template.mjml
      })
      setEditingTemplate(templateKey)
      // Start in code mode for existing templates (likely have MJML)
      setTemplateEditMode(hasMJML ? 'code' : 'visual')
    }
  }

  const handleNewTemplate = () => {
    setTemplateForm({
      key: '',
      name: '',
      description: '',
      mjml: '', // Start blank for code mode
      visualContent: '' // Start blank for visual mode
    })
    setEditingTemplate('new')
    setTemplateEditMode('visual') // Start in visual mode for new templates
  }

  const handleTemplateModeSwitch = (newMode) => {
    if (newMode === 'visual' && templateEditMode === 'code' && templateForm.mjml) {
      // Switching from code to visual - extract text from MJML
      const visualContent = extractTextFromMJML(templateForm.mjml)
      setTemplateForm({ ...templateForm, visualContent })
    } else if (newMode === 'code' && templateEditMode === 'visual' && templateForm.visualContent && !templateForm.mjml.includes('<mjml>')) {
      // Switching from visual to code - wrap in basic MJML if needed
      if (templateForm.visualContent.trim()) {
        const mjml = `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        ${templateForm.visualContent}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
        setTemplateForm({ ...templateForm, mjml })
      }
    }
    setTemplateEditMode(newMode)
  }

  const handleSaveTemplate = () => {
    if (!templateForm.key || !templateForm.name) {
      toast.error('Template key and name are required')
      return
    }

    // Save the appropriate content based on current mode
    let mjmlContent = templateForm.mjml

    // If in visual mode and no MJML code exists, convert visual to MJML
    if (templateEditMode === 'visual') {
      if (!mjmlContent || !mjmlContent.includes('<mjml>')) {
        mjmlContent = `<mjml>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        ${templateForm.visualContent || ''}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
      }
    }

    const templateData = {
      name: templateForm.name,
      description: templateForm.description,
      mjml: mjmlContent
    }

    if (editingTemplate === 'new') {
      // Check if key already exists
      if (getTemplate(templateForm.key)) {
        toast.error('A template with this key already exists')
        return
      }
      addCustomTemplate(templateForm.key, templateData)
    } else {
      updateTemplate(templateForm.key, templateData)
    }

    refreshTemplates()
    setEditingTemplate(null)
    setTemplateForm({ key: '', name: '', description: '', mjml: '', visualContent: '' })
    setTemplateEditMode('code') // Reset to default
  }

  const handleDeleteTemplate = (templateKey) => {
    if (!isCustomTemplate(templateKey)) {
      toast.error('Cannot delete default templates. You can only delete custom templates.')
      return
    }

    if (confirm(`Are you sure you want to delete the template "${getTemplate(templateKey)?.name}"?`)) {
      deleteCustomTemplate(templateKey)
      refreshTemplates()
    }
  }

  const handleCancelEdit = () => {
    setEditingTemplate(null)
    setTemplateForm({ key: '', name: '', description: '', mjml: '', visualContent: '' })
    setTemplateEditMode('code') // Reset to default
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Large Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Edit Email</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!showTemplateManager && !editingTemplate && (
              <>
                {/* Email Template Selector */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      <label className="text-sm font-medium text-blue-900">
                        Email Template
                      </label>
                    </div>
                    <button
                      onClick={() => setShowTemplateManager(true)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                  </div>
                  <select
                    value={localData.emailTemplate || 'blank'}
                    onChange={(e) => loadEmailTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    {templates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label} - {template.description} {template.isCustom ? '(Custom)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-700 mt-2">
                    Select a professional MJML template. The template will be exported as HTML for email platforms.
                  </p>
                </div>

            {/* Email Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={localData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email subject..."
              />
            </div>

            {/* MJML Template Editor */}
            {localData.mjmlTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MJML Template Code
                </label>
                <textarea
                  value={localData.mjmlTemplate || ''}
                  onChange={(e) => handleChange('mjmlTemplate', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                  placeholder="<mjml>...</mjml>"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Edit MJML code directly. Variables: {'{{'} firstName {'}}'}, {'{{'} ctaLink {'}}'}\
                </p>
              </div>
            )}

            {/* Email Content Editor with Visual/Code Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Content {!localData.mjmlTemplate && '(used if no template selected)'}
                </label>
                <div className="flex items-center space-x-2">
                  {/* Insert Variable Dropdown */}
                  {emailEditMode === 'visual' && (
                    <div className="relative">
                      <button
                        onClick={() => setShowVariableDropdown(!showVariableDropdown)}
                        className="flex items-center px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                        title="Insert variable"
                      >
                        <Variable className="w-3.5 h-3.5 mr-1" />
                        Insert Variable
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </button>

                      {showVariableDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowVariableDropdown(false)}
                          />
                          <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-64 overflow-y-auto">
                            {variables.length === 0 ? (
                              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                                <Variable className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                No variables defined yet
                                <div className="mt-1 text-gray-400">Click Variables button in toolbar</div>
                              </div>
                            ) : (
                              <>
                                <div className="px-3 py-1 text-xs font-semibold text-gray-500 border-b border-gray-200">
                                  Click to insert:
                                </div>
                                {variables.map(variable => (
                                  <button
                                    key={variable.id}
                                    onClick={() => insertVariable(variable.name)}
                                    className="w-full text-left px-3 py-2 hover:bg-teal-50 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <code className="text-xs font-mono text-teal-700 font-semibold">
                                        {'{{'}{variable.name}{'}}'}
                                      </code>
                                      {variable.defaultValue && (
                                        <span className="text-xs text-gray-400">
                                          → {variable.defaultValue.length > 15 ? variable.defaultValue.substring(0, 15) + '...' : variable.defaultValue}
                                        </span>
                                      )}
                                    </div>
                                    {variable.description && (
                                      <div className="text-xs text-gray-500 mt-0.5">{variable.description}</div>
                                    )}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Preview Toggle */}
                  {variables.length > 0 && (
                    <button
                      onClick={() => setEmailPreviewMode(!emailPreviewMode)}
                      className={`flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                        emailPreviewMode
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                      }`}
                      title={emailPreviewMode ? 'Exit preview mode' : 'Preview with variable values'}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {emailPreviewMode ? 'Exit Preview' : 'Preview'}
                    </button>
                  )}

                  {/* Visual/Code Toggle */}
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setEmailEditMode('visual')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        emailEditMode === 'visual'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Visual
                    </button>
                    <button
                      onClick={() => setEmailEditMode('code')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        emailEditMode === 'code'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Code
                    </button>
                  </div>
                </div>
              </div>

              {emailEditMode === 'visual' ? (
                <>
                  {emailPreviewMode ? (
                    <div className="border border-purple-300 bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Eye className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-xs font-semibold text-purple-700">Preview Mode - Variables Replaced</span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none bg-white rounded p-3 border border-purple-200"
                        dangerouslySetInnerHTML={{ __html: replaceVariablesWithDefaults(localData.emailContent) }}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <ReactQuill
                        ref={quillRef}
                        value={localData.emailContent || ''}
                        onChange={(content) => handleChange('emailContent', content)}
                        theme="snow"
                        style={{
                          minHeight: localData.mjmlTemplate ? '200px' : '400px',
                          backgroundColor: 'white'
                        }}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['link', 'image'],
                            ['clean']
                          ]
                        }}
                        placeholder="Write your email content here..."
                      />
                    </div>
                  )}
                </>
              ) : (
                <textarea
                  value={localData.emailContent || ''}
                  onChange={(e) => handleChange('emailContent', e.target.value)}
                  rows={localData.mjmlTemplate ? 6 : 12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Plain text email content or HTML code..."
                />
              )}
              <p className="text-xs text-gray-600 mt-1">
                {emailPreviewMode
                  ? `Preview with ${variables.length} variable${variables.length !== 1 ? 's' : ''} replaced by default values`
                  : emailEditMode === 'visual'
                    ? 'Rich text editor with formatting options'
                    : 'Plain text or HTML code view'}
              </p>
            </div>
              </>
            )}

            {/* Template Manager */}
            {showTemplateManager && !editingTemplate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Templates</h3>
                  <button
                    onClick={() => setShowTemplateManager(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Email
                  </button>
                </div>

                <button
                  onClick={handleNewTemplate}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Template</span>
                </button>

                <div className="space-y-2">
                  {templates.map((template) => {
                    const isCustom = template.isCustom
                    return (
                      <div
                        key={template.value}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{template.label}</h4>
                            {isCustom && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Key: {template.value}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEditTemplate(template.value)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit template"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isCustom && (
                            <button
                              onClick={() => handleDeleteTemplate(template.value)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Template Editor */}
            {editingTemplate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingTemplate === 'new' ? 'Create New Template' : 'Edit Template'}
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Templates
                  </button>
                </div>

                {!isCustomTemplate(editingTemplate) && editingTemplate !== 'new' && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Editing a default template</p>
                      <p>Saving will create a custom version that overrides the default.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Key {editingTemplate === 'new' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={templateForm.key}
                    onChange={(e) => setTemplateForm({ ...templateForm, key: e.target.value })}
                    disabled={editingTemplate !== 'new'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., my_custom_template"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Unique identifier (lowercase, no spaces, use underscores). Cannot be changed after creation.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., My Custom Template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of this template"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Template Content <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleTemplateModeSwitch('visual')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          templateEditMode === 'visual'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Visual
                      </button>
                      <button
                        onClick={() => handleTemplateModeSwitch('code')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          templateEditMode === 'code'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        MJML Code
                      </button>
                    </div>
                  </div>

                  {templateEditMode === 'visual' ? (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <ReactQuill
                        value={templateForm.visualContent}
                        onChange={(content) => setTemplateForm({ ...templateForm, visualContent: content })}
                        theme="snow"
                        style={{
                          minHeight: '400px',
                          backgroundColor: 'white'
                        }}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['link', 'image'],
                            ['clean']
                          ]
                        }}
                        placeholder="Design your email template visually..."
                      />
                    </div>
                  ) : (
                    <textarea
                      value={templateForm.mjml}
                      onChange={(e) => setTemplateForm({ ...templateForm, mjml: e.target.value })}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                      placeholder="<mjml>...</mjml>"
                    />
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {templateEditMode === 'visual'
                      ? 'WYSIWYG editor for visual template design. Text content extracted from MJML.'
                      : 'Full MJML template code. Use variables like {{firstName}}, {{ctaLink}}'}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - Only show when editing email */}
          {!showTemplateManager && !editingTemplate && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
