import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import ContentPanel from './components/ContentPanel'
import ValidationPanel from './components/ValidationPanel'
import EmailNode from './components/nodes/EmailNode'
import SurveyNode from './components/nodes/SurveyNode'
import ConditionalNode from './components/nodes/ConditionalNode'
import ActionNode from './components/nodes/ActionNode'
import DelayNode from './components/nodes/DelayNode'
import { exportCampaignJSON, exportAllEmailsAsZip, exportAsInteractiveHTML } from './utils/exportUtils'
import { loadTemplate } from './utils/campaignTemplates'
import { validateCampaign } from './utils/campaignValidation'
import toast, { Toaster } from 'react-hot-toast'

// Define custom node types
const nodeTypes = {
  email: EmailNode,
  survey: SurveyNode,
  conditional: ConditionalNode,
  action: ActionNode,
  delay: DelayNode,
}

let id = 0
const getId = () => `node_${id++}`

// Update ID counter based on existing nodes to avoid conflicts
const updateIdCounter = (nodes) => {
  if (!nodes || nodes.length === 0) return

  const maxId = nodes.reduce((max, node) => {
    // Extract number from node ID (e.g., "node_5" -> 5)
    const match = node.id.match(/node_(\d+)/)
    if (match) {
      const nodeNum = parseInt(match[1])
      return Math.max(max, nodeNum)
    }
    return max
  }, -1)

  // Set counter to one more than the highest existing ID
  if (maxId >= 0) {
    id = maxId + 1
  }
}

