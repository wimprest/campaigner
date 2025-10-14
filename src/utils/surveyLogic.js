/**
 * Survey Logic Evaluation System
 *
 * This module provides functions to evaluate survey responses against
 * path routing rules, including score-based logic, advanced AND/OR/NOT rules,
 * and simple option mapping.
 */

/**
 * Calculate total score from user's selected responses
 * @param {Array} userSelections - Array of selected option IDs
 * @param {Array} questions - Survey questions with response options
 * @returns {number} Total score
 */
export function calculateTotalScore(userSelections, questions) {
  let totalScore = 0

  questions.forEach((question) => {
    if (question.questionType === 'radio' || question.questionType === 'checkbox') {
      const questionOptions = question.responseOptions || []

      questionOptions.forEach((option) => {
        if (userSelections.includes(option.id)) {
          totalScore += option.points || 0
        }
      })
    }
  })

  return totalScore
}

/**
 * Check if score falls within path's score threshold range
 * @param {number} score - User's total score
 * @param {Object} path - Response path with scoreMin/scoreMax
 * @returns {boolean} True if score matches threshold
 */
export function matchesScoreThreshold(score, path) {
  const hasScoreMin = path.scoreMin !== null && path.scoreMin !== undefined
  const hasScoreMax = path.scoreMax !== null && path.scoreMax !== undefined

  // If no thresholds set, score routing is not used for this path
  if (!hasScoreMin && !hasScoreMax) {
    return false
  }

  const meetsMin = !hasScoreMin || score >= path.scoreMin
  const meetsMax = !hasScoreMax || score <= path.scoreMax

  return meetsMin && meetsMax
}

/**
 * Evaluate advanced AND/OR/NOT logic rules
 * @param {Array} userSelections - Array of selected option IDs
 * @param {Object} advancedRules - Path's advanced rules configuration
 * @returns {boolean} True if all rules pass
 */
export function evaluateAdvancedRules(userSelections, advancedRules) {
  if (!advancedRules || !advancedRules.enabled) {
    return false
  }

  const { requireAll = [], requireAny = [], requireNone = [] } = advancedRules

  // AND logic: ALL options in requireAll must be selected
  if (requireAll.length > 0) {
    const allSelected = requireAll.every((optionId) => userSelections.includes(optionId))
    if (!allSelected) {
      return false
    }
  }

  // OR logic: AT LEAST ONE option in requireAny must be selected
  if (requireAny.length > 0) {
    const anySelected = requireAny.some((optionId) => userSelections.includes(optionId))
    if (!anySelected) {
      return false
    }
  }

  // NOT logic: NONE of the options in requireNone can be selected
  if (requireNone.length > 0) {
    const noneSelected = !requireNone.some((optionId) => userSelections.includes(optionId))
    if (!noneSelected) {
      return false
    }
  }

  // All rules passed (or no rules were configured)
  return true
}

/**
 * Check if any user selections match path's simple option mapping
 * @param {Array} userSelections - Array of selected option IDs
 * @param {Object} path - Response path with mappedOptions
 * @returns {boolean} True if any selection matches
 */
export function matchesSimpleMapping(userSelections, path) {
  const mappedOptions = path.mappedOptions || []

  if (mappedOptions.length === 0) {
    return false
  }

  return userSelections.some((optionId) => mappedOptions.includes(optionId))
}

/**
 * Determine which path a user should follow based on their responses
 * Priority order:
 * 1. Advanced logic rules (if enabled)
 * 2. Score-based routing (if thresholds set)
 * 3. Simple option mapping
 *
 * @param {Array} userSelections - Array of selected option IDs
 * @param {Array} responsePaths - Array of available response paths
 * @param {Array} questions - Survey questions with response options
 * @returns {Object|null} Matching path object or null if no match
 */
export function determineResponsePath(userSelections, responsePaths, questions) {
  if (!userSelections || userSelections.length === 0) {
    return null
  }

  if (!responsePaths || responsePaths.length === 0) {
    return null
  }

  const totalScore = calculateTotalScore(userSelections, questions)

  // Evaluate each path in order
  for (const path of responsePaths) {
    // Priority 1: Check advanced logic rules
    if (path.advancedRules?.enabled) {
      if (evaluateAdvancedRules(userSelections, path.advancedRules)) {
        return {
          path,
          matchReason: 'advanced_rules',
          score: totalScore
        }
      }
      // If advanced rules are enabled but don't match, skip to next path
      // (don't fall through to score or simple mapping)
      continue
    }

    // Priority 2: Check score-based routing
    const hasScoreThresholds = (path.scoreMin !== null && path.scoreMin !== undefined) ||
                                (path.scoreMax !== null && path.scoreMax !== undefined)

    if (hasScoreThresholds && matchesScoreThreshold(totalScore, path)) {
      return {
        path,
        matchReason: 'score_threshold',
        score: totalScore
      }
    }

    // Priority 3: Check simple option mapping
    if (matchesSimpleMapping(userSelections, path)) {
      return {
        path,
        matchReason: 'simple_mapping',
        score: totalScore
      }
    }
  }

  // No matching path found
  return null
}

