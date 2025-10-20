import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useCurrency } from '../../hooks/useCurrency'
import { toolsService, DEFAULT_HIERARCHY } from '../../services/tools'
import { queryKeys } from '../../lib/queryKeys'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, useReactFlow, Handle, Position, ReactFlowProvider, getNodesBounds, getViewportForBounds } from '@xyflow/react'
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

const sanitizeColor = (value, fallback) => {
  if (!value) return fallback
  const sanitized = replaceOklchInValue(value)
  if (!sanitized || sanitized.toLowerCase().includes('oklch')) {
    return fallback
  }
  return sanitized
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

  const minX = Math.min(...layoutedNodes.map((node) => node.position.x))
  const minY = Math.min(...layoutedNodes.map((node) => node.position.y))

  const adjustedNodes = layoutedNodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x - minX + 60,
      y: node.position.y - minY + 60,
    },
  }))

  return { nodes: adjustedNodes, edges }
}

// Custom node component with value and percentage
const CustomNode = ({ data, palettes }) => {
  const isDark = document.documentElement.classList.contains('dark')

  const paletteSet = isDark ? palettes.dark : palettes.light
  const paletteIndex = Math.min(data.level || 0, paletteSet.length - 1)
  const palette = paletteSet[paletteIndex]

  const subtleColor = isDark ? '#cbd5f5' : '#475569'

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 shadow-md"
      style={{
        width: nodeWidth,
        minHeight: nodeHeight,
        backgroundColor: palette.background,
        borderColor: palette.border,
        color: palette.text,
      }}
    >
      {/* Target handle (input - left side) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: palette.border }}
      />
      
      <div className="text-sm font-semibold truncate" title={data.label}>
        {data.label}
      </div>
      <div className="text-lg font-bold mt-1">
        {data.formattedValue}
      </div>
      <div className="text-xs mt-1" style={{ color: subtleColor }}>
        {data.percentage}% • {data.assetCount} {data.assetCount === 1 ? 'asset' : 'assets'}
      </div>
      
      {/* Source handle (output - right side) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: palette.border }}
      />
    </div>
  )
}

const levelPalettes = {
  light: [
    { background: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
    { background: '#eef2ff', border: '#c4b5fd', text: '#312e81' },
    { background: '#f5f3ff', border: '#c084fc', text: '#4c1d95' },
    { background: '#fdf2f8', border: '#f9a8d4', text: '#831843' },
    { background: '#f0fdfa', border: '#5eead4', text: '#065f46' },
  ],
  dark: [
    { background: '#1e3a8a', border: '#60a5fa', text: '#e0f2fe' },
    { background: '#312e81', border: '#c4b5fd', text: '#e0e7ff' },
    { background: '#4c1d95', border: '#d8b4fe', text: '#ede9fe' },
    { background: '#831843', border: '#f472b6', text: '#ffe4e6' },
    { background: '#064e3b', border: '#34d399', text: '#d1fae5' },
  ],
}

const nodeTypes = {
  custom: (props) => <CustomNode palettes={levelPalettes} {...props} />,
}

const AssetMapTab = () => {
  const { user } = useAuth()
  const { formatCurrency } = useCurrency()
  const [hierarchy, setHierarchy] = useState(DEFAULT_HIERARCHY)
  const [depth, setDepth] = useState(5)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const reactFlowWrapper = useRef(null)
  const { fitView, getNodes } = useReactFlow()
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  const canvasStyle = React.useMemo(() => ({
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    height: isFullscreen ? 'calc(100vh - 140px)' : 'calc(100vh - 320px)',
    minHeight: isFullscreen ? '100%' : '600px'
  }), [isFullscreen, isDarkMode])

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
    const paletteSet = isDark ? levelPalettes.dark : levelPalettes.light
    const levelLookup = rawNodes.reduce((acc, node) => {
      acc[node.id] = node.data.level || 0
      return acc
    }, {})
    
    const rawEdges = hierarchyData.edges.map((edge, index) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: paletteSet[Math.min(levelLookup[edge.source] || 0, paletteSet.length - 1)].border,
        strokeWidth: 2
      },
      markerEnd: {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: paletteSet[Math.min(levelLookup[edge.source] || 0, paletteSet.length - 1)].border,
      },
    }))

    return getLayoutedElements(rawNodes, rawEdges)
  }, [hierarchyData, formatCurrency])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([])
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([])

  // Update nodes/edges when hierarchy data changes
  React.useEffect(() => {
    setNodes(nodes)
    setEdges(edges)
  }, [nodes, edges, setNodes, setEdges])

  React.useEffect(() => {
    if (nodes.length === 0) return
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 400 })
    })
  }, [nodes, fitView])

  React.useEffect(() => {
    if (!isFullscreen || reactFlowNodes.length === 0) return
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 300 })
    })
  }, [isFullscreen, fitView, reactFlowNodes.length])

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

  // Export as PDF - uses React Flow's native bounds calculation with proper edge capture
  const handleExportPDF = useCallback(async () => {
    if (!reactFlowWrapper.current) return

    try {
      toast.info('Generating PDF...')
      
      // Get all nodes
      const nodes = getNodes()
      if (!nodes || nodes.length === 0) {
        toast.error('No nodes to export')
        return
      }

      const bounds = getNodesBounds(nodes)
      const padding = 120
      const exportWidth = Math.max(Math.ceil(bounds.width + padding * 2), 720)
      const exportHeight = Math.max(Math.ceil(bounds.height + padding * 2), 540)
      const exportScale = 2
      const viewport = getViewportForBounds(
        bounds,
        exportWidth,
        exportHeight,
        0.15, // min zoom
        2,    // max zoom
        0.08  // padding
      )

      // Find the React Flow container (parent of both viewport and edges)
      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow')
      if (!reactFlowElement) {
        toast.error('Could not find visualization to export')
        return
      }

      // Capture using html2canvas with the entire React Flow container
      // This includes BOTH .react-flow__viewport (nodes) AND .react-flow__edges (SVG sibling)
      const modeIsDark = document.documentElement.classList.contains('dark')
      const wrapperBg = window.getComputedStyle(reactFlowWrapper.current).backgroundColor
      const backgroundColor =
        wrapperBg && wrapperBg !== 'rgba(0, 0, 0, 0)'
          ? wrapperBg
          : (modeIsDark ? '#0f172a' : '#ffffff')
      const sanitizedBackground = sanitizeColor(backgroundColor, modeIsDark ? '#0f172a' : '#ffffff')
      const primaryStroke = modeIsDark ? '#60a5fa' : '#3b82f6'
      const secondaryStroke = modeIsDark ? '#94a3b8' : '#64748b'

      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: sanitizedBackground,
        scale: exportScale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Apply OKLCH sanitization
          scrubOklchFromStylesheets(clonedDoc)
          scrubOklchFromInlineStyles(clonedDoc)
          overrideRootCustomProperties(clonedDoc)
          inlineCriticalColors(clonedDoc)
          
          // Find the cloned React Flow element
          const clonedReactFlow = clonedDoc.querySelector('.react-flow')
          if (clonedReactFlow) {
            clonedReactFlow.style.width = `${exportWidth}px`
            clonedReactFlow.style.height = `${exportHeight}px`
            clonedReactFlow.style.backgroundColor = sanitizedBackground

            clonedReactFlow
              .querySelectorAll(
                '.react-flow__controls, .react-flow__minimap, .react-flow__panel, .react-flow__attribution'
              )
              .forEach((panel) => {
                panel.style.display = 'none'
              })

            const clonedViewport = clonedReactFlow.querySelector('.react-flow__viewport')
            if (clonedViewport) {
              clonedViewport.style.transformOrigin = '0 0'
              clonedViewport.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
            }
            
            // Ensure edges layer is visible and properly styled
            const edgesLayer = clonedReactFlow.querySelector('.react-flow__edges')
            if (edgesLayer) {
              edgesLayer.style.transformOrigin = '0 0'
              edgesLayer.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
              edgesLayer.style.width = '100%'
              edgesLayer.style.height = '100%'
              edgesLayer.querySelectorAll('path, marker path').forEach((path) => {
                path.setAttribute('stroke', primaryStroke)
                path.setAttribute('stroke-width', '2.2')
                path.setAttribute('stroke-linecap', 'round')
                if (path.hasAttribute('fill') && path.getAttribute('fill') !== 'none') {
                  path.setAttribute('fill', primaryStroke)
                }
              })
            }
          }
          
          const nodeElements = clonedDoc.querySelectorAll('[data-id]')
          nodeElements.forEach((node) => {
            const innerDiv = node.querySelector('div')
            if (!innerDiv) return

            innerDiv.style.borderColor = primaryStroke
            innerDiv.style.boxShadow = modeIsDark
              ? '0 24px 48px rgba(15, 23, 42, 0.55)'
              : '0 18px 40px rgba(15, 23, 42, 0.18)'
            innerDiv.style.backgroundColor = modeIsDark ? '#1f2937' : '#ffffff'
            innerDiv.style.color = modeIsDark ? '#e2e8f0' : '#1f2937'

            const textEls = innerDiv.querySelectorAll('.text-gray-600, .text-gray-500, .dark\\:text-gray-400, .text-xs, .text-sm')
            textEls.forEach((el) => {
              el.style.color = modeIsDark ? secondaryStroke : '#4b5563'
            })

            const highlightEls = innerDiv.querySelectorAll('.text-blue-600, .dark\\:text-blue-400')
            highlightEls.forEach((el) => {
              el.style.color = primaryStroke
            })
          })

          const truncatedElements = clonedDoc.querySelectorAll('.truncate')
          truncatedElements.forEach((el) => {
            el.classList.remove('truncate')
            el.style.whiteSpace = 'normal'
            el.style.overflow = 'visible'
            el.style.textOverflow = 'clip'
          })
        }
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = canvas.width / exportScale
      const pdfHeight = canvas.height / exportScale
      
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
      toast.error(`Failed to export PDF: ${error.message}`)
    }
  }, [getNodes])

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
    ? 'fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900'
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
              variant="secondary"
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
              variant="secondary"
              size="sm"
              className="gap-2"
              title="Download as PDF"
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
        style={canvasStyle}
      >
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          className="react-flow-theme"
        >
          <Background color={isDarkMode ? '#1f2937' : '#d1d5db'} gap={18} />
          <Controls className="react-flow__controls-themed" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="react-flow__minimap-themed"
          />
        </ReactFlow>
      </div>

      {/* Custom CSS for dark mode controls */}
      <style jsx>{`
        :global(.react-flow__controls-themed button) {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          color: #1f2937 !important;
        }

        :global(.dark .react-flow__controls-themed button) {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
          color: #e5e7eb !important;
        }

        :global(.react-flow__controls-themed button:hover) {
          background-color: #f3f4f6 !important;
        }

        :global(.dark .react-flow__controls-themed button:hover) {
          background-color: #374151 !important;
        }

        :global(.react-flow__controls-themed button svg) {
          fill: currentColor !important;
        }

        :global(.react-flow__minimap-themed) {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
        }

        :global(.dark .react-flow__minimap-themed) {
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
