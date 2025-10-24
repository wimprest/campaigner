import React, { useState, useEffect } from 'react'
import { X, Play, CheckCircle, XCircle, AlertTriangle, Target, Brain, List } from 'lucide-react'
import { simulateSurveyCompletion } from '../utils/surveyLogic'

export default function SurveyTestModal({ isOpen, surveyData, onClose }) {
  const [userSelections, setUserSelections] = useState([])
  const [textResponses, setTextResponses] = useState({})
  const [rangeResponses, setRangeResponses] = useState({})
  const [optionTextResponses, setOptionTextResponses] = useState({}) // For "Other" text inputs
  const [testResults, setTestResults] = useState(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserSelections([])
      setTextResponses({})
      setRangeResponses({})
      setOptionTextResponses({})
      setTestResults(null)
    }
  }, [isOpen])

  // Run simulation whenever selections change
  useEffect(() => {
    if (isOpen && surveyData) {
      const results = simulateSurveyCompletion(userSelections, surveyData)
      setTestResults(results)
    }
  }, [userSelections, isOpen, surveyData])

  // Handle escape key
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

  const { questions = [], responsePaths = [], label = 'Survey' } = surveyData

  // Handle radio selection (only one option per question)
  const handleRadioSelect = (questionId, optionId) => {
    setUserSelections(prev => {
      // Remove any previous selections from this question
      const question = questions.find(q => q.id === questionId)
      const questionOptionIds = question?.responseOptions?.map(opt => opt.id) || []
      const withoutQuestion = prev.filter(id => !questionOptionIds.includes(id))
      // Add the new selection
      return [...withoutQuestion, optionId]
    })
  }

  // Handle checkbox selection (multiple options per question)
  const handleCheckboxToggle = (optionId) => {
    setUserSelections(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId)
      } else {
        return [...prev, optionId]
      }
    })
  }

  // Handle text input (for display only, doesn't affect routing)
  const handleTextChange = (questionId, value) => {
    setTextResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Handle range input
  const handleRangeChange = (questionId, value) => {
    setRangeResponses(prev => ({
      ...prev,
      [questionId]: parseInt(value) || 0
    }))
  }

  // Get match reason badge
  const getMatchReasonBadge = (reason) => {
    const badges = {
      'advanced_rules': { label: 'Advanced Rules', color: 'purple', icon: Brain },
      'score_threshold': { label: 'Score Threshold', color: 'blue', icon: Target },
      'simple_mapping': { label: 'Simple Mapping', color: 'green', icon: List },
      'no_match': { label: 'No Match', color: 'gray', icon: XCircle }
    }

    const badge = badges[reason] || badges['no_match']
    const Icon = badge.icon

    const colorClasses = {
      purple: 'bg-purple-100 text-purple-700 border-purple-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      gray: 'bg-gray-100 text-gray-700 border-gray-300'
    }

    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[badge.color]}`}>
        <Icon className="w-4 h-4" />
        <span>{badge.label}</span>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Play className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Test Survey</h2>
                <p className="text-green-100 text-sm">{label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-green-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">

            {/* Left Panel - Questions */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Questions</h3>

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No questions in this survey</p>
                </div>
              )}

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2 mb-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{question.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {question.questionType === 'radio' && 'Single choice'}
                          {question.questionType === 'checkbox' && 'Multiple choice'}
                          {question.questionType === 'text' && 'Text input'}
                          {question.questionType === 'range' && 'Numeric value'}
                        </p>
                      </div>
                    </div>

                    {/* Radio Options */}
                    {question.questionType === 'radio' && (
                      <div className="space-y-2 ml-8">
                        {(question.responseOptions || []).map(option => (
                          <div key={option.id} className="space-y-2">
                            <label className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                              <input
                                type="radio"
                                name={question.id}
                                checked={userSelections.includes(option.id)}
                                onChange={() => handleRadioSelect(question.id, option.id)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-gray-700">{option.text}</span>
                              {option.points !== 0 && (
                                <span className="text-xs text-gray-500">({option.points > 0 ? '+' : ''}{option.points} pts)</span>
                              )}
                            </label>
                            {/* Text input for "Other" option */}
                            {option.allowsTextInput && userSelections.includes(option.id) && (
                              <input
                                type="text"
                                value={optionTextResponses[option.id] || ''}
                                onChange={(e) => setOptionTextResponses(prev => ({ ...prev, [option.id]: e.target.value }))}
                                placeholder="Please specify..."
                                className="w-full ml-7 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Checkbox Options */}
                    {question.questionType === 'checkbox' && (
                      <div className="space-y-2 ml-8">
                        {(question.responseOptions || []).map(option => (
                          <div key={option.id} className="space-y-2">
                            <label className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userSelections.includes(option.id)}
                                onChange={() => handleCheckboxToggle(option.id)}
                                className="w-4 h-4 text-green-600 rounded"
                              />
                              <span className="text-gray-700">{option.text}</span>
                              {option.points !== 0 && (
                                <span className="text-xs text-gray-500">({option.points > 0 ? '+' : ''}{option.points} pts)</span>
                              )}
                            </label>
                            {/* Text input for "Other" option */}
                            {option.allowsTextInput && userSelections.includes(option.id) && (
                              <input
                                type="text"
                                value={optionTextResponses[option.id] || ''}
                                onChange={(e) => setOptionTextResponses(prev => ({ ...prev, [option.id]: e.target.value }))}
                                placeholder="Please specify..."
                                className="w-full ml-7 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Input */}
                    {question.questionType === 'text' && (
                      <div className="ml-8">
                        <input
                          type="text"
                          value={textResponses[question.id] || ''}
                          onChange={(e) => handleTextChange(question.id, e.target.value)}
                          placeholder="Enter your answer..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Text responses don't affect path routing</p>
                      </div>
                    )}

                    {/* Range Input */}
                    {question.questionType === 'range' && (
                      <div className="ml-8">
                        <input
                          type="number"
                          value={rangeResponses[question.id] || ''}
                          onChange={(e) => handleRangeChange(question.id, e.target.value)}
                          placeholder="Enter a number..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Numeric value for range-based routing</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>

              {userSelections.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No selections yet</p>
                  <p className="text-sm mt-1">Select answers to see which path would be taken</p>
                </div>
              )}

              {testResults && userSelections.length > 0 && (
                <div className="space-y-4">

                  {/* Score Display */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-700">Score</h4>
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{testResults.score}</div>
                    <p className="text-sm text-gray-500 mt-1">Based on selected options</p>
                  </div>

                  {/* Text Responses Display */}
                  {Object.keys(optionTextResponses).length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Additional Details</h4>
                      <div className="space-y-2">
                        {Object.entries(optionTextResponses).map(([optionId, text]) => {
                          if (!text) return null
                          // Find the option to get its label
                          const option = questions.flatMap(q => q.responseOptions || []).find(opt => opt.id === optionId)
                          return (
                            <div key={optionId} className="bg-white rounded p-2">
                              <p className="text-xs font-medium text-gray-600 mb-1">{option?.text || 'Option'}:</p>
                              <p className="text-sm text-gray-900">{text}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Path */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Matching Path</h4>

                    {testResults.selectedPath ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{testResults.selectedPath.label}</p>
                            <p className="text-sm text-gray-500">This path would be followed</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          {getMatchReasonBadge(testResults.matchReason)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-orange-600">
                        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-medium">No matching path</p>
                          <p className="text-sm">Review your path configurations</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Paths Evaluation */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">All Paths</h4>
                    <div className="space-y-2">
                      {testResults.allPathsEvaluated.map((pathEval, index) => {
                        const isSelected = testResults.selectedPath?.id === pathEval.path.id

                        return (
                          <div
                            key={pathEval.path.id}
                            className={`p-3 rounded-lg border ${
                              isSelected
                                ? 'bg-green-50 border-green-300'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {isSelected ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-400" />
                                )}
                                <span
                                  className={`font-medium ${
                                    isSelected ? 'text-green-900' : 'text-gray-700'
                                  }`}
                                  style={{ color: isSelected ? undefined : pathEval.path.color }}
                                >
                                  {pathEval.path.label}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                {pathEval.advancedRulesMatch !== null && (
                                  <span className={pathEval.advancedRulesMatch ? 'text-green-600' : 'text-gray-400'}>
                                    Advanced: {pathEval.advancedRulesMatch ? '✓' : '✗'}
                                  </span>
                                )}
                                {pathEval.scoreMatch && (
                                  <span className="text-blue-600">Score: ✓</span>
                                )}
                                {pathEval.simpleMappingMatch && (
                                  <span className="text-green-600">Mapping: ✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Validation Warnings */}
                  {Object.keys(testResults.warnings).length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-900 mb-2">Configuration Warnings</h4>
                          <div className="space-y-2">
                            {Object.entries(testResults.warnings).map(([pathId, warnings]) => (
                              <div key={pathId} className="text-sm">
                                {warnings.map((warning, idx) => (
                                  <p key={idx} className="text-orange-700">• {warning}</p>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {userSelections.length > 0 ? (
                <span>{userSelections.length} option(s) selected</span>
              ) : (
                <span>Select answers to test the survey</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
