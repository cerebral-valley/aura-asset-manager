import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useCurrency } from '../../hooks/useCurrency'
import { toolsService, DEFAULT_HIERARCHY } from '../../services/tools'
import { queryKeys } from '../../lib/queryKeys'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, useReactFlow, Handle, Position, ReactFlowProvider } from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { Button } from '../ui/button'
import { Download, Maximize2, Minimize2 } from 'lucide-react'
import Loading from '../ui/Loading'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// --- OKLCH → sRGB conversion helpers ---
const clamp01 = (value) => Math.min(1, Math.max(0, value))

const linearToSrgb = (value) => {
  if (value <= 0.0031308) {
    return 12.92 * value
  }
  return 1.055 * Math.pow(value, 1 / 2.4) - 0.055
}

const oklchTokenToRGBA = (token) => {
  const match = token
    .replace(/\s+/g, ' ')
    .replace(/\/\s+/g, '/')
    .replace(/\s+\//g, '/')
    .match(/^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.+-]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i)

  if (!match) {
    return token
  }

  const [, lRaw, cRaw, hRaw, alphaRaw] = match
  const L = parseFloat(lRaw)
  const C = parseFloat(cRaw)
  const hDeg = parseFloat(hRaw)
  const hRad = (hDeg * Math.PI) / 180
  const a = Math.cos(hRad) * C
  const b = Math.sin(hRad) * C

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  let bVal = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3

  r = linearToSrgb(clamp01(r))
  g = linearToSrgb(clamp01(g))
  bVal = linearToSrgb(clamp01(bVal))

  const r255 = Math.round(clamp01(r) * 255)
  const g255 = Math.round(clamp01(g) * 255)
  const b255 = Math.round(clamp01(bVal) * 255)

  let alpha = 1
  if (alphaRaw !== undefined) {
    if (alphaRaw.endsWith('%')) {
      alpha = clamp01(parseFloat(alphaRaw) / 100)
    } else {
      alpha = clamp01(parseFloat(alphaRaw))
    }
  }

  if (alpha === 1) {
    return `rgb(${r255}, ${g255}, ${b255})`
  }
  return `rgba(${r255}, ${g255}, ${b255}, ${alpha.toFixed(3)})`
}

const replaceOklchInValue = (value) => {
  if (!value || typeof value !== 'string' || !value.toLowerCase().includes('oklch')) {
    return value
  }

  return value.replace(/oklch\([^)]+\)/gi, (token) => oklchTokenToRGBA(token))
}

const scrubCssRule = (rule) => {
  if (!rule) return

  if ('style' in rule && rule.style) {
    const { style } = rule
    for (let i = 0; i < style.length; i += 1) {
      const propertyName = style[i]
      const propertyValue = style.getPropertyValue(propertyName)
      if (propertyValue && propertyValue.toLowerCase().includes('oklch')) {
        const priority = style.getPropertyPriority(propertyName)
        style.setProperty(propertyName, replaceOklchInValue(propertyValue), priority)
      }
    }
  }

  if ('cssRules' in rule && rule.cssRules) {
    Array.from(rule.cssRules).forEach((nestedRule) => scrubCssRule(nestedRule))
  }
}

const scrubOklchFromStylesheets = (doc) => {
  if (!doc?.styleSheets) return

  const styleSheets = Array.from(doc.styleSheets)
  styleSheets.forEach((sheet) => {
    let cssRules
    try {
      cssRules = sheet.cssRules
    } catch {
      // Cross-origin or unreadable stylesheet; skip
      return
    }

    if (!cssRules) return

    Array.from(cssRules).forEach((rule) => scrubCssRule(rule))
  })
}

const scrubOklchFromInlineStyles = (doc) => {
  const allElements = doc.querySelectorAll('[style]')
  allElements.forEach((element) => {
    const styleAttr = element.getAttribute('style')
    if (styleAttr && styleAttr.toLowerCase().includes('oklch')) {
      element.setAttribute('style', replaceOklchInValue(styleAttr))
    }
  })
}

