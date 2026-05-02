'use client'

import { useEffect, useState } from 'react'
import { 
  Files, 
  Search, 
  Github,
  Puzzle,
  Settings,
  Menu,
  X,
  FolderOpen
} from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileExplorer } from '@/components/panels/file-explorer'
import { SearchPanel } from '@/components/panels/search-panel'
import { GitHubPanel } from '@/components/panels/github-panel'
import { ExtensionsPanel } from '@/components/panels/extensions-panel'
import { SettingsPanel } from '@/components/panels/settings-panel'
import { ProjectsPanel } from '@/components/panels/projects-panel'
import { motion, AnimatePresence } from 'framer-motion'

const panels = [
  { id: 'explorer' as const, icon: Files, label: 'Dosyalar' },
  { id: 'projects' as const, icon: FolderOpen, label: 'Projeler' },
  { id: 'search' as const, icon: Search, label: 'Ara' },
  { id: 'git' as const, icon: Github, label: 'GitHub' },
  { id: 'extensions' as const, icon: Puzzle, label: 'Eklentiler' },
  { id: 'settings' as const, icon: Settings, label: 'Ayarlar' },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activePanel, setActivePanel } = useEditorStore()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const renderPanel = () => {
    switch (activePanel) {
      case 'explorer':
        return <FileExplorer />
      case 'projects':
        return <ProjectsPanel />
      case 'search':
        return <SearchPanel />
      case 'git':
        return <GitHubPanel />
      case 'extensions':
        return <ExtensionsPanel />
      case 'settings':
        return <SettingsPanel />
      default:
        return <FileExplorer />
    }
  }
  
  return (
    <>
      {/* Activity Bar */}
      <div className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-2 shrink-0 z-30">
        <Button
          variant="ghost"
          size="icon"
          className="mb-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        
        {panels.map((panel) => (
          <Button
            key={panel.id}
            variant="ghost"
            size="icon"
            className={cn(
              'w-10 h-10 mb-1 touch-manipulation',
              activePanel === panel.id && sidebarOpen
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
            )}
            onClick={() => {
              if (activePanel === panel.id && sidebarOpen) {
                setSidebarOpen(false)
              } else {
                setActivePanel(panel.id)
                setSidebarOpen(true)
              }
            }}
            title={panel.label}
          >
            <panel.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>
      
      {/* Panel Content */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? '85vw' : 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-sidebar border-r border-sidebar-border overflow-hidden shrink-0",
              isMobile && "absolute left-12 top-0 bottom-0 z-20 shadow-xl"
            )}
          >
            <div className={cn("h-full", isMobile ? "w-[85vw]" : "w-[280px]")}>
              {renderPanel()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
