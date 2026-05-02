export interface RunResult {
  success: boolean
  output: string[]
  errors: string[]
  executionTime: number
}

export async function runJavaScript(code: string): Promise<RunResult> {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []

  const customConsole = {
    log: (...args: unknown[]) => {
      output.push(args.map(arg => formatValue(arg)).join(' '))
    },
    error: (...args: unknown[]) => {
      errors.push(args.map(arg => formatValue(arg)).join(' '))
    },
    warn: (...args: unknown[]) => {
      output.push(`[WARN] ${args.map(arg => formatValue(arg)).join(' ')}`)
    },
    info: (...args: unknown[]) => {
      output.push(`[INFO] ${args.map(arg => formatValue(arg)).join(' ')}`)
    },
    table: (data: unknown) => {
      output.push(JSON.stringify(data, null, 2))
    },
    clear: () => {
      output.length = 0
    },
    assert: (condition: boolean, ...args: unknown[]) => {
      if (!condition) {
        errors.push(`Assertion failed: ${args.map(arg => formatValue(arg)).join(' ')}`)
      }
    },
    count: (() => {
      const counts: Record<string, number> = {}
      return (label = 'default') => {
        counts[label] = (counts[label] || 0) + 1
        output.push(`${label}: ${counts[label]}`)
      }
    })(),
    time: (() => {
      const timers: Record<string, number> = {}
      return (label = 'default') => {
        timers[label] = performance.now()
      }
    })(),
    timeEnd: (() => {
      const timers: Record<string, number> = {}
      return (label = 'default') => {
        if (timers[label]) {
          output.push(`${label}: ${(performance.now() - timers[label]).toFixed(2)}ms`)
          delete timers[label]
        }
      }
    })(),
    dir: (obj: unknown) => {
      output.push(formatValue(obj))
    },
    group: (label?: string) => {
      if (label) output.push(`--- ${label} ---`)
    },
    groupEnd: () => {
      output.push('---')
    },
  }

  try {
    // Create a safer sandbox
    const sandboxedCode = `
      (function(console, setTimeout, setInterval, fetch, XMLHttpRequest, Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp, Error, Promise) {
        "use strict";
        try {
          ${code}
        } catch(e) {
          console.error(e.message);
        }
      })
    `
    
    const fn = eval(sandboxedCode)
    const result = fn(
      customConsole,
      () => {}, // setTimeout disabled
      () => {}, // setInterval disabled  
      undefined, // fetch disabled
      undefined, // XMLHttpRequest disabled
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      Promise
    )
    
    if (result !== undefined && output.length === 0 && errors.length === 0) {
      output.push(`=> ${formatValue(result)}`)
    }
    
  } catch (error) {
    const err = error as Error
    errors.push(`${err.name}: ${err.message}`)
    if (err.stack) {
      const stackLines = err.stack.split('\n').slice(1, 3)
      stackLines.forEach(line => {
        const cleanLine = line.trim()
        if (cleanLine && !cleanLine.includes('eval')) {
          errors.push(cleanLine)
        }
      })
    }
  }

  const executionTime = performance.now() - startTime

  return {
    success: errors.length === 0,
    output,
    errors,
    executionTime,
  }
}

export async function runPython(code: string): Promise<RunResult> {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []
  const variables: Record<string, unknown> = {}

  try {
    const lines = code.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }
      
      // Handle print statements
      const printMatch = trimmed.match(/^print\s*\((.+)\)$/)
      if (printMatch) {
        const content = printMatch[1].trim()
        const result = evaluatePythonExpression(content, variables)
        output.push(String(result))
        continue
      }
      
      // Handle variable assignments
      const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
      if (assignMatch) {
        const [, varName, value] = assignMatch
        variables[varName] = evaluatePythonExpression(value.trim(), variables)
        continue
      }
      
      // Handle for loops (basic)
      const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:$/)
      if (forMatch) {
        const [, varName, rangeEnd] = forMatch
        const loopBody: string[] = []
        let j = i + 1
        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || lines[j].trim() === '')) {
          if (lines[j].trim()) {
            loopBody.push(lines[j].trim())
          }
          j++
        }
        
        for (let k = 0; k < parseInt(rangeEnd); k++) {
          variables[varName] = k
          for (const bodyLine of loopBody) {
            const bodyPrintMatch = bodyLine.match(/^print\s*\((.+)\)$/)
            if (bodyPrintMatch) {
              output.push(String(evaluatePythonExpression(bodyPrintMatch[1].trim(), variables)))
            }
          }
        }
        i = j - 1
        continue
      }
      
      // Handle if statements (basic)
      const ifMatch = trimmed.match(/^if\s+(.+)\s*:$/)
      if (ifMatch) {
        // Skip for now, just continue
        continue
      }
      
      // Handle def (function definitions)
      if (trimmed.startsWith('def ')) {
        // Skip function definitions for now
        let j = i + 1
        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || lines[j].trim() === '')) {
          j++
        }
        i = j - 1
        continue
      }
    }
    
    if (output.length === 0 && code.trim().length > 0) {
      output.push('[Python kodu calistirildi - cikti icin print() kullanin]')
    }
    
  } catch (error) {
    const err = error as Error
    errors.push(`PythonError: ${err.message}`)
  }

  return {
    success: errors.length === 0,
    output,
    errors,
    executionTime: performance.now() - startTime,
  }
}

