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
import EmailNode from './components/nodes/EmailNode'
import SurveyNode from './components/nodes/SurveyNode'
import ConditionalNode from './components/nodes/ConditionalNode'
import ActionNode from './components/nodes/ActionNode'
import DelayNode from './components/nodes/DelayNode'
import { exportCampaignJSON, exportAllEmailsAsZip, exportAsInteractiveHTML } from './utils/exportUtils'
import { loadTemplate } from './utils/campaignTemplates'

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
                { id: 'q_1_opt_1', text: 'Option 1', points: 0 },
                { id: 'q_1_opt_2', text: 'Option 2', points: 0 }
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

  const saveToLocalStorage = useCallback(() => {
    const flowData = {
      campaignName,
      nodes,
      edges,
    }
    localStorage.setItem('campaign-flow', JSON.stringify(flowData))
    alert('Campaign saved successfully!')
  }, [campaignName, nodes, edges])

  const loadFromLocalStorage = useCallback(() => {
    const savedFlow = localStorage.getItem('campaign-flow')
    if (savedFlow) {
      const flowData = JSON.parse(savedFlow)
      setCampaignName(flowData.campaignName || 'Untitled Campaign')
      setNodes(flowData.nodes || [])
      setEdges(flowData.edges || [])
      updateIdCounter(flowData.nodes || [])
      alert('Campaign loaded successfully!')
    } else {
      alert('No saved campaign found!')
    }
  }, [setNodes, setEdges])

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
          alert('Campaign imported successfully!')
        } else {
          alert('Invalid campaign file format')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Error importing campaign: ' + error.message)
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
      alert('Template loaded successfully!')
    } else {
      alert('Failed to load template')
    }
  }, [setNodes, setEdges])

  const clearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      saveToHistory([], [])
      id = 0 // Reset ID counter when clearing canvas
    }
  }, [setNodes, setEdges])

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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, undo, redo])

  // Save to history when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const timeoutId = setTimeout(() => {
        saveToHistory(nodes, edges)
      }, 500) // Debounce to avoid saving too frequently

      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges])

  return (
    <div className="h-screen flex flex-col">
      <TopBar
        campaignName={campaignName}
        onCampaignNameChange={setCampaignName}
        onSave={saveToLocalStorage}
        onLoad={loadFromLocalStorage}
        onImport={handleImportJSON}
        onLoadTemplate={handleLoadTemplate}
        onExportJSON={handleExportJSON}
        onExportEmails={handleExportEmails}
        onExportHTML={handleExportHTML}
        onClear={clearCanvas}
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
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
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
          />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  )
}

export default App
