import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useCurrency } from '../../hooks/useCurrency'
import { toolsService } from '../../services/tools'
import { queryKeys } from '../../lib/queryKeys'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, useReactFlow, Handle, Position, ReactFlowProvider, getNodesBounds, getViewportForBounds } from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { Button } from '../ui/button'
import { Download, Maximize2, Minimize2, Shield } from 'lucide-react'
import Loading from '../ui/Loading'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// --- OKLCH → sRGB conversion helpers (same as AssetMapTab) ---
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
    return null
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
    if (alphaRaw.includes('%')) {
      alpha = parseFloat(alphaRaw) / 100
    } else {
      alpha = parseFloat(alphaRaw)
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
    for (let i = 0; i < rule.style.length; i++) {
      const prop = rule.style[i]
      const val = rule.style.getPropertyValue(prop)
      const newVal = replaceOklchInValue(val)
      if (newVal !== val) {
        rule.style.setProperty(prop, newVal)
      }
    }
  }

  if ('cssRules' in rule && rule.cssRules) {
    Array.from(rule.cssRules).forEach(scrubCssRule)
  }
}

const scrubOklchFromStylesheets = (doc) => {
  if (!doc?.styleSheets) return

  const styleSheets = Array.from(doc.styleSheets)
  styleSheets.forEach((sheet) => {
    try {
      if (sheet.cssRules) {
        Array.from(sheet.cssRules).forEach(scrubCssRule)
      }
    } catch (e) {
      // Ignore CORS errors
    }
  })
}

const scrubOklchFromInlineStyles = (doc) => {
  const allElements = doc.querySelectorAll('[style]')
  allElements.forEach((element) => {
    const style = element.getAttribute('style')
    const newStyle = replaceOklchInValue(style)
    if (newStyle !== style) {
      element.setAttribute('style', newStyle)
    }
  })
}

const overrideRootCustomProperties = (doc) => {
  const { documentElement } = doc
  const win = doc.defaultView
  if (!documentElement || !win) return

  const computed = win.getComputedStyle(documentElement)

  for (let i = 0; i < computed.length; i += 1) {
    const prop = computed[i]
    if (prop.startsWith('--')) {
      const value = computed.getPropertyValue(prop)
      const newValue = replaceOklchInValue(value)
      if (newValue !== value) {
        documentElement.style.setProperty(prop, newValue, 'important')
      }
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
    const computed = win.getComputedStyle(element)

    colorProps.forEach((propCamel) => {
      const cssProp = toCssProperty(propCamel)
      const val = computed.getPropertyValue(cssProp)
      if (val) {
        const newVal = replaceOklchInValue(val)
        if (newVal !== val) {
          element.style.setProperty(cssProp, newVal, 'important')
        }
      }
    })

    shadowProps.forEach((propCamel) => {
      const cssProp = toCssProperty(propCamel)
      const val = computed.getPropertyValue(cssProp)
      if (val) {
        const newVal = replaceOklchInValue(val)
        if (newVal !== val) {
          element.style.setProperty(cssProp, newVal, 'important')
        }
      }
    })
  })
}

// Dagre graph configuration
const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 220
const nodeHeight = 100