/**
 * Validate path configuration for potential issues
 * @param {Object} path - Response path to validate
 * @param {Array} questions - Survey questions
 * @returns {Array} Array of warning messages
 */
export function validatePathConfiguration(path, questions) {
  const warnings = []

  // Check if path has any routing logic at all
  const hasScoreThresholds = (path.scoreMin !== null && path.scoreMin !== undefined) ||
                              (path.scoreMax !== null && path.scoreMax !== undefined)
  const hasAdvancedRules = path.advancedRules?.enabled &&
                           ((path.advancedRules.requireAll?.length || 0) > 0 ||
                            (path.advancedRules.requireAny?.length || 0) > 0 ||
                            (path.advancedRules.requireNone?.length || 0) > 0)
  const hasSimpleMapping = (path.mappedOptions?.length || 0) > 0

  if (!hasScoreThresholds && !hasAdvancedRules && !hasSimpleMapping) {
    warnings.push(`Path "${path.label}" has no routing logic configured`)
  }

  // Check for conflicting logic
  if (hasAdvancedRules && hasSimpleMapping) {
    warnings.push(`Path "${path.label}" has both advanced rules and simple mapping - advanced rules will take priority`)
  }

  // Check score threshold validity
  if (hasScoreThresholds) {
    if (path.scoreMin !== null && path.scoreMax !== null && path.scoreMin > path.scoreMax) {
      warnings.push(`Path "${path.label}" has invalid score range (min > max)`)
    }
  }

  // Check for impossible AND logic (requiring mutually exclusive radio options)
  if (path.advancedRules?.enabled && path.advancedRules.requireAll?.length > 1) {
    const questionsByOption = {}
    questions.forEach((q) => {
      if (q.questionType === 'radio') {
        q.responseOptions?.forEach((opt) => {
          questionsByOption[opt.id] = q.id
        })
      }
    })

    const radioQuestions = new Set()
    path.advancedRules.requireAll.forEach((optionId) => {
      const questionId = questionsByOption[optionId]
      if (questionId) {
        if (radioQuestions.has(questionId)) {
          warnings.push(`Path "${path.label}" requires multiple options from the same radio question (impossible)`)
        }
        radioQuestions.add(questionId)
      }
    })
  }

  return warnings
}

/**
 * Get all validation warnings for all paths in a survey
 * @param {Array} responsePaths - Array of response paths
 * @param {Array} questions - Survey questions
 * @returns {Object} Object with path IDs as keys and warning arrays as values
 */
export function validateAllPaths(responsePaths, questions) {
  const validationResults = {}

  responsePaths.forEach((path) => {
    const warnings = validatePathConfiguration(path, questions)
    if (warnings.length > 0) {
      validationResults[path.id] = warnings
    }
  })

  return validationResults
}

/**
 * Simulate survey completion and show which path would be taken
 * Useful for testing and debugging path configurations
 * @param {Array} userSelections - Array of selected option IDs
 * @param {Object} surveyData - Complete survey node data
 * @returns {Object} Simulation results
 */
export function simulateSurveyCompletion(userSelections, surveyData) {
  const { questions = [], responsePaths = [] } = surveyData

  const score = calculateTotalScore(userSelections, questions)
  const pathMatch = determineResponsePath(userSelections, responsePaths, questions)
  const validationWarnings = validateAllPaths(responsePaths, questions)

  return {
    score,
    selectedPath: pathMatch?.path || null,
    matchReason: pathMatch?.matchReason || 'no_match',
    warnings: validationWarnings,
    allPathsEvaluated: responsePaths.map((path) => ({
      path,
      advancedRulesMatch: path.advancedRules?.enabled
        ? evaluateAdvancedRules(userSelections, path.advancedRules)
        : null,
      scoreMatch: matchesScoreThreshold(score, path),
      simpleMappingMatch: matchesSimpleMapping(userSelections, path)
    }))
  }
}