const overrideRootCustomProperties = (doc) => {
  const { documentElement } = doc
  const win = doc.defaultView
  if (!documentElement || !win) return

  const computed = win.getComputedStyle(documentElement)

  for (let i = 0; i < computed.length; i += 1) {
    const property = computed[i]
    if (!property.startsWith('--')) continue

    const value = computed.getPropertyValue(property)
    if (value && value.toLowerCase().includes('oklch')) {
      documentElement.style.setProperty(property, replaceOklchInValue(value))
    }
  }
}

const inlineCriticalColors = (doc) => {
  const win = doc.defaultView
  if (!win) return

  const colorProps = [
    'color',
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'textDecorationColor',
    'fill',
    'stroke',
  ]

  const shadowProps = ['boxShadow', 'textShadow']

  const toCssProperty = (prop) => prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

  const elements = doc.querySelectorAll('*')
  elements.forEach((element) => {
    let computed
    try {
      computed = win.getComputedStyle(element)
    } catch {
      return
    }

    colorProps.forEach((prop) => {
      const value = computed?.[prop]
      if (value && value !== 'rgb(0, 0, 0)' && value !== 'rgba(0, 0, 0, 0)' && value !== 'none') {
        element.style.setProperty(toCssProperty(prop), replaceOklchInValue(value))
      }
    })

    shadowProps.forEach((prop) => {
      const value = computed?.[prop]
      if (value && value !== 'none') {
        element.style.setProperty(toCssProperty(prop), replaceOklchInValue(value))
      }
    })
  })
}

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
      {/* Target handle (input - left side) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      
      <div className="text-sm font-semibold truncate" title={data.label}>
        {data.label}
      </div>
      <div className="text-lg font-bold mt-1">
        {data.formattedValue}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {data.percentage}% • {data.assetCount} {data.assetCount === 1 ? 'asset' : 'assets'}
      </div>
      
      {/* Source handle (output - right side) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
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
  const { fitView, getNodes } = useReactFlow()

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

  // Export as PDF - captures entire flow canvas
  const handleExportPDF = useCallback(async () => {
    if (!reactFlowWrapper.current) return

    try {
      toast.info('Generating PDF...')
      
      // Get all nodes to calculate full canvas dimensions
      const nodes = getNodes()
      if (!nodes || nodes.length === 0) {
        toast.error('No nodes to export')
        return
      }

      // Store current viewport state
      const flowElement = reactFlowWrapper.current.querySelector('.react-flow')
      const originalTransform = flowElement?.style?.transform
      
      // Calculate bounding box of all nodes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      nodes.forEach(node => {
        const x1 = node.position.x
        const y1 = node.position.y
        const x2 = x1 + (node.width || nodeWidth)
        const y2 = y1 + (node.height || nodeHeight)
        
        minX = Math.min(minX, x1)
        minY = Math.min(minY, y1)
        maxX = Math.max(maxX, x2)
        maxY = Math.max(maxY, y2)
      })

      // Add padding around the content
      const padding = 50
      const fullWidth = maxX - minX + (padding * 2)
      const fullHeight = maxY - minY + (padding * 2)

      // Temporarily fit view to show all nodes
      await fitView({ 
        padding: 0.1,
        duration: 0 // Instant, no animation
      })

      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100))

      // Find the React Flow viewport element
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport')
      if (!viewport) {
        toast.error('Could not find visualization to export')
        return
      }

      // Capture the canvas with OKLCH sanitisation
      const canvas = await html2canvas(viewport, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        scale: 2, // Higher quality
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        onclone: (clonedDoc) => {
          scrubOklchFromStylesheets(clonedDoc)
          scrubOklchFromInlineStyles(clonedDoc)
          overrideRootCustomProperties(clonedDoc)
          inlineCriticalColors(clonedDoc)
        }
      })

      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/png')
      
      // Calculate PDF dimensions to fit content
      const pdfWidth = canvas.width
      const pdfHeight = canvas.height
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`asset-map-${new Date().toISOString().split('T')[0]}.pdf`)

      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF')
    }
  }, [getNodes, fitView])

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
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
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

// Wrap with ReactFlowProvider to enable useReactFlow hook
const AssetMapTabWithProvider = () => (
  <ReactFlowProvider>
    <AssetMapTab />
  </ReactFlowProvider>
)

export default AssetMapTabWithProvider
