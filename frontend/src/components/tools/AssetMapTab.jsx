import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useCurrency } from '../../hooks/useCurrency'
import { toolsService, DEFAULT_HIERARCHY } from '../../services/tools'
import { queryKeys } from '../../lib/queryKeys'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, useReactFlow } from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { Button } from '../ui/button'
import { Download, Maximize2, Minimize2 } from 'lucide-react'
import Loading from '../ui/Loading'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Dagre graph configuration
const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 200
const nodeHeight = 80

// Layout nodes using dagre for horizontal left-to-right flow
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 150 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    
    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// Custom node component with value and percentage
const CustomNode = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark')
  
  return (
    <div 
      className={`px-4 py-3 rounded-lg border-2 shadow-md ${
        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      }`}
      style={{
        width: nodeWidth,
        minHeight: nodeHeight,
      }}
    >
      <div className="text-sm font-semibold truncate" title={data.label}>
        {data.label}
      </div>
      <div className="text-lg font-bold mt-1">
        {data.formattedValue}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {data.percentage}% • {data.assetCount} {data.assetCount === 1 ? 'asset' : 'assets'}
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

const AssetMapTab = () => {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const [hierarchy, setHierarchy] = useState(DEFAULT_HIERARCHY)
  const [depth, setDepth] = useState(5)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const reactFlowWrapper = useRef(null)

  // Fetch asset hierarchy data
  const {
    data: hierarchyData,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.tools.assetHierarchy({ hierarchy, depth }),
    queryFn: ({ signal }) => toolsService.getAssetHierarchy({ hierarchy, depth }, { signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Transform hierarchy data into React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    if (!hierarchyData || !hierarchyData.nodes) {
      return { nodes: [], edges: [] }
    }

    const rawNodes = hierarchyData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      data: {
        label: node.label,
        formattedValue: formatCurrency(node.value),
        percentage: node.percentage.toFixed(1),
        assetCount: node.asset_count,
        category: node.category,
        level: node.level,
      },
      position: { x: 0, y: 0 }, // Will be set by dagre
    }))

    const isDark = document.documentElement.classList.contains('dark')
    
    const rawEdges = hierarchyData.edges.map((edge, index) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: isDark ? '#60a5fa' : '#3b82f6',
        strokeWidth: 2
      },
      markerEnd: {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: isDark ? '#60a5fa' : '#3b82f6',
      },
    }))

    return getLayoutedElements(rawNodes, rawEdges)
  }, [hierarchyData, formatCurrency])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([])
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([])

  // Update nodes/edges when hierarchy data changes
  React.useEffect(() => {
    console.log('🔄 AssetMapTab: useEffect triggered', { 
      nodesCount: nodes.length, 
      edgesCount: edges.length,
      hierarchyData: !!hierarchyData,
      hierarchyHasEdges: hierarchyData?.edges?.length 
    })
    setNodes(nodes)
    setEdges(edges)
  }, [hierarchyData]) // Only depend on source data to avoid infinite loop

  // Handle hierarchy reordering
  const handleHierarchyChange = useCallback((newHierarchy) => {
    setHierarchy(newHierarchy)
  }, [])

  // Handle depth change
  const handleDepthChange = useCallback((newDepth) => {
    setDepth(newDepth)
  }, [])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Export as PNG
  const handleExportPNG = useCallback(async () => {
    if (!reactFlowWrapper.current) return

    try {
      toast.info('Generating PNG...')
      
      // Find the React Flow viewport element
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport')
      if (!viewport) {
        toast.error('Could not find visualization to export')
        return
      }

      // Capture the canvas with OKLCH color workaround
      const canvas = await html2canvas(viewport, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        scale: 2, // Higher quality
        ignoreElements: (element) => {
          // Skip elements that might have OKLCH colors we can't handle
          return false
        },
        onclone: (clonedDoc) => {
          // Convert any OKLCH colors to safe HEX equivalents in the cloned document
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el)
            // Force recompute colors to RGB which html2canvas can handle
            if (computedStyle.color) el.style.color = computedStyle.color
            if (computedStyle.backgroundColor) el.style.backgroundColor = computedStyle.backgroundColor
            if (computedStyle.borderColor) el.style.borderColor = computedStyle.borderColor
          })
        }
      })

      // Download as PNG
      const link = document.createElement('a')
      link.download = `asset-map-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast.success('PNG downloaded successfully!')
    } catch (error) {
      console.error('PNG export error:', error)
      toast.error('Failed to export PNG')
    }
  }, [])

  // Export as PDF
  const handleExportPDF = useCallback(async () => {
    if (!reactFlowWrapper.current) return

    try {
      toast.info('Generating PDF...')
      
      // Find the React Flow viewport element
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport')
      if (!viewport) {
        toast.error('Could not find visualization to export')
        return
      }

      // Capture the canvas with OKLCH color workaround
      const canvas = await html2canvas(viewport, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        scale: 2,
        onclone: (clonedDoc) => {
          // Convert any OKLCH colors to safe RGB equivalents in the cloned document
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el)
            // Force recompute colors to RGB which html2canvas can handle
            if (computedStyle.color) el.style.color = computedStyle.color
            if (computedStyle.backgroundColor) el.style.backgroundColor = computedStyle.backgroundColor
            if (computedStyle.borderColor) el.style.borderColor = computedStyle.borderColor
          })
        }
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`asset-map-${new Date().toISOString().split('T')[0]}.pdf`)

      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF')
    }
  }, [])

  if (isLoading) {
    return <Loading pageName="Asset Map" />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading asset map</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!hierarchyData || hierarchyData.asset_count === 0) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-blue-800 dark:text-blue-200 font-semibold">No Assets Found</h3>
          <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
            Add some assets to see your asset map visualization.
          </p>
        </div>
      </div>
    )
  }

  // Fullscreen wrapper class
  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900'
    : 'flex flex-col h-full'

  return (
    <div className={wrapperClass}>
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm font-medium mr-2">Depth:</label>
            <select
              value={depth}
              onChange={(e) => handleDepthChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'level' : 'levels'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="gap-2"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  Fullscreen
                </>
              )}
            </Button>
            <Button
              onClick={handleExportPNG}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PNG
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Total: {formatCurrency(hierarchyData.total_value)} • {hierarchyData.asset_count} assets
        </div>
      </div>

      {/* React Flow Canvas */}
      <div 
        ref={reactFlowWrapper}
        className="flex-1" 
        style={{ 
          height: isFullscreen ? 'calc(100vh - 120px)' : 'calc(100vh - 300px)', 
          minHeight: isFullscreen ? '100%' : '600px'
        }}
      >
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background />
          <Controls 
            className="react-flow__controls-custom"
            style={{
              button: {
                backgroundColor: 'var(--controls-bg)',
                borderColor: 'var(--controls-border)',
                color: 'var(--controls-color)',
              }
            }}
          />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="react-flow__minimap-custom"
            style={{
              backgroundColor: 'var(--minimap-bg)',
              border: '1px solid var(--minimap-border)',
            }}
          />
        </ReactFlow>
      </div>

      {/* Custom CSS for dark mode controls */}
      <style jsx>{`
        :global(.react-flow__controls-custom button) {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
          color: #1f2937 !important;
        }
        
        :global(.dark .react-flow__controls-custom button) {
          background-color: #374151 !important;
          border: 1px solid #4b5563 !important;
          color: #f3f4f6 !important;
        }
        
        :global(.react-flow__controls-custom button:hover) {
          background-color: #f3f4f6 !important;
        }
        
        :global(.dark .react-flow__controls-custom button:hover) {
          background-color: #4b5563 !important;
        }
        
        :global(.react-flow__controls-custom button svg) {
          fill: currentColor !important;
        }
        
        :global(.react-flow__minimap-custom) {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
        }
        
        :global(.dark .react-flow__minimap-custom) {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
        }
        
        :global(.react-flow__edge-path) {
          stroke-width: 2 !important;
        }
      `}</style>
    </div>
  )
}

export default AssetMapTab