// Layout nodes using dagre for horizontal left-to-right flow
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 180 })

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
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// Custom Root Node - Shows total insurance coverage and premium
const RootNode = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark')
  
  return (
    <div 
      className={`px-6 py-4 rounded-xl border-4 shadow-2xl ${
        isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600' : 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-400'
      }`}
      style={{
        width: 280,
        minHeight: 120,
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#2563eb', width: 12, height: 12 }}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <div className="text-lg font-bold">{data.label}</div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {data.formattedCoverage}
        </div>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Annual Premium: {data.formattedPremium}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {data.policyCount} {data.policyCount === 1 ? 'policy' : 'policies'}
        </div>
      </div>
    </div>
  )
}

// Custom Policy Type Node - Shows aggregated data per insurance type
const PolicyTypeNode = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark')
  
  return (
    <div 
      className={`px-5 py-3 rounded-lg border-3 shadow-lg ${
        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-400'
      }`}
      style={{
        width: 240,
        minHeight: 100,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#6b7280' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#6b7280' }}
      />
      
      <div className="text-base font-bold mb-2 text-blue-600 dark:text-blue-400">
        {data.label}
      </div>
      <div className="space-y-1">
        <div className="text-lg font-bold">
          {data.formattedCoverage}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Premium: {data.formattedPremium}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {data.policyCount} {data.policyCount === 1 ? 'policy' : 'policies'}
        </div>
      </div>
    </div>
  )
}

// Custom Individual Policy Node - Shows specific policy details
const PolicyNode = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark')
  
  // Status color mapping
  const statusColors = {
    active: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
    expired: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800',
    cancelled: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
  }
  
  return (
    <div 
      className={`px-4 py-3 rounded-lg border-2 shadow-md ${
        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      }`}
      style={{
        width: 220,
        minHeight: 90,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      
      <div className="space-y-1">
        <div className="text-sm font-semibold truncate" title={data.label}>
          {data.label}
        </div>
        <div className="text-base font-bold text-blue-600 dark:text-blue-400">
          {data.formattedCoverage}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Premium: {data.formattedPremium}
        </div>
        {data.provider && (
          <div className="text-xs text-gray-500 truncate" title={data.provider}>
            {data.provider}
          </div>
        )}
        {data.status && (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[data.status] || statusColors.active}`}>
            {data.status}
          </span>
        )}
      </div>
    </div>
  )
}

const nodeTypes = {
  root: RootNode,
  policyType: PolicyTypeNode,
  policy: PolicyNode,
}

const InsuranceMappingTab = () => {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const reactFlowWrapper = useRef(null)
  const { fitView, getNodes } = useReactFlow()

  // Fetch insurance hierarchy data
  const {
    data: hierarchyData,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.insurance.hierarchy(),
    queryFn: ({ signal }) => toolsService.getInsuranceHierarchy({ signal }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  // Transform hierarchy data into React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    if (!hierarchyData || !hierarchyData.root) {
      return { nodes: [], edges: [] }
    }

    const nodes = []
    const edges = []
    let nodeIdCounter = 0

    // Root node
    const rootId = `root-${nodeIdCounter++}`
    nodes.push({
      id: rootId,
      type: 'root',
      position: { x: 0, y: 0 },
      data: {
        label: 'Total Insurance Coverage',
        formattedCoverage: formatCurrency(hierarchyData.root.total_coverage),
        formattedPremium: formatCurrency(hierarchyData.root.total_annual_premium),
        policyCount: hierarchyData.root.policy_count,
      },
    })

    // Policy type nodes and individual policy nodes
    hierarchyData.types.forEach((typeData) => {
      const typeId = `type-${nodeIdCounter++}`
      
      // Add policy type node
      nodes.push({
        id: typeId,
        type: 'policyType',
        position: { x: 0, y: 0 },
        data: {
          label: typeData.type_label,
          formattedCoverage: formatCurrency(typeData.total_coverage),
          formattedPremium: formatCurrency(typeData.total_annual_premium),
          policyCount: typeData.policy_count,
        },
      })

      // Edge from root to policy type
      edges.push({
        id: `${rootId}-${typeId}`,
        source: rootId,
        target: typeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      })

      // Add individual policy nodes
      typeData.policies.forEach((policy) => {
        const policyId = `policy-${nodeIdCounter++}`
        
        nodes.push({
          id: policyId,
          type: 'policy',
          position: { x: 0, y: 0 },
          data: {
            label: policy.name,
            formattedCoverage: formatCurrency(policy.coverage),
            formattedPremium: formatCurrency(policy.annual_premium),
            provider: policy.provider,
            status: policy.status,
          },
        })

        // Edge from policy type to individual policy
        edges.push({
          id: `${typeId}-${policyId}`,
          source: typeId,
          target: policyId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#6b7280', strokeWidth: 1.5 },
        })
      })
    })

    return getLayoutedElements(nodes, edges)
  }, [hierarchyData, formatCurrency])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([])
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([])

  // Update nodes/edges when hierarchy data changes
  React.useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nodes)
      setEdges(edges)
      
      // Fit view after layout
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 })
      }, 100)
    }
  }, [nodes, edges, setNodes, setEdges, fitView])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Export as PDF with OKLCH conversion
  const handleExportPDF = useCallback(async () => {
    if (!reactFlowWrapper.current) {
      toast.error('Visualization not ready for export')
      return
    }

    try {
      toast.info('Generating PDF export...')

      const nodes = getNodes()
      if (!nodes || nodes.length === 0) {
        toast.error('No data to export')
        return
      }

      // Calculate dimensions using React Flow utilities
      const nodesBounds = getNodesBounds(nodes)
      const imageWidth = nodesBounds.width
      const imageHeight = nodesBounds.height
      
      // getViewportForBounds returns { x, y, zoom } in React Flow v12
      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5, // min zoom
        2,   // max zoom
        0.1  // padding
      )

      // Find the React Flow container (parent of both viewport and edges)
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow')
      if (!reactFlowElement) {
        toast.error('Could not find visualization to export')
        return
      }

      // Capture using html2canvas with the entire React Flow container
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: imageWidth,
        height: imageHeight,
        windowWidth: imageWidth,
        windowHeight: imageHeight,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          // Apply OKLCH sanitization
          scrubOklchFromStylesheets(clonedDoc)
          scrubOklchFromInlineStyles(clonedDoc)
          overrideRootCustomProperties(clonedDoc)
          inlineCriticalColors(clonedDoc)
          
          // Find the cloned React Flow element
          const clonedReactFlow = clonedDoc.querySelector('.react-flow')
          if (clonedReactFlow) {
            // Apply transform to show all content (viewport object has { x, y, zoom })
            const clonedViewport = clonedReactFlow.querySelector('.react-flow__viewport')
            if (clonedViewport) {
              clonedViewport.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
            }
            
            // Ensure edges layer is visible and properly styled
            const edgesLayer = clonedReactFlow.querySelector('.react-flow__edges')
            if (edgesLayer) {
              edgesLayer.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
              edgesLayer.style.width = '100%'
              edgesLayer.style.height = '100%'
            }
          }
          
          // Remove text truncation
          const truncatedElements = clonedDoc.querySelectorAll('.truncate')
          truncatedElements.forEach(el => {
            el.classList.remove('truncate')
            el.style.whiteSpace = 'normal'
            el.style.overflow = 'visible'
            el.style.textOverflow = 'clip'
          })
          
          // Allow nodes to expand for full text
          const nodeElements = clonedDoc.querySelectorAll('[data-id]')
          nodeElements.forEach(node => {
            const innerDiv = node.querySelector('div')
            if (innerDiv) {
              innerDiv.style.width = 'auto'
              innerDiv.style.minWidth = '200px'
              innerDiv.style.maxWidth = '300px'
            }
          })
        }
      })

      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = canvas.width / 2  // Divide by scale factor
      const pdfHeight = canvas.height / 2
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`insurance-map-${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success('PDF exported successfully!')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF')
    }
  }, [getNodes])

  if (isLoading) {
    return <Loading pageName="Insurance Mapping" />
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error loading insurance data: {error.message}
        </div>
      </div>
    )
  }

  if (!hierarchyData || !hierarchyData.root || hierarchyData.root.policy_count === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">No Insurance Policies</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add insurance policies to visualize your coverage mapping.
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
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Insurance Coverage Map</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {hierarchyData.root.policy_count} policies • {formatCurrency(hierarchyData.root.total_coverage)} coverage
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            title="Download as PDF"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* React Flow Visualization */}
      <div ref={reactFlowWrapper} className="flex-1 bg-gray-50 dark:bg-gray-900">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
          }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>
    </div>
  )
}

// Wrap with ReactFlowProvider to enable useReactFlow hook
const InsuranceMappingTabWithProvider = () => (
  <ReactFlowProvider>
    <InsuranceMappingTab />
  </ReactFlowProvider>
)

export default InsuranceMappingTabWithProvider
