/**
 * Campaign Flow Validation System
 *
 * Analyzes the entire campaign graph structure to detect:
 * - Orphaned nodes (not connected to anything)
 * - Dead ends (no outgoing connections)
 * - Unreachable nodes (no path from start)
 * - Missing required content
 * - Disconnected survey paths
 */

/**
 * Find nodes that have no incoming or outgoing connections
 * @param {Array} nodes - All campaign nodes
 * @param {Array} edges - All campaign edges
 * @returns {Array} Array of orphaned nodes
 */
export function findOrphanedNodes(nodes, edges) {
  const connectedNodeIds = new Set()

  edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  return nodes.filter(node => !connectedNodeIds.has(node.id))
}

/**
 * Find nodes that have no outgoing connections (dead ends)
 * Note: This is not always an error - final actions/emails are expected to have no outgoing edges
 * @param {Array} nodes - All campaign nodes
 * @param {Array} edges - All campaign edges
 * @returns {Array} Array of dead end nodes
 */
export function findDeadEndNodes(nodes, edges) {
  const nodesWithOutgoing = new Set(edges.map(edge => edge.source))

  return nodes.filter(node => !nodesWithOutgoing.has(node.id))
}

/**
 * Find nodes that have no incoming connections (potential entry points or unreachable)
 * @param {Array} nodes - All campaign nodes
 * @param {Array} edges - All campaign edges
 * @returns {Array} Array of nodes with no incoming connections
 */
export function findNodesWithoutIncoming(nodes, edges) {
  const nodesWithIncoming = new Set(edges.map(edge => edge.target))

  return nodes.filter(node => !nodesWithIncoming.has(node.id))
}

/**
 * Perform a breadth-first search to find all reachable nodes from entry points
 * @param {Array} entryNodes - Nodes with no incoming edges (potential starts)
 * @param {Array} edges - All campaign edges
 * @returns {Set} Set of reachable node IDs
 */
function findReachableNodes(entryNodes, edges) {
  const reachable = new Set()
  const queue = [...entryNodes.map(n => n.id)]

  // Build adjacency list for efficient traversal
  const adjacencyList = {}
  edges.forEach(edge => {
    if (!adjacencyList[edge.source]) {
      adjacencyList[edge.source] = []
    }
    adjacencyList[edge.source].push(edge.target)
  })

  // BFS traversal
  while (queue.length > 0) {
    const nodeId = queue.shift()

    if (reachable.has(nodeId)) {
      continue // Already visited
    }

    reachable.add(nodeId)

    // Add all connected nodes to queue
    const connectedNodes = adjacencyList[nodeId] || []
    connectedNodes.forEach(targetId => {
      if (!reachable.has(targetId)) {
        queue.push(targetId)
      }
    })
  }

  return reachable
}

/**
 * Find nodes that are unreachable from any entry point
 * @param {Array} nodes - All campaign nodes
 * @param {Array} edges - All campaign edges
 * @returns {Array} Array of unreachable nodes
 */
export function findUnreachableNodes(nodes, edges) {
  if (nodes.length === 0) {
    return []
  }

  const entryNodes = findNodesWithoutIncoming(nodes, edges)

  // If there are no entry points, all nodes except the first one are unreachable
  if (entryNodes.length === 0) {
    // Edge case: circular flow with no entry point
    // In this case, we could consider all nodes unreachable, or mark this as a special error
    return nodes.map(node => ({
      ...node,
      reason: 'No entry point found in campaign (circular flow)'
    }))
  }

  const reachable = findReachableNodes(entryNodes, edges)

  return nodes.filter(node => !reachable.has(node.id))
}

/**
 * Check for missing required content in nodes
 * @param {Array} nodes - All campaign nodes
 * @returns {Array} Array of content validation issues
 */
export function findContentIssues(nodes) {
  const issues = []

  nodes.forEach(node => {
    const { type, data } = node

    switch (type) {
      case 'email':
        // Check for subject (either legacy single subject or at least one variant)
        const hasSubject = (data.subject && data.subject.trim() !== '') ||
                          (data.subjectVariants && data.subjectVariants.some(v => v.subject && v.subject.trim() !== ''))

        if (!hasSubject) {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Email',
            type: 'missing_content',
            severity: 'warning',
            message: 'Email has no subject line'
          })
        }

        // Check for email content
        if (!data.emailContent || data.emailContent.trim() === '' || data.emailContent === '<p><br></p>') {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Email',
            type: 'missing_content',
            severity: 'warning',
            message: 'Email has no content'
          })
        }
        break

      case 'survey':
        // Check for questions
        if (!data.questions || data.questions.length === 0) {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Survey',
            type: 'missing_content',
            severity: 'error',
            message: 'Survey has no questions'
          })
        } else {
          // Check each question for text
          data.questions.forEach((question, idx) => {
            if (!question.text || question.text.trim() === '') {
              issues.push({
                nodeId: node.id,
                nodeLabel: data.label || 'Untitled Survey',
                type: 'missing_content',
                severity: 'warning',
                message: `Question ${idx + 1} has no text`
              })
            }

            // Check radio/checkbox questions for response options
            if ((question.questionType === 'radio' || question.questionType === 'checkbox') &&
                (!question.responseOptions || question.responseOptions.length === 0)) {
              issues.push({
                nodeId: node.id,
                nodeLabel: data.label || 'Untitled Survey',
                type: 'missing_content',
                severity: 'error',
                message: `Question ${idx + 1} has no response options`
              })
            }
          })
        }

        // Check for response paths
        if (!data.responsePaths || data.responsePaths.length === 0) {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Survey',
            type: 'missing_content',
            severity: 'error',
            message: 'Survey has no response paths defined'
          })
        }
        break

      case 'conditional':
        // Check for condition
        if (!data.condition || data.condition.trim() === '') {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Conditional',
            type: 'missing_content',
            severity: 'warning',
            message: 'Conditional has no condition defined'
          })
        }
        break

      case 'delay':
        // Check for valid duration
        if (!data.duration || parseInt(data.duration) <= 0) {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Delay',
            type: 'missing_content',
            severity: 'warning',
            message: 'Delay has no valid duration'
          })
        }
        break

      case 'action':
        // Check for action type
        if (!data.actionType || data.actionType.trim() === '') {
          issues.push({
            nodeId: node.id,
            nodeLabel: data.label || 'Untitled Action',
            type: 'missing_content',
            severity: 'warning',
            message: 'Action has no type defined'
          })
        }
        break
    }
  })

  return issues
}

