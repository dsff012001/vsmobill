'use client'

import { useState, useMemo } from 'react'
import { Search, File, ArrowRight } from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchResult {
  fileId: string
  fileName: string
  line: number
  content: string
  matchStart: number
  matchEnd: number
}

export function SearchPanel() {
  const { files, openFile, setActiveFile } = useEditorStore()
  const [query, setQuery] = useState('')
  
  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return []
    
    const searchResults: SearchResult[] = []
    const lowerQuery = query.toLowerCase()
    
    files.forEach(file => {
      const lines = file.content.split('\n')
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase()
        const matchIndex = lowerLine.indexOf(lowerQuery)
        
        if (matchIndex !== -1) {
          searchResults.push({
            fileId: file.id,
            fileName: file.name,
            line: index + 1,
            content: line.trim(),
            matchStart: matchIndex,
            matchEnd: matchIndex + query.length,
          })
        }
      })
    })
    
    return searchResults.slice(0, 50) // Limit results
  }, [query, files])
  
  const handleResultClick = (result: SearchResult) => {
    openFile(result.fileId)
    setActiveFile(result.fileId)
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Ara
        </span>
      </div>
      
      <div className="p-3 border-b border-border">
        <Input
          placeholder="Dosyalarda ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {query.length < 2 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Aramak için en az 2 karakter girin
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Sonuç bulunamadı
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">
              {results.length} sonuç bulundu
            </p>
            {results.map((result, index) => (
              <div
                key={`${result.fileId}-${result.line}-${index}`}
                className="p-2 rounded cursor-pointer hover:bg-secondary/50 group"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <File className="w-3 h-3" />
                  <span className="font-medium text-foreground">{result.fileName}</span>
                  <span>:{result.line}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-auto" />
                </div>
                <pre className="text-xs font-mono truncate text-muted-foreground">
                  {result.content}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
