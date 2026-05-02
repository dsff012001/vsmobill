'use client'

import { X, FileCode, FileJson, FileText, File, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const getFileIcon = (language: string) => {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return <FileCode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
    case 'html':
      return <FileCode className="w-3.5 h-3.5 text-orange-500 shrink-0" />
    case 'css':
    case 'scss':
    case 'sass':
      return <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
    case 'python':
      return <FileCode className="w-3.5 h-3.5 text-green-400 shrink-0" />
    case 'markdown':
      return <FileText className="w-3.5 h-3.5 text-blue-300 shrink-0" />
    default:
      return <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
  }
}

export function FileTabs() {
  const { files, openFileIds, activeFileId, setActiveFile, closeFile } = useEditorStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  
  const openFiles = files.filter(f => openFileIds.includes(f.id))
  
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }
  
  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [openFiles])
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 300)
    }
  }
  
  if (openFiles.length === 0) {
    return null
  }
  
  return (
    <div className="flex items-center bg-secondary/30 border-b border-border shrink-0 relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-6 rounded-none border-r border-border absolute left-0 z-10 bg-secondary/80 backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
      
      <div 
        ref={scrollRef}
        className="flex items-center overflow-x-auto scrollbar-none flex-1"
        onScroll={checkScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {openFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              'group flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer border-r border-border shrink-0 touch-manipulation',
              activeFileId === file.id
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 active:bg-secondary'
            )}
            onClick={() => setActiveFile(file.id)}
          >
            {getFileIcon(file.language)}
            <span className="truncate max-w-[80px] sm:max-w-[120px]">{file.name}</span>
            {file.isModified && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
            <button
              className="ml-1 hover:bg-muted rounded p-0.5 transition-colors shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                closeFile(file.id)
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-6 rounded-none border-l border-border absolute right-0 z-10 bg-secondary/80 backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
