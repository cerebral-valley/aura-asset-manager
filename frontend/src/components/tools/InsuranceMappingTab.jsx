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
  const baseClasses = isDark
    ? 'bg-gray-800 border-blue-500 text-slate-100 shadow-xl'
    : 'bg-white border-blue-400 text-slate-900 shadow-lg'

  return (
    <div
      className={`px-6 py-4 rounded-xl border-2 ${baseClasses}`}
      style={{ width: 280, minHeight: 120 }}
    >
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#2563eb', width: 12, height: 12 }}
      />

      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <div className="text-lg font-semibold">{data.label}</div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {data.formattedCoverage}
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
  const baseClasses = isDark
    ? 'bg-gray-800 border-gray-600 text-slate-100 shadow-md'
    : 'bg-white border-gray-300 text-slate-900 shadow-md'

  return (
    <div
      className={`px-5 py-3 rounded-lg border-2 ${baseClasses}`}
      style={{ width: 240, minHeight: 100 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#2563eb' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#2563eb' }}
      />

      <div className="text-base font-semibold mb-2 text-blue-600 dark:text-blue-400">
        {data.label}
      </div>
      <div className="space-y-1">
        <div className="text-lg font-semibold">
          {data.formattedCoverage}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Premium: {data.formattedPremium}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {data.policyCount} {data.policyCount === 1 ? 'policy' : 'policies'}
        </div>
      </div>
    </div>
  )
}

// Custom Individual Policy Node - Shows specific policy details
const PolicyNode = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark')

  const statusColors = {
    active: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
    expired: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800',
    cancelled: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
  }

  const baseClasses = isDark
    ? 'bg-gray-800 border-gray-600 text-slate-100 shadow'
    : 'bg-white border-gray-300 text-slate-900 shadow'

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 ${baseClasses}`}
      style={{ width: 220, minHeight: 90 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#2563eb' }}
      />

      <div className="space-y-1">
        <div className="text-sm font-semibold truncate" title={data.label}>
          {data.label}
        </div>
        <div className="text-base font-semibold text-blue-600 dark:text-blue-400">
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
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  const canvasStyle = React.useMemo(() => ({
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    height: isFullscreen ? 'calc(100vh - 96px)' : 'calc(100vh - 280px)',
    minHeight: isFullscreen ? '100%' : '600px'
  }), [isFullscreen, isDarkMode])

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
  const { nodes, edges, stats } = useMemo(() => {
    if (!hierarchyData || !Array.isArray(hierarchyData.types)) {
      return {
        nodes: [],
        edges: [],
        stats: {
          policyCount: 0,
          totalCoverage: 0,
          totalAnnualPremium: 0,
        },
      }
    }

    const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
    const primaryEdgeColor = isDarkMode ? '#60a5fa' : '#3b82f6'
    const secondaryEdgeColor = isDarkMode ? '#4b5563' : '#6b7280'

    const coerceNumber = (value) => {
      if (value == null) return 0
      const num = typeof value === 'string' ? Number(value.replace(/[^0-9.-]/g, '')) : Number(value)
      return Number.isFinite(num) ? num : 0
    }

    const activeTypeSummaries = hierarchyData.types.reduce((acc, typeData, index) => {
      const policies = Array.isArray(typeData?.policies) ? typeData.policies : []
      const activePolicies = policies.filter((policy) => {
        const status = typeof policy?.status === 'string' ? policy.status.toLowerCase() : ''
        return status === 'active' || status === ''
      })

      if (activePolicies.length === 0) {
        return acc
      }

      const typeCoverage = activePolicies.reduce(
        (sum, policy) => sum + coerceNumber(policy.coverage ?? policy.coverage_amount),
        0
      )
      const typePremium = activePolicies.reduce(
        (sum, policy) => sum + coerceNumber(policy.annual_premium ?? policy.premium_amount ?? policy.premium),
        0
      )

      acc.push({
        typeKey: typeData.type || typeData.type_label || `type-${index + 1}`,
        label: typeData.type_label || typeData.type || 'Insurance',
        coverage: typeCoverage,
        premium: typePremium,
        policyCount: activePolicies.length,
        policies: activePolicies.map((policy) => ({
          id: String(policy.id ?? policy.policy_id ?? `policy-${Math.random().toString(36).slice(2)}`),
          name: policy.name || policy.policy_name || 'Unnamed Policy',
          coverage: coerceNumber(policy.coverage ?? policy.coverage_amount),
          annualPremium: coerceNumber(policy.annual_premium ?? policy.premium_amount ?? policy.premium),
          provider: policy.provider || '',
          status: typeof policy.status === 'string' ? policy.status : 'active',
        })),
      })

      return acc
    }, [])

    const totals = activeTypeSummaries.reduce(
      (summary, type) => {
        summary.policyCount += type.policyCount
        summary.totalCoverage += type.coverage
        summary.totalAnnualPremium += type.premium
        return summary
      },
      { policyCount: 0, totalCoverage: 0, totalAnnualPremium: 0 }
    )

    if (totals.policyCount === 0) {
      return {
        nodes: [],
        edges: [],
        stats: totals,
      }
    }

    const rootId = 'root-0'
    const graphNodes = [
      {
        id: rootId,
        type: 'root',
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        data: {
          label: 'Total Insurance Coverage',
          formattedCoverage: String(formatCurrency(totals.totalCoverage)),
          formattedPremium: String(formatCurrency(totals.totalAnnualPremium)),
          policyCount: totals.policyCount,
        },
      },
    ]
    const graphEdges = []
    let nodeIdCounter = 1

    activeTypeSummaries.forEach((typeSummary) => {
      const typeId = `type-${nodeIdCounter++}`

      graphNodes.push({
        id: typeId,
        type: 'policyType',
        position: { x: 0, y: 0 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: typeSummary.label,
          formattedCoverage: String(formatCurrency(typeSummary.coverage)),
          formattedPremium: String(formatCurrency(typeSummary.premium)),
          policyCount: typeSummary.policyCount,
        },
      })

      graphEdges.push({
        id: `${rootId}-${typeId}`,
        source: rootId,
        target: typeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: primaryEdgeColor, strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          width: 18,
          height: 18,
          color: primaryEdgeColor,
        },
      })

      typeSummary.policies.forEach((policy) => {
        const policyId = `policy-${nodeIdCounter++}`

        graphNodes.push({
          id: policyId,
          type: 'policy',
          position: { x: 0, y: 0 },
          targetPosition: Position.Left,
          data: {
            label: String(policy.name || 'Unnamed Policy'),
            formattedCoverage: String(formatCurrency(policy.coverage)),
            formattedPremium: String(formatCurrency(policy.annualPremium)),
            provider: String(policy.provider || ''),
            status: String(policy.status || 'active'),
          },
        })

        graphEdges.push({
          id: `${typeId}-${policyId}`,
          source: typeId,
          target: policyId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: secondaryEdgeColor, strokeWidth: 1.5 },
          markerEnd: {
            type: 'arrowclosed',
            width: 16,
            height: 16,
            color: secondaryEdgeColor,
          },
        })
      })
    })

    const layouted = getLayoutedElements(graphNodes, graphEdges)

    return {
      ...layouted,
      stats: totals,
    }
  }, [hierarchyData, formatCurrency])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([])
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([])

  // Update nodes/edges when hierarchy data changes
  React.useEffect(() => {
    setNodes(nodes)
    setEdges(edges)

    if (nodes.length > 0) {
      requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 400 })
      })
    }
  }, [nodes, edges, setNodes, setEdges, fitView])

  // Re-fit view when toggling fullscreen so layout stays centered
  React.useEffect(() => {
    if (!isFullscreen || reactFlowNodes.length === 0) {
      return
    }

    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 300 })
    })
  }, [isFullscreen, fitView, reactFlowNodes.length])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Export as PDF recreating the on-screen layout
  const handleExportPDF = useCallback(async () => {
    if (!reactFlowWrapper.current) {
      toast.error('Visualization not ready for export')
      return
    }

    try {
      toast.info('Generating PDF export...')

      const currentNodes = getNodes()
      if (!currentNodes || currentNodes.length === 0) {
        toast.error('No data to export')
        return
      }

      const reactFlowElement = reactFlowWrapper.current.querySelector('.react-flow')
      if (!reactFlowElement) {
        toast.error('Could not find visualization to export')
        return
      }

      const bounds = getNodesBounds(currentNodes)
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

            // Tweak node appearance for better contrast in export
            const nodeElements = clonedReactFlow.querySelectorAll('[data-id]')
            nodeElements.forEach((nodeEl) => {
              const panel = nodeEl.querySelector('div')
              if (!panel) return

              panel.style.borderColor = primaryStroke
              panel.style.boxShadow = modeIsDark
                ? '0 24px 48px rgba(15, 23, 42, 0.55)'
                : '0 18px 40px rgba(15, 23, 42, 0.18)'
              panel.style.backgroundColor = modeIsDark ? '#1f2937' : '#ffffff'
              panel.style.color = modeIsDark ? '#e2e8f0' : '#1f2937'

              const textEls = panel.querySelectorAll('.text-gray-600, .text-gray-500, .dark\\:text-gray-400, .dark\\:text-gray-300, .text-xs, .text-sm')
              textEls.forEach((el) => {
                el.style.color = modeIsDark ? secondaryStroke : '#4b5563'
              })

              const highlightEls = panel.querySelectorAll('.text-blue-600, .dark\\:text-blue-400')
              highlightEls.forEach((el) => {
                el.style.color = primaryStroke
              })
            })
          }

          const truncatedElements = clonedDoc.querySelectorAll('.truncate')
          truncatedElements.forEach((el) => {
            el.classList.remove('truncate')
            el.style.whiteSpace = 'normal'
            el.style.overflow = 'visible'
            el.style.textOverflow = 'clip'
          })
        }
      })

      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = canvas.width / exportScale
      const pdfHeight = canvas.height / exportScale
      
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

  if (stats.policyCount === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">No Active Insurance Policies</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Activate at least one insurance policy to visualize your coverage mapping.
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
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Insurance Coverage Map</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.policyCount} active {stats.policyCount === 1 ? 'policy' : 'policies'} • {formatCurrency(stats.totalCoverage)} coverage
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
      <div ref={reactFlowWrapper} className="flex-1" style={canvasStyle}>
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
            markerEnd: {
              type: 'arrowclosed',
              width: 18,
              height: 18,
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
            },
          }}
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