/**
 * Check for survey nodes with paths that aren't connected to any destination
 * @param {Array} nodes - All campaign nodes
 * @param {Array} edges - All campaign edges
 * @returns {Array} Array of disconnected path issues
 */
export function findDisconnectedSurveyPaths(nodes, edges) {
  const issues = []

  // Build map of source handles that have outgoing connections
  const connectedHandles = new Set()
  edges.forEach(edge => {
    if (edge.sourceHandle) {
      connectedHandles.add(`${edge.source}:${edge.sourceHandle}`)
    }
  })

  nodes.forEach(node => {
    if (node.type === 'survey' && node.data.responsePaths) {
      const disconnectedPaths = node.data.responsePaths.filter(path => {
        const handleKey = `${node.id}:${path.id}`
        return !connectedHandles.has(handleKey)
      })

      if (disconnectedPaths.length > 0) {
        const pathNames = disconnectedPaths.map(p => p.label).join(', ')
        issues.push({
          nodeId: node.id,
          nodeLabel: node.data.label || 'Untitled Survey',
          type: 'disconnected_path',
          severity: 'warning',
          message: `Survey paths not connected: ${pathNames}`,
          count: disconnectedPaths.length
        })
      }
    }
  })

  return issues
}

/**
 * Run comprehensive campaign validation
 * @param {Array} nodes - All campaign nodes
 * @param {Array} edges - All campaign edges
 * @returns {Object} Validation results categorized by severity and type
 */
export function validateCampaign(nodes, edges) {
  // If campaign is empty, return early
  if (!nodes || nodes.length === 0) {
    return {
      isValid: true,
      isEmpty: true,
      summary: {
        total: 0,
        errors: 0,
        warnings: 0,
        info: 0
      },
      issues: []
    }
  }

  const issues = []

  // 1. Find orphaned nodes (critical)
  const orphaned = findOrphanedNodes(nodes, edges)
  orphaned.forEach(node => {
    issues.push({
      nodeId: node.id,
      nodeLabel: node.data.label || `Untitled ${node.type}`,
      nodeType: node.type,
      type: 'orphaned',
      severity: 'error',
      message: 'Node is not connected to any other nodes'
    })
  })

  // 2. Find unreachable nodes (critical)
  const unreachable = findUnreachableNodes(nodes, edges)
  unreachable.forEach(node => {
    // Skip if already marked as orphaned
    if (!orphaned.find(n => n.id === node.id)) {
      issues.push({
        nodeId: node.id,
        nodeLabel: node.data.label || `Untitled ${node.type}`,
        nodeType: node.type,
        type: 'unreachable',
        severity: 'error',
        message: node.reason || 'Node is unreachable from campaign entry points'
      })
    }
  })

  // 3. Find dead ends (warning - may be intentional)
  const deadEnds = findDeadEndNodes(nodes, edges)
  deadEnds.forEach(node => {
    // Skip if already marked as orphaned
    if (!orphaned.find(n => n.id === node.id)) {
      issues.push({
        nodeId: node.id,
        nodeLabel: node.data.label || `Untitled ${node.type}`,
        nodeType: node.type,
        type: 'dead_end',
        severity: 'info',
        message: 'Node has no outgoing connections (campaign ends here)'
      })
    }
  })

  // 4. Check for missing content (warning/error)
  const contentIssues = findContentIssues(nodes)
  issues.push(...contentIssues)

  // 5. Check for disconnected survey paths (warning)
  const pathIssues = findDisconnectedSurveyPaths(nodes, edges)
  issues.push(...pathIssues)

  // 6. Find entry points (info)
  const entryNodes = findNodesWithoutIncoming(nodes, edges)
  if (entryNodes.length > 1) {
    entryNodes.forEach(node => {
      if (!orphaned.find(n => n.id === node.id)) {
        issues.push({
          nodeId: node.id,
          nodeLabel: node.data.label || `Untitled ${node.type}`,
          nodeType: node.type,
          type: 'entry_point',
          severity: 'info',
          message: 'Potential campaign entry point (no incoming connections)'
        })
      }
    })
  }

  // Calculate summary
  const summary = {
    total: issues.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length
  }

  return {
    isValid: summary.errors === 0,
    isEmpty: false,
    summary,
    issues,
    nodeCount: nodes.length,
    edgeCount: edges.length
  }
}
