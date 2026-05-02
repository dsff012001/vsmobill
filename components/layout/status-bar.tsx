'use client'

import { GitBranch, Check, AlertCircle, Wifi, WifiOff, FolderOpen, FileCode } from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { useState, useEffect } from 'react'

export function StatusBar() {
  const { 
    files, 
    activeFileId, 
    currentRepo, 
    githubUser, 
    autoSave,
    currentProjectId,
    projects
  } = useEditorStore()
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  const activeFile = files.find(f => f.id === activeFileId)
  const currentProject = projects.find(p => p.id === currentProjectId)
  
  return (
    <div className="h-7 bg-primary/10 border-t border-border flex items-center justify-between px-2 sm:px-3 text-[10px] sm:text-[11px] text-muted-foreground shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
        {/* Online status */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="w-3 h-3 text-accent" />
          ) : (
            <WifiOff className="w-3 h-3 text-destructive" />
          )}
        </div>
        
        {/* Current project */}
        {currentProject && (
          <div className="flex items-center gap-1 truncate">
            <FolderOpen className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[80px]">{currentProject.name}</span>
          </div>
        )}
        
        {/* GitHub repo */}
        {githubUser && currentRepo && (
          <div className="flex items-center gap-1 truncate">
            <GitBranch className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[80px]">{currentRepo.name}</span>
          </div>
        )}
        
        {/* File count */}
        <div className="flex items-center gap-1 hidden sm:flex">
          <FileCode className="w-3 h-3 shrink-0" />
          <span>{files.length} dosya</span>
        </div>
        
        {/* Save status */}
        {activeFile && (
          <div className="flex items-center gap-1">
            {activeFile.isModified ? (
              <>
                <AlertCircle className="w-3 h-3 text-yellow-500 shrink-0" />
                <span className="hidden sm:inline">Kaydedilmemis</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-accent shrink-0" />
                <span className="hidden sm:inline">Kaydedildi</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {activeFile && (
          <>
            <span className="uppercase">{activeFile.language}</span>
            <span className="hidden sm:inline">UTF-8</span>
            {autoSave && (
              <span className="text-accent hidden sm:inline">Oto-Kayit</span>
            )}
          </>
        )}
        <span className="text-primary font-medium">VSMobil</span>
      </div>
    </div>
  )
}
