'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { StatusBar } from '@/components/layout/status-bar'
import { CodeEditor } from '@/components/editor/code-editor'
import { FileTabs } from '@/components/editor/file-tabs'
import { TerminalPanel } from '@/components/panels/terminal-panel'
import { PreviewPanel } from '@/components/panels/preview-panel'
import { useEditorStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'

export function VSMobilApp() {
  const { 
    files, 
    createFile, 
    setTerminalOpen, 
    sidebarOpen, 
    setSidebarOpen,
    previewOpen,
    activeFileId,
    saveCurrentProject,
  } = useEditorStore()
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Create a welcome file on first load
  useEffect(() => {
    if (files.length === 0) {
      createFile('welcome.js')
      const welcomeContent = `// VSMobil'e Hos Geldiniz!
// Mobil cihazlarda kod yazmanin en kolay yolu

// Ornek JavaScript kodu:
function merhaba(isim) {
  console.log(\`Merhaba, \${isim}! VSMobil'e hos geldin.\`);
}

// Fonksiyonu cagir
merhaba('Gelistirici');

// Matematiksel islemler
const sayi1 = 10;
const sayi2 = 20;
console.log(\`Toplam: \${sayi1 + sayi2}\`);

// Dizi islemleri
const meyveler = ['Elma', 'Armut', 'Muz', 'Cilek'];
console.log('Meyveler:', meyveler);

meyveler.forEach((meyve, index) => {
  console.log(\`\${index + 1}. \${meyve}\`);
});

// Calistirmak icin sag ustteki "Calistir" butonuna tiklayin!
`
      setTimeout(() => {
        const welcomeFile = useEditorStore.getState().files.find(f => f.name === 'welcome.js')
        if (welcomeFile) {
          useEditorStore.getState().updateFile(welcomeFile.id, welcomeContent)
        }
      }, 100)
    }
  }, [])
  
  // Auto-save project periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentProject()
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [saveCurrentProject])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+` to toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setTerminalOpen(!useEditorStore.getState().terminalOpen)
      }
      
      // Ctrl+S to save (prevent default)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        const activeId = useEditorStore.getState().activeFileId
        if (activeId) {
          useEditorStore.getState().saveFile(activeId)
          useEditorStore.getState().saveCurrentProject()
        }
      }
      
      // Ctrl+B to toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(!useEditorStore.getState().sidebarOpen)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setTerminalOpen, setSidebarOpen])
  
  // Close sidebar when clicking outside on mobile
  const handleMainClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false)
    }
  }
  
  const activeFile = files.find(f => f.id === activeFileId)
  const showPreview = previewOpen && activeFile && (activeFile.language === 'html' || activeFile.language === 'css')
  
  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-background overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        {/* Overlay for mobile */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Main content area */}
        <div 
          className="flex-1 flex overflow-hidden min-w-0"
          onClick={handleMainClick}
        >
          {/* Editor section */}
          <div className={`flex-1 flex flex-col overflow-hidden min-w-0 ${showPreview && !isMobile ? 'w-1/2' : 'w-full'}`}>
            <FileTabs />
            <CodeEditor />
            <TerminalPanel />
          </div>
          
          {/* Preview panel */}
          {showPreview && !isMobile && <PreviewPanel />}
        </div>
      </div>
      
      {/* Fullscreen preview for mobile */}
      {showPreview && isMobile && (
        <div className="fixed inset-0 z-50 bg-background">
          <PreviewPanel />
        </div>
      )}
      
      <StatusBar />
    </div>
  )
}
