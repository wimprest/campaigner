import React, { useState, useEffect } from 'react'
import { X, Plus, Trash, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { emailTemplates, getTemplateList } from '../utils/emailTemplates'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function ContentPanel({ node, onUpdate, onClose, onDelete }) {
  const [localData, setLocalData] = useState(node.data)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [emailEditMode, setEmailEditMode] = useState('visual')

  useEffect(() => {
    setLocalData(node.data)
  }, [node])

  const handleSave = () => {
    onUpdate(node.id, localData)
    alert('Node updated successfully!')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id)
    }
  }

  const handleChange = (field, value) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Survey question management
  const addQuestion = () => {
    const questionNumber = (localData.questions?.length || 0) + 1
    const newQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      questionType: 'radio',
      responseOptions: [
        { id: `q_${Date.now()}_opt_1`, text: 'Option 1', points: 0 },
        { id: `q_${Date.now()}_opt_2`, text: 'Option 2', points: 0 }
      ]
    }
    const newQuestions = [...(localData.questions || []), newQuestion]
    handleChange('questions', newQuestions)
  }

  const removeQuestion = (questionId) => {
    const question = localData.questions.find((q) => q.id === questionId)
    const optionIds = question.responseOptions?.map((opt) => opt.id) || []

    // Remove question
    const newQuestions = localData.questions.filter((q) => q.id !== questionId)

    // Remove all options from this question from path mappings
    const newPaths = localData.responsePaths.map((path) => ({
      ...path,
      mappedOptions: path.mappedOptions.filter((id) => !optionIds.includes(id))
    }))

    setLocalData((prev) => ({
      ...prev,
      questions: newQuestions,
      responsePaths: newPaths
    }))
  }

  const updateQuestion = (questionId, field, value) => {
    const newQuestions = localData.questions.map((q) =>
      q.id === questionId ? { ...q, [field]: value } : q
    )
    handleChange('questions', newQuestions)
  }

  // Survey response options management (within a question)
  const addSurveyOption = (questionId) => {
    const newQuestions = localData.questions.map((q) => {
      if (q.id === questionId) {
        const newOption = {
          id: `${questionId}_opt_${Date.now()}`,
          text: `Option ${(q.responseOptions?.length || 0) + 1}`,
          points: 0
        }
        return {
          ...q,
          responseOptions: [...(q.responseOptions || []), newOption]
        }
      }
      return q
    })
    handleChange('questions', newQuestions)
  }

  const removeSurveyOption = (questionId, optionId) => {
    // Remove option from question
    const newQuestions = localData.questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          responseOptions: q.responseOptions.filter((opt) => opt.id !== optionId)
        }
      }
      return q
    })

    // Remove option from all path mappings
    const newPaths = localData.responsePaths.map((path) => ({
      ...path,
      mappedOptions: path.mappedOptions.filter((id) => id !== optionId)
    }))

    setLocalData((prev) => ({
      ...prev,
      questions: newQuestions,
      responsePaths: newPaths
    }))
  }

  const updateSurveyOption = (questionId, optionId, field, value) => {
    const newQuestions = localData.questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          responseOptions: q.responseOptions.map((opt) =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
          )
        }
      }
      return q
    })
    handleChange('questions', newQuestions)
  }

  // Survey response paths management
  const addResponsePath = () => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    const newPath = {
      id: `path_${Date.now()}`,
      label: `Path ${(localData.responsePaths?.length || 0) + 1}`,
      mappedOptions: [],
      color: colors[(localData.responsePaths?.length || 0) % colors.length]
    }
    const newPaths = [...(localData.responsePaths || []), newPath]
    handleChange('responsePaths', newPaths)
  }

  const removeResponsePath = (pathId) => {
    const newPaths = localData.responsePaths.filter((path) => path.id !== pathId)
    handleChange('responsePaths', newPaths)
  }

  const updateResponsePath = (pathId, field, value) => {
    const newPaths = localData.responsePaths.map((path) =>
      path.id === pathId ? { ...path, [field]: value } : path
    )
    handleChange('responsePaths', newPaths)
  }

  const toggleOptionInPath = (pathId, optionId) => {
    const newPaths = localData.responsePaths.map((path) => {
      if (path.id === pathId) {
        const isCurrentlyMapped = path.mappedOptions.includes(optionId)
        if (isCurrentlyMapped) {
          return {
            ...path,
            mappedOptions: path.mappedOptions.filter((id) => id !== optionId)
          }
        } else {
          // Remove from other paths first (each option can only map to one path)
          const otherPaths = localData.responsePaths
            .filter((p) => p.id !== pathId)
            .forEach((p) => {
              p.mappedOptions = p.mappedOptions.filter((id) => id !== optionId)
            })
          return {
            ...path,
            mappedOptions: [...path.mappedOptions, optionId]
          }
        }
      }
      // Remove from other paths
      return {
        ...path,
        mappedOptions: path.mappedOptions.filter((id) => id !== optionId)
      }
    })
    handleChange('responsePaths', newPaths)
  }

  // Email template handling
  const loadEmailTemplate = (templateKey) => {
    const template = emailTemplates[templateKey]
    if (template) {
      setLocalData((prev) => ({
        ...prev,
        mjmlTemplate: template.mjml,
        emailTemplate: templateKey
      }))
    }
  }

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case 'email':
        const templates = getTemplateList()

        return (
          <>
            {/* Email Template Selector */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center mb-2">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                <label className="text-sm font-medium text-blue-900">
                  Email Template
                </label>
              </div>
              <select
                value={localData.emailTemplate || 'blank'}
                onChange={(e) => loadEmailTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {templates.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label} - {template.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-blue-700 mt-2">
                Select a professional MJML template. The template will be exported as HTML for email platforms.
              </p>
            </div>

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
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                  placeholder="<mjml>...</mjml>"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Edit MJML code directly. Variables: {'{{'} firstName {'}}'}, {'{{'} ctaLink {'}}'}
                </p>
              </div>
            )}

            {/* Email Content Editor with Visual/Code Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Content {!localData.mjmlTemplate && '(used if no template selected)'}
                </label>
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

              {emailEditMode === 'visual' ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={localData.emailContent || ''}
                    onChange={(content) => handleChange('emailContent', content)}
                    theme="snow"
                    style={{
                      minHeight: localData.mjmlTemplate ? '150px' : '250px',
                      backgroundColor: 'white'
                    }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                    placeholder="Write your email content here..."
                  />
                </div>
              ) : (
                <textarea
                  value={localData.emailContent || ''}
                  onChange={(e) => handleChange('emailContent', e.target.value)}
                  rows={localData.mjmlTemplate ? 4 : 8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Plain text email content or HTML code..."
                />
              )}
              <p className="text-xs text-gray-600 mt-1">
                {emailEditMode === 'visual'
                  ? 'Rich text editor with formatting options'
                  : 'Plain text or HTML code view'}
              </p>
            </div>
          </>
        )

      case 'survey':
        const questions = localData.questions || []
        const responsePaths = localData.responsePaths || []

        // Get all response options from all questions for path mapping
        const allResponseOptions = questions.flatMap(q =>
          (q.responseOptions || []).map(opt => ({
            ...opt,
            questionId: q.id,
            questionText: q.text
          }))
        )

        // Calculate score range
        const calculateScoreRange = () => {
          let minScore = 0
          let maxScore = 0

          questions.forEach((q) => {
            if (q.questionType === 'radio' || q.questionType === 'checkbox') {
              const optionPoints = (q.responseOptions || []).map((opt) => opt.points || 0)
              if (optionPoints.length > 0) {
                if (q.questionType === 'radio') {
                  // For radio, one option selected
                  minScore += Math.min(...optionPoints)
                  maxScore += Math.max(...optionPoints)
                } else {
                  // For checkbox, all can be selected
                  const positives = optionPoints.filter((p) => p > 0)
                  const negatives = optionPoints.filter((p) => p < 0)
                  minScore += negatives.reduce((sum, p) => sum + p, 0)
                  maxScore += positives.reduce((sum, p) => sum + p, 0)
                }
              }
            }
          })

          return { minScore, maxScore }
        }

        const { minScore, maxScore } = calculateScoreRange()

        const toggleQuestionExpanded = (questionId) => {
          setExpandedQuestions((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(questionId)) {
              newSet.delete(questionId)
            } else {
              newSet.add(questionId)
            }
            return newSet
          })
        }

        return (
          <>
            {/* Questions Section */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Survey Questions ({questions.length})
                </label>
                <button
                  onClick={addQuestion}
                  className="flex items-center text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((question, qIndex) => {
                  const isExpanded = expandedQuestions.has(question.id)
                  const questionTypeLabels = {
                    radio: 'Radio (Single Choice)',
                    checkbox: 'Checkbox (Multiple)',
                    text: 'Text Input',
                    range: 'Numeric Range'
                  }

                  return (
                    <div
                      key={question.id}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => toggleQuestionExpanded(question.id)}
                          className="flex items-center flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-gray-600" />
                          ) : (
                            <ChevronUp className="w-4 h-4 mr-2 text-gray-600" />
                          )}
                          <span className="font-medium text-sm text-gray-900">
                            Question {qIndex + 1}
                            {question.text && `: ${question.text.substring(0, 40)}${question.text.length > 40 ? '...' : ''}`}
                          </span>
                        </button>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded ml-2"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Question Details (Collapsible) */}
                      {isExpanded && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                          {/* Question Type */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              value={question.questionType || 'radio'}
                              onChange={(e) => updateQuestion(question.id, 'questionType', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                            >
                              <option value="radio">Radio Button (Single Choice)</option>
                              <option value="checkbox">Checkbox (Multiple Choice)</option>
                              <option value="text">Text Input</option>
                              <option value="range">Numeric Range</option>
                            </select>
                          </div>

                          {/* Question Text */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Question Text
                            </label>
                            <input
                              type="text"
                              value={question.text || ''}
                              onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="Enter your question..."
                            />
                          </div>

                          {/* Response Options (for multiple choice types) */}
                          {(question.questionType === 'radio' || question.questionType === 'checkbox') && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-medium text-gray-700">
                                  Response Options
                                </label>
                                <button
                                  onClick={() => addSurveyOption(question.id)}
                                  className="flex items-center text-xs text-green-600 hover:text-green-700"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {(question.responseOptions || []).map((option) => {
                                  const mappedPath = responsePaths.find((path) =>
                                    path.mappedOptions?.includes(option.id)
                                  )

                                  return (
                                    <div key={option.id} className="flex items-center space-x-1.5">
                                      <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateSurveyOption(question.id, option.id, 'text', e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Option text"
                                      />
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="number"
                                          value={option.points || 0}
                                          onChange={(e) => updateSurveyOption(question.id, option.id, 'points', parseInt(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 text-center"
                                          placeholder="pts"
                                          title="Point value"
                                        />
                                        <span className="text-xs text-gray-500">pts</span>
                                      </div>
                                      {mappedPath && (
                                        <div
                                          className="px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                                          style={{
                                            backgroundColor: `${mappedPath.color}20`,
                                            color: mappedPath.color,
                                            borderLeft: `2px solid ${mappedPath.color}`
                                          }}
                                        >
                                          {mappedPath.label}
                                        </div>
                                      )}
                                      {question.responseOptions.length > 1 && (
                                        <button
                                          onClick={() => removeSurveyOption(question.id, option.id)}
                                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                        >
                                          <Trash className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Info for text/range types */}
                          {question.questionType === 'text' && (
                            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                              Text input questions collect free-form responses. You can map this question's completion to response paths below.
                            </div>
                          )}
                          {question.questionType === 'range' && (
                            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                              Range questions collect numeric values. Map ranges to response paths below.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Collapsed preview */}
                      {!isExpanded && (
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                          <div>
                            {questionTypeLabels[question.questionType]}
                            {(question.questionType === 'radio' || question.questionType === 'checkbox') && (
                              <span className="ml-2">• {question.responseOptions?.length || 0} options</span>
                            )}
                          </div>
                          {(question.questionType === 'radio' || question.questionType === 'checkbox') && question.responseOptions.length > 0 && (
                            (() => {
                              const points = question.responseOptions.map(opt => opt.points || 0)
                              const minPts = Math.min(...points)
                              const maxPts = Math.max(...points)
                              if (minPts !== 0 || maxPts !== 0) {
                                return (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    {minPts}→{maxPts} pts
                                  </span>
                                )
                              }
                            })()
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {questions.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No questions yet. Click "Add Question" to get started.
                </div>
              )}
            </div>

            {/* Response Paths */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Response Paths (Outcomes)
                </label>
                <button
                  onClick={addResponsePath}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Path
                </button>
              </div>

              {/* Score Range Preview */}
              {(minScore !== 0 || maxScore !== 0) && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-900">Total Score Range:</span>
                    <span className="font-bold text-blue-700">
                      {minScore} to {maxScore} points
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-blue-700">
                    Set score thresholds below to automatically route responses to paths
                  </div>
                </div>
              )}

              {allResponseOptions.length === 0 && (
                <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded mb-3">
                  Add questions with response options above to create path mappings.
                </div>
              )}

              <div className="space-y-3">
                {responsePaths.map((path) => (
                  <div
                    key={path.id}
                    className="border rounded-lg p-3"
                    style={{ borderColor: path.color }}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="color"
                        value={path.color}
                        onChange={(e) => updateResponsePath(path.id, 'color', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={path.label}
                        onChange={(e) => updateResponsePath(path.id, 'label', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                        placeholder="Path name"
                      />
                      {responsePaths.length > 1 && (
                        <button
                          onClick={() => removeResponsePath(path.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Score Threshold Inputs */}
                    {(minScore !== 0 || maxScore !== 0) && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          🎯 Score-Based Routing (Optional)
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={path.scoreMin !== null ? path.scoreMin : ''}
                            onChange={(e) => updateResponsePath(path.id, 'scoreMin', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Min"
                          />
                          <span className="text-xs text-gray-500">to</span>
                          <input
                            type="number"
                            value={path.scoreMax !== null ? path.scoreMax : ''}
                            onChange={(e) => updateResponsePath(path.id, 'scoreMax', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Max"
                          />
                          <span className="text-xs text-gray-500">points</span>
                        </div>
                        {(path.scoreMin !== null || path.scoreMax !== null) && (
                          <div className="text-xs text-blue-600 mt-1">
                            ✓ Responses scoring {path.scoreMin || minScore}-{path.scoreMax || maxScore} pts → {path.label}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advanced Logic Rules */}
                    {allResponseOptions.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-medium text-gray-700">
                            🧠 Advanced Logic Rules (Optional)
                          </div>
                          <button
                            onClick={() => updateResponsePath(path.id, 'advancedRules', {
                              ...(path.advancedRules || {}),
                              enabled: !(path.advancedRules?.enabled || false)
                            })}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              path.advancedRules?.enabled
                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {path.advancedRules?.enabled ? 'Enabled ✓' : 'Disabled'}
                          </button>
                        </div>

                        {path.advancedRules?.enabled && (
                          <div className="space-y-3 bg-purple-50 p-3 rounded">
                            {/* AND Logic (Require All) */}
                            <div>
                              <div className="text-xs font-medium text-purple-900 mb-1 flex items-center">
                                <span className="bg-purple-200 px-1.5 py-0.5 rounded mr-2 font-mono">AND</span>
                                All of these must be selected:
                              </div>
                              <div className="space-y-1 pl-2 max-h-32 overflow-y-auto">
                                {allResponseOptions.map((option) => {
                                  const isChecked = path.advancedRules?.requireAll?.includes(option.id) || false
                                  return (
                                    <label
                                      key={option.id}
                                      className="flex items-start space-x-2 text-xs cursor-pointer hover:bg-purple-100 p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const currentRules = path.advancedRules || { enabled: true, requireAll: [], requireAny: [], requireNone: [] }
                                          const newRequireAll = e.target.checked
                                            ? [...(currentRules.requireAll || []), option.id]
                                            : (currentRules.requireAll || []).filter(id => id !== option.id)
                                          updateResponsePath(path.id, 'advancedRules', {
                                            ...currentRules,
                                            requireAll: newRequireAll
                                          })
                                        }}
                                        className="rounded mt-0.5"
                                      />
                                      <div className="flex-1">
                                        <span className={isChecked ? 'font-medium text-purple-900' : 'text-gray-700'}>
                                          {option.text || 'Untitled option'}
                                        </span>
                                        {option.questionText && (
                                          <div className="text-xs text-gray-500">
                                            from: {option.questionText.substring(0, 40)}
                                            {option.questionText.length > 40 ? '...' : ''}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                              {(!path.advancedRules?.requireAll || path.advancedRules.requireAll.length === 0) && (
                                <div className="text-xs text-gray-500 italic pl-2 mt-1">No options selected</div>
                              )}
                            </div>

                            {/* OR Logic (Require Any) */}
                            <div>
                              <div className="text-xs font-medium text-purple-900 mb-1 flex items-center">
                                <span className="bg-blue-200 px-1.5 py-0.5 rounded mr-2 font-mono">OR</span>
                                Any of these must be selected:
                              </div>
                              <div className="space-y-1 pl-2 max-h-32 overflow-y-auto">
                                {allResponseOptions.map((option) => {
                                  const isChecked = path.advancedRules?.requireAny?.includes(option.id) || false
                                  return (
                                    <label
                                      key={option.id}
                                      className="flex items-start space-x-2 text-xs cursor-pointer hover:bg-blue-100 p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const currentRules = path.advancedRules || { enabled: true, requireAll: [], requireAny: [], requireNone: [] }
                                          const newRequireAny = e.target.checked
                                            ? [...(currentRules.requireAny || []), option.id]
                                            : (currentRules.requireAny || []).filter(id => id !== option.id)
                                          updateResponsePath(path.id, 'advancedRules', {
                                            ...currentRules,
                                            requireAny: newRequireAny
                                          })
                                        }}
                                        className="rounded mt-0.5"
                                      />
                                      <div className="flex-1">
                                        <span className={isChecked ? 'font-medium text-blue-900' : 'text-gray-700'}>
                                          {option.text || 'Untitled option'}
                                        </span>
                                        {option.questionText && (
                                          <div className="text-xs text-gray-500">
                                            from: {option.questionText.substring(0, 40)}
                                            {option.questionText.length > 40 ? '...' : ''}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                              {(!path.advancedRules?.requireAny || path.advancedRules.requireAny.length === 0) && (
                                <div className="text-xs text-gray-500 italic pl-2 mt-1">No options selected</div>
                              )}
                            </div>

                            {/* NOT Logic (Require None) */}
                            <div>
                              <div className="text-xs font-medium text-purple-900 mb-1 flex items-center">
                                <span className="bg-red-200 px-1.5 py-0.5 rounded mr-2 font-mono">NOT</span>
                                None of these can be selected:
                              </div>
                              <div className="space-y-1 pl-2 max-h-32 overflow-y-auto">
                                {allResponseOptions.map((option) => {
                                  const isChecked = path.advancedRules?.requireNone?.includes(option.id) || false
                                  return (
                                    <label
                                      key={option.id}
                                      className="flex items-start space-x-2 text-xs cursor-pointer hover:bg-red-100 p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const currentRules = path.advancedRules || { enabled: true, requireAll: [], requireAny: [], requireNone: [] }
                                          const newRequireNone = e.target.checked
                                            ? [...(currentRules.requireNone || []), option.id]
                                            : (currentRules.requireNone || []).filter(id => id !== option.id)
                                          updateResponsePath(path.id, 'advancedRules', {
                                            ...currentRules,
                                            requireNone: newRequireNone
                                          })
                                        }}
                                        className="rounded mt-0.5"
                                      />
                                      <div className="flex-1">
                                        <span className={isChecked ? 'font-medium text-red-900' : 'text-gray-700'}>
                                          {option.text || 'Untitled option'}
                                        </span>
                                        {option.questionText && (
                                          <div className="text-xs text-gray-500">
                                            from: {option.questionText.substring(0, 40)}
                                            {option.questionText.length > 40 ? '...' : ''}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                              {(!path.advancedRules?.requireNone || path.advancedRules.requireNone.length === 0) && (
                                <div className="text-xs text-gray-500 italic pl-2 mt-1">No options selected</div>
                              )}
                            </div>

                            {/* Logic Preview */}
                            {((path.advancedRules?.requireAll?.length || 0) > 0 ||
                              (path.advancedRules?.requireAny?.length || 0) > 0 ||
                              (path.advancedRules?.requireNone?.length || 0) > 0) && (
                              <div className="text-xs bg-white p-2 rounded border border-purple-200">
                                <div className="font-medium text-purple-900 mb-1">Logic Summary:</div>
                                <div className="text-gray-700 space-y-0.5">
                                  {(path.advancedRules?.requireAll?.length || 0) > 0 && (
                                    <div>✓ Must select ALL {path.advancedRules.requireAll.length} AND options</div>
                                  )}
                                  {(path.advancedRules?.requireAny?.length || 0) > 0 && (
                                    <div>✓ Must select ANY of {path.advancedRules.requireAny.length} OR options</div>
                                  )}
                                  {(path.advancedRules?.requireNone?.length || 0) > 0 && (
                                    <div>✓ Cannot select any of {path.advancedRules.requireNone.length} NOT options</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {!path.advancedRules?.enabled && (
                          <div className="text-xs text-gray-500 mt-1">
                            Enable to create complex logic rules combining multiple responses (AND/OR/NOT)
                          </div>
                        )}
                      </div>
                    )}

                    {allResponseOptions.length > 0 && (
                      <>
                        <div className="text-xs text-gray-600 mb-2 font-medium">
                          Map response options to this path:
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {allResponseOptions.map((option) => {
                            const isChecked = path.mappedOptions?.includes(option.id)
                            return (
                              <label
                                key={option.id}
                                className="flex items-start space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleOptionInPath(path.id, option.id)}
                                  className="rounded mt-0.5"
                                />
                                <div className="flex-1">
                                  <span className={isChecked ? 'font-medium' : ''}>
                                    {option.text || 'Untitled option'}
                                  </span>
                                  {option.questionText && (
                                    <div className="text-xs text-gray-500">
                                      from: {option.questionText.substring(0, 50)}
                                      {option.questionText.length > 50 ? '...' : ''}
                                    </div>
                                  )}
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {path.mappedOptions?.length === 0 && allResponseOptions.length > 0 && (
                      <div className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                        ⚠ No options mapped to this path
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )

      case 'conditional':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <input
                type="text"
                value={localData.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., User clicked link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                True Path Label
              </label>
              <input
                type="text"
                value={localData.truePath || ''}
                onChange={(e) => handleChange('truePath', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What happens if true?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                False Path Label
              </label>
              <input
                type="text"
                value={localData.falsePath || ''}
                onChange={(e) => handleChange('falsePath', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What happens if false?"
              />
            </div>
          </>
        )

      case 'delay':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Duration
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={localData.duration || '1'}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
                <select
                  value={localData.unit || 'days'}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
          </>
        )

      case 'action':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <input
                type="text"
                value={localData.actionType || ''}
                onChange={(e) => handleChange('actionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Update CRM, Send SMS, Tag Contact"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Edit Node</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Node Title <span className="text-gray-500 font-normal">(not visible to customers)</span>
          </label>
          <input
            type="text"
            value={localData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter node title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-500 font-normal">(not visible to customers)</span>
          </label>
          <textarea
            value={localData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a description..."
          />
        </div>

        {renderNodeSpecificFields()}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Internal Notes
          </label>
          <textarea
            value={localData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add internal notes (not visible to customers)..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Changes
        </button>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
        >
          <Trash className="w-4 h-4 mr-2" />
          Delete Node
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Tip: Press Delete or Backspace to delete selected node
        </p>
      </div>
    </div>
  )
}