function FlowBuilder() {
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [campaignName, setCampaignName] = useState('Untitled Campaign')

  // History for undo/redo
  const [history, setHistory] = useState([{ nodes: [], edges: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Validation panel
  const [isValidationPanelOpen, setIsValidationPanelOpen] = useState(false)
  const [validationResults, setValidationResults] = useState(null)

  // Auto-save status (for draft indicator)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saving' | 'saved'
  const [lastSaved, setLastSaved] = useState(null) // timestamp

  const onConnect = useCallback(
    (params) => {
      // Find the source node to get path label for survey nodes
      const sourceNode = nodes.find((n) => n.id === params.source)
      let edgeLabel = ''

      if (sourceNode?.type === 'survey' && params.sourceHandle) {
        const path = sourceNode.data.responsePaths?.find(
          (p) => p.id === params.sourceHandle
        )
        if (path) {
          edgeLabel = path.label
        }
      }

      const newEdge = {
        ...params,
        label: edgeLabel,
        animated: false,
        style: {
          stroke: sourceNode?.data.responsePaths?.find((p) => p.id === params.sourceHandle)?.color || '#b1b1b7',
          strokeWidth: 2
        },
        labelStyle: { fontSize: 12, fontWeight: 500 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: sourceNode?.data.responsePaths?.find((p) => p.id === params.sourceHandle)?.color || '#b1b1b7',
        }
      }

      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges, nodes]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: getId(),
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          content: '',
          description: '',
          ...getDefaultDataForType(type),
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'email':
        return {
          subject: '', // Legacy single subject (for backward compatibility)
          subjectVariants: [
            { id: 'A', subject: '', weight: 33 },
            { id: 'B', subject: '', weight: 33 },
            { id: 'C', subject: '', weight: 34 }
          ],
          emailContent: '',
        }
      case 'survey':
        return {
          questions: [
            {
              id: 'q_1',
              text: '',
              questionType: 'radio', // radio, text, range, checkbox
              responseOptions: [
                { id: 'q_1_opt_1', text: 'Option 1', points: 0, allowsTextInput: false },
                { id: 'q_1_opt_2', text: 'Option 2', points: 0, allowsTextInput: false }
              ]
            }
          ],
          responsePaths: [
            {
              id: 'path_1',
              label: 'Path 1',
              mappedOptions: ['q_1_opt_1'],
              color: '#10b981',
              scoreMin: null,
              scoreMax: null,
              rangeConditions: [],  // Numeric range routing for range-type questions
              advancedRules: {
                enabled: false,
                requireAll: [],   // AND logic - all must be selected
                requireAny: [],   // OR logic - any must be selected
                requireNone: []   // NOT logic - none can be selected
              }
            },
            {
              id: 'path_2',
              label: 'Path 2',
              mappedOptions: ['q_1_opt_2'],
              color: '#3b82f6',
              scoreMin: null,
              scoreMax: null,
              rangeConditions: [],  // Numeric range routing for range-type questions
              advancedRules: {
                enabled: false,
                requireAll: [],
                requireAny: [],
                requireNone: []
              }
            }
          ]
        }
      case 'conditional':
        return {
          condition: '',
          truePath: '',
          falsePath: '',
        }
      case 'delay':
        return {
          duration: '1',
          unit: 'days',
        }
      default:
        return {}
    }
  }

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    setSelectedEdge(null)
  }, [setEdges])

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  const handleExportJSON = useCallback(() => {
    exportCampaignJSON({ campaignName, nodes, edges }, campaignName)
  }, [campaignName, nodes, edges])

  const handleExportEmails = useCallback(() => {
    exportAllEmailsAsZip(nodes, campaignName)
  }, [campaignName, nodes])

  const handleExportHTML = useCallback(() => {
    exportAsInteractiveHTML(nodes, edges, campaignName)
  }, [campaignName, nodes, edges])

  const handleImportJSON = useCallback((file) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)

        if (importedData.nodes && importedData.edges) {
          setCampaignName(importedData.campaignName || 'Imported Campaign')
          setNodes(importedData.nodes)
          setEdges(importedData.edges)
          updateIdCounter(importedData.nodes)
          toast.success('Campaign imported successfully!')
        } else {
          toast.error('Invalid campaign file format')
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Error importing campaign: ' + error.message)
      }
    }
    reader.readAsText(file)
  }, [setNodes, setEdges])

  const handleLoadTemplate = useCallback((templateKey) => {
    const templateData = loadTemplate(templateKey)
    if (templateData) {
      setNodes(templateData.nodes)
      setEdges(templateData.edges)
      updateIdCounter(templateData.nodes)
      toast.success('Template loaded successfully!')
    } else {
      toast.error('Failed to load template')
    }
  }, [setNodes, setEdges])

  const clearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This will also delete the auto-saved draft from browser storage.')) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      setCampaignName('Untitled Campaign')
      saveToHistory([], [])
      localStorage.removeItem('campaign-flow') // Clear the auto-saved draft
      setLastSaved(null)
      setSaveStatus('saved')
      id = 0 // Reset ID counter when clearing canvas
      toast.success('Canvas and draft cleared')
    }
  }, [setNodes, setEdges])

  const handleValidateCampaign = useCallback(() => {
    const results = validateCampaign(nodes, edges)
    setValidationResults(results)
    setIsValidationPanelOpen(true)
  }, [nodes, edges])

  const handleValidationIssueClick = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      // Select the node in the ContentPanel
      setSelectedNode(node)

      // Also visually select the node on the flowchart (highlight with colored ring)
      setNodes((nds) => nds.map(n => ({
        ...n,
        selected: n.id === nodeId
      })))

      setIsValidationPanelOpen(false)
    }
  }, [nodes, setNodes])

  // Helper function to duplicate a single node
  const duplicateSingleNode = useCallback((nodeToDuplicate) => {
    // Deep clone the node data
    const clonedData = JSON.parse(JSON.stringify(nodeToDuplicate.data))

    // Generate new IDs for nested items (for survey nodes)
    if (nodeToDuplicate.type === 'survey' && clonedData.questions) {
      // Generate new IDs for questions and their options
      clonedData.questions = clonedData.questions.map(q => {
        const newQuestionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newOptions = q.responseOptions?.map(opt => ({
          ...opt,
          id: `${newQuestionId}_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
        return {
          ...q,
          id: newQuestionId,
          responseOptions: newOptions || []
        }
      })

      // Generate new IDs for response paths and update their mappedOptions
      if (clonedData.responsePaths) {
        const oldToNewQuestionIds = {}
        nodeToDuplicate.data.questions?.forEach((oldQ, idx) => {
          oldToNewQuestionIds[oldQ.id] = clonedData.questions[idx].id
        })

        clonedData.responsePaths = clonedData.responsePaths.map(path => {
          const newPathId = `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

          // Update mapped options to use new question/option IDs
          const newMappedOptions = path.mappedOptions?.map(oldOptId => {
            // Find which question this option belongs to
            for (const oldQ of nodeToDuplicate.data.questions || []) {
              const optionIndex = oldQ.responseOptions?.findIndex(opt => opt.id === oldOptId)
              if (optionIndex !== -1) {
                const newQ = clonedData.questions.find(q =>
                  q.text === oldQ.text && q.questionType === oldQ.questionType
                )
                if (newQ && newQ.responseOptions && newQ.responseOptions[optionIndex]) {
                  return newQ.responseOptions[optionIndex].id
                }
              }
            }
            return oldOptId // Fallback
          })

          // Update range conditions to use new question IDs
          const newRangeConditions = path.rangeConditions?.map(cond => ({
            ...cond,
            id: `range_cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            questionId: oldToNewQuestionIds[cond.questionId] || cond.questionId
          }))

          // Update advanced rules to use new option IDs
          const newAdvancedRules = path.advancedRules ? {
            ...path.advancedRules,
            requireAll: path.advancedRules.requireAll?.map(oldOptId => {
              const newOptId = newMappedOptions?.find((newOpt, idx) =>
                path.mappedOptions?.[idx] === oldOptId
              )
              return newOptId || oldOptId
            }),
            requireAny: path.advancedRules.requireAny?.map(oldOptId => {
              const newOptId = newMappedOptions?.find((newOpt, idx) =>
                path.mappedOptions?.[idx] === oldOptId
              )
              return newOptId || oldOptId
            }),
            requireNone: path.advancedRules.requireNone?.map(oldOptId => {
              const newOptId = newMappedOptions?.find((newOpt, idx) =>
                path.mappedOptions?.[idx] === oldOptId
              )
              return newOptId || oldOptId
            })
          } : path.advancedRules

          return {
            ...path,
            id: newPathId,
            mappedOptions: newMappedOptions || [],
            rangeConditions: newRangeConditions || [],
            advancedRules: newAdvancedRules
          }
        })
      }
    }

    // Generate new IDs for email subject variants
    if (nodeToDuplicate.type === 'email' && clonedData.subjectVariants) {
      clonedData.subjectVariants = clonedData.subjectVariants.map(variant => ({
        ...variant
        // Keep same IDs (A, B, C) for variants, just copy the data
      }))
    }

    // Update label to indicate it's a copy
    if (clonedData.label) {
      clonedData.label = `${clonedData.label} (Copy)`
    }

    // Create new node with offset position
    const newNode = {
      ...nodeToDuplicate,
      id: `node_${id++}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      },
      data: clonedData,
      selected: false
    }

    return newNode
  }, [])

  // Duplicate one or more nodes
  const handleDuplicateNode = useCallback((nodeId) => {
    // Check if multiple nodes are selected
    const selectedNodes = nodes.filter(n => n.selected)

    // If multiple nodes selected, duplicate all of them
    if (selectedNodes.length > 1) {
      const newNodes = selectedNodes.map(node => duplicateSingleNode(node))
      setNodes((nds) => [...nds, ...newNodes])

      // Save to history
      const updatedNodes = [...nodes, ...newNodes]
      saveToHistory(updatedNodes, edges)

      toast.success(`${newNodes.length} nodes duplicated!`)
      return
    }

    // Single node duplication (original behavior)
    const nodeToDuplicate = nodeId
      ? nodes.find(n => n.id === nodeId)
      : selectedNodes[0]

    if (!nodeToDuplicate) {
      toast.error('No node selected to duplicate!')
      return
    }

    const newNode = duplicateSingleNode(nodeToDuplicate)
    setNodes((nds) => [...nds, newNode])

    // Save to history
    const newNodesArray = [...nodes, newNode]
    saveToHistory(newNodesArray, edges)

    toast.success(`Node duplicated: ${newNode.data.label || nodeToDuplicate.type}`)
  }, [nodes, edges, setNodes, duplicateSingleNode])

  // Save current state to history
  const saveToHistory = useCallback((newNodes, newEdges) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ nodes: newNodes, edges: newEdges })
      // Limit history to 50 steps
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }, [historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      setNodes(state.nodes)
      setEdges(state.edges)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex, setNodes, setEdges])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      setNodes(state.nodes)
      setEdges(state.edges)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex, setNodes, setEdges])

  // Delete node
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const newNodes = nds.filter((node) => node.id !== nodeId)
      saveToHistory(newNodes, edges)
      return newNodes
    })
    setEdges((eds) => {
      const newEdges = eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      return newEdges
    })
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }, [setNodes, setEdges, selectedNode, edges, saveToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts if user is typing in an input field
      const isTyping = event.target.tagName === 'INPUT' ||
                       event.target.tagName === 'TEXTAREA' ||
                       event.target.isContentEditable

      // Delete key - delete selected node or edge
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isTyping) {
        event.preventDefault()
        if (selectedNode) {
          deleteNode(selectedNode.id)
        } else if (selectedEdge) {
          deleteEdge(selectedEdge.id)
        }
      }

      // Ctrl+Z - Undo
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault()
        redo()
      }

      // Ctrl+D or Cmd+D - Duplicate selected node(s)
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && !isTyping) {
        event.preventDefault()
        handleDuplicateNode()
      }

      // Ctrl+A or Cmd+A - Select all nodes
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !isTyping) {
        event.preventDefault()
        setNodes((nds) => nds.map(node => ({ ...node, selected: true })))
        toast.success(`${nodes.length} nodes selected`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, undo, redo, handleDuplicateNode, nodes, setNodes])

  // Save to history when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const timeoutId = setTimeout(() => {
        saveToHistory(nodes, edges)
      }, 500) // Debounce to avoid saving too frequently

      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges])

  // Auto-load draft from localStorage on mount
  useEffect(() => {
    const savedFlow = localStorage.getItem('campaign-flow')
    if (savedFlow) {
      try {
        const flowData = JSON.parse(savedFlow)
        setCampaignName(flowData.campaignName || 'Untitled Campaign')
        setNodes(flowData.nodes || [])
        setEdges(flowData.edges || [])
        updateIdCounter(flowData.nodes || [])
        setLastSaved(flowData.timestamp || null)
        toast.success('Draft restored from browser storage', {
          icon: '📄',
          duration: 2000
        })
      } catch (error) {
        console.error('Failed to load draft:', error)
        toast.error('Failed to restore draft')
      }
    }
  }, []) // Run only once on mount

  // Auto-save draft to localStorage when campaign changes
  useEffect(() => {
    // Don't auto-save on initial mount (empty campaign)
    if (nodes.length === 0 && edges.length === 0 && campaignName === 'Untitled Campaign') {
      return
    }

    setSaveStatus('saving')

    const timeoutId = setTimeout(() => {
      const flowData = {
        campaignName,
        nodes,
        edges,
        timestamp: Date.now()
      }
      try {
        localStorage.setItem('campaign-flow', JSON.stringify(flowData))
        setSaveStatus('saved')
        setLastSaved(Date.now())
      } catch (error) {
        console.error('Failed to auto-save:', error)
        toast.error('Failed to save draft')
        setSaveStatus('saved') // Reset status even on error
      }
    }, 500) // Debounce: save 500ms after last change

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, campaignName])

  return (
    <div className="h-screen flex flex-col">
      <TopBar
        campaignName={campaignName}
        onCampaignNameChange={setCampaignName}
        onSave={handleExportJSON}
        onImport={handleImportJSON}
        onLoadTemplate={handleLoadTemplate}
        onExportEmails={handleExportEmails}
        onExportHTML={handleExportHTML}
        onClear={clearCanvas}
        onValidate={handleValidateCampaign}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges.map(edge => ({
              ...edge,
              selected: selectedEdge?.id === edge.id,
              style: {
                ...edge.style,
                strokeWidth: selectedEdge?.id === edge.id ? 3 : 2
              }
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            selectionOnDrag={true}
            panOnDrag={true}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Shift"
            selectionMode="partial"
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>

          {/* Multi-select hint */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-gray-300 shadow-lg rounded-lg px-3 py-2 z-10">
            <div className="text-xs text-gray-700 space-y-1">
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift</kbd> + Drag = Select multiple</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift</kbd> + Click = Add to selection</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">A</kbd> = Select all</div>
            </div>
          </div>

          {selectedEdge && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-2 flex items-center space-x-3 z-10">
              <span className="text-sm text-gray-700">
                Connection selected
              </span>
              <button
                onClick={() => deleteEdge(selectedEdge.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <span className="text-xs text-gray-500">
                or press Delete/Backspace
              </span>
            </div>
          )}
        </div>
        {selectedNode && (
          <ContentPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
            onDelete={deleteNode}
            onDuplicate={handleDuplicateNode}
          />
        )}
      </div>
      {validationResults && (
        <ValidationPanel
          isOpen={isValidationPanelOpen}
          onClose={() => setIsValidationPanelOpen(false)}
          validationResults={validationResults}
          onIssueClick={handleValidationIssueClick}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <FlowBuilder />
    </ReactFlowProvider>
  )
}

export default App