function evaluatePythonExpression(expr: string, variables: Record<string, unknown>): unknown {
  // Handle string literals
  if ((expr.startsWith('"') && expr.endsWith('"')) ||
      (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1)
  }
  
  // Handle f-strings (basic)
  if (expr.startsWith('f"') || expr.startsWith("f'")) {
    let content = expr.slice(2, -1)
    // Replace {var} with variable values
    content = content.replace(/\{(\w+)\}/g, (_, varName) => {
      return String(variables[varName] ?? varName)
    })
    return content
  }
  
  // Handle numbers
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return parseFloat(expr)
  }
  
  // Handle booleans
  if (expr === 'True') return true
  if (expr === 'False') return false
  if (expr === 'None') return null
  
  // Handle lists
  if (expr.startsWith('[') && expr.endsWith(']')) {
    try {
      return JSON.parse(expr.replace(/'/g, '"'))
    } catch {
      return expr
    }
  }
  
  // Handle variable references
  if (variables.hasOwnProperty(expr)) {
    return variables[expr]
  }
  
  // Handle simple arithmetic
  const mathMatch = expr.match(/^(\w+|\d+)\s*([\+\-\*\/])\s*(\w+|\d+)$/)
  if (mathMatch) {
    const [, left, op, right] = mathMatch
    const leftVal = Number(variables[left] ?? left)
    const rightVal = Number(variables[right] ?? right)
    switch (op) {
      case '+': return leftVal + rightVal
      case '-': return leftVal - rightVal
      case '*': return leftVal * rightVal
      case '/': return leftVal / rightVal
    }
  }
  
  return expr
}

export async function runHTML(code: string): Promise<RunResult> {
  // For HTML, we provide a preview option
  return {
    success: true,
    output: ['HTML dosyasi hazir. Onizleme icin menu\'den "HTML Onizle" secin.'],
    errors: [],
    executionTime: 0,
  }
}

export async function runCSS(code: string): Promise<RunResult> {
  const output: string[] = []
  
  // Parse CSS and provide some info
  const ruleCount = (code.match(/\{/g) || []).length
  const selectorCount = (code.match(/[^{}]+(?=\{)/g) || []).length
  
  output.push(`CSS analiz edildi:`)
  output.push(`- ${selectorCount} secici`)
  output.push(`- ${ruleCount} kural blogu`)
  
  return {
    success: true,
    output,
    errors: [],
    executionTime: 0,
  }
}

export async function runJSON(code: string): Promise<RunResult> {
  const startTime = performance.now()
  const output: string[] = []
  const errors: string[] = []
  
  try {
    const parsed = JSON.parse(code)
    output.push('JSON gecerli!')
    
    if (Array.isArray(parsed)) {
      output.push(`Dizi uzunlugu: ${parsed.length}`)
    } else if (typeof parsed === 'object' && parsed !== null) {
      output.push(`Anahtar sayisi: ${Object.keys(parsed).length}`)
    }
    
    output.push('')
    output.push(JSON.stringify(parsed, null, 2))
    
  } catch (error) {
    const err = error as Error
    errors.push(`JSON Hatasi: ${err.message}`)
  }

  return {
    success: errors.length === 0,
    output,
    errors,
    executionTime: performance.now() - startTime,
  }
}

export async function runCode(code: string, language: string): Promise<RunResult> {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return runJavaScript(code)
    case 'python':
      return runPython(code)
    case 'html':
      return runHTML(code)
    case 'css':
    case 'scss':
    case 'sass':
      return runCSS(code)
    case 'json':
      return runJSON(code)
    default:
      return {
        success: false,
        output: [],
        errors: [`"${language}" dili henuz desteklenmiyor. Desteklenen diller: JavaScript, TypeScript, Python, HTML, CSS, JSON`],
        executionTime: 0,
      }
  }
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`
  if (Array.isArray(value)) {
    if (value.length > 10) {
      return `[${value.slice(0, 10).map(v => formatValue(v)).join(', ')}, ... +${value.length - 10} more]`
    }
    return `[${value.map(v => formatValue(v)).join(', ')}]`
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`
  }
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value, null, 2)
      if (str.length > 500) {
        return str.slice(0, 500) + '...'
      }
      return str
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}
