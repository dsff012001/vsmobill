import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface VSFile {
  id: string
  name: string
  content: string
  language: string
  path: string
  isModified: boolean
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  description?: string
  files: VSFile[]
  createdAt: number
  updatedAt: number
  githubRepo?: string
}

export interface Extension {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  category: 'language' | 'theme' | 'tool' | 'git'
}

export interface GitHubRepo {
  id: number
  name: string
  fullName: string
  description: string
  url: string
  defaultBranch: string
}

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  sha: string
  download_url?: string
}

export interface ConsoleOutput {
  id: string
  type: 'log' | 'error' | 'warn' | 'info' | 'result'
  content: string
  timestamp: number
}

interface EditorState {
  // Projects
  projects: Project[]
  currentProjectId: string | null
  
  // Files
  files: VSFile[]
  activeFileId: string | null
  openFileIds: string[]
  
  // UI State
  sidebarOpen: boolean
  activePanel: 'explorer' | 'search' | 'git' | 'extensions' | 'settings' | 'projects'
  terminalOpen: boolean
  consoleOutput: ConsoleOutput[]
  mobileMenuOpen: boolean
  previewOpen: boolean
  previewFullscreen: boolean
  
  // GitHub
  githubToken: string | null
  githubUser: string | null
  repos: GitHubRepo[]
  currentRepo: GitHubRepo | null
  currentRepoFiles: GitHubFile[]
  currentPath: string
  loadingGithub: boolean
  downloadProgress: { current: number; total: number } | null
  
  // Extensions
  extensions: Extension[]
  
  // Editor Settings
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  autoSave: boolean
  
  // Project Actions
  createProject: (name: string, description?: string) => void
  deleteProject: (id: string) => void
  switchProject: (id: string) => void
  saveCurrentProject: () => void
  loadProjectFromGitHub: (repo: GitHubRepo, files: { name: string; content: string; path: string }[]) => void
  
  // File Actions
  createFile: (name: string, content?: string) => void
  updateFile: (id: string, content: string) => void
  saveFile: (id: string) => void
  deleteFile: (id: string) => void
  openFile: (id: string) => void
  closeFile: (id: string) => void
  setActiveFile: (id: string | null) => void
  renameFile: (id: string, newName: string) => void
  importFiles: (files: { name: string; content: string; path?: string }[]) => void
  clearAllFiles: () => void
  getFileByName: (name: string) => VSFile | undefined
  navigateToFile: (fileName: string) => void
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void
  setActivePanel: (panel: EditorState['activePanel']) => void
  setTerminalOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setPreviewOpen: (open: boolean) => void
  setPreviewFullscreen: (fullscreen: boolean) => void
  addConsoleOutput: (output: Omit<ConsoleOutput, 'id' | 'timestamp'>) => void
  clearConsole: () => void
  
  // GitHub Actions
  setGitHubToken: (token: string | null) => void
  setGitHubUser: (user: string | null) => void
  setRepos: (repos: GitHubRepo[]) => void
  setCurrentRepo: (repo: GitHubRepo | null) => void
  setCurrentRepoFiles: (files: GitHubFile[]) => void
  setCurrentPath: (path: string) => void
  setLoadingGithub: (loading: boolean) => void
  setDownloadProgress: (progress: { current: number; total: number } | null) => void
  
  // Extension Actions
  toggleExtension: (id: string) => void
  
  // Settings Actions
  setFontSize: (size: number) => void
  setTabSize: (size: number) => void
  setWordWrap: (wrap: boolean) => void
  setMinimap: (show: boolean) => void
  setAutoSave: (auto: boolean) => void
}

const defaultExtensions: Extension[] = [
  { id: 'js', name: 'JavaScript', description: 'JavaScript/TypeScript destegi', icon: 'js', enabled: true, category: 'language' },
  { id: 'py', name: 'Python', description: 'Python syntax destegi', icon: 'py', enabled: true, category: 'language' },
  { id: 'html', name: 'HTML', description: 'HTML/CSS destegi', icon: 'html', enabled: true, category: 'language' },
  { id: 'json', name: 'JSON', description: 'JSON formatlama', icon: 'json', enabled: true, category: 'language' },
  { id: 'git', name: 'Git Integration', description: 'GitHub entegrasyonu', icon: 'git', enabled: true, category: 'git' },
  { id: 'prettier', name: 'Prettier', description: 'Kod formatlayici', icon: 'format', enabled: true, category: 'tool' },
  { id: 'emmet', name: 'Emmet', description: 'HTML/CSS kisayollari', icon: 'emmet', enabled: true, category: 'tool' },
  { id: 'autocomplete', name: 'IntelliSense', description: 'Kod tamamlama', icon: 'intellisense', enabled: true, category: 'tool' },
]

const getLanguageFromFileName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    xml: 'xml',
    svg: 'xml',
    vue: 'vue',
    svelte: 'svelte',
    txt: 'plaintext',
  }
  return langMap[ext || ''] || 'plaintext'
}

const getDefaultContent = (language: string, fileName: string): string => {
  switch (language) {
    case 'html':
      return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName.replace('.html', '')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 1rem; }
    p { color: #666; line-height: 1.6; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Merhaba Dunya!</h1>
    <p>VSMobil ile olusturuldu.</p>
  </div>
</body>
</html>`
    case 'javascript':
      return `// JavaScript dosyasi
console.log('Merhaba Dunya!');
`
    case 'typescript':
      return `// TypeScript dosyasi
const mesaj: string = 'Merhaba Dunya!';
console.log(mesaj);
`
    case 'python':
      return `# Python dosyasi
print('Merhaba Dunya!')
`
    case 'css':
      return `/* CSS dosyasi */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
`
    case 'json':
      return `{
  "name": "proje",
  "version": "1.0.0"
}
`
    default:
      return ''
  }
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      files: [],
      activeFileId: null,
      openFileIds: [],
      sidebarOpen: false,
      activePanel: 'explorer',
      terminalOpen: false,
      consoleOutput: [],
      mobileMenuOpen: false,
      previewOpen: false,
      previewFullscreen: false,
      githubToken: null,
      githubUser: null,
      repos: [],
      currentRepo: null,
      currentRepoFiles: [],
      currentPath: '',
      loadingGithub: false,
      downloadProgress: null,
      extensions: defaultExtensions,
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      autoSave: true,
      
      // Project Actions
      createProject: (name, description) => {
        const id = crypto.randomUUID()
        const now = Date.now()
        const newProject: Project = {
          id,
          name,
          description,
          files: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: id,
          files: [],
          activeFileId: null,
          openFileIds: [],
        }))
      },
      
      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter(p => p.id !== id)
          const isCurrentProject = state.currentProjectId === id
          return {
            projects: newProjects,
            currentProjectId: isCurrentProject ? null : state.currentProjectId,
            files: isCurrentProject ? [] : state.files,
            activeFileId: isCurrentProject ? null : state.activeFileId,
            openFileIds: isCurrentProject ? [] : state.openFileIds,
          }
        })
      },
      
      switchProject: (id) => {
        const state = get()
        // Save current project first
        if (state.currentProjectId) {
          const currentProject = state.projects.find(p => p.id === state.currentProjectId)
          if (currentProject) {
            set((s) => ({
              projects: s.projects.map(p => 
                p.id === state.currentProjectId 
                  ? { ...p, files: s.files, updatedAt: Date.now() }
                  : p
              ),
            }))
          }
        }
        
        // Load new project
        const project = state.projects.find(p => p.id === id)
        if (project) {
          set({
            currentProjectId: id,
            files: project.files,
            activeFileId: project.files[0]?.id || null,
            openFileIds: project.files.length > 0 ? [project.files[0].id] : [],
            sidebarOpen: false,
          })
        }
      },
      
      saveCurrentProject: () => {
        const state = get()
        if (state.currentProjectId) {
          set((s) => ({
            projects: s.projects.map(p =>
              p.id === state.currentProjectId
                ? { ...p, files: s.files, updatedAt: Date.now() }
                : p
            ),
          }))
        }
      },
      
      loadProjectFromGitHub: (repo, downloadedFiles) => {
        const id = crypto.randomUUID()
        const now = Date.now()
        
        const files: VSFile[] = downloadedFiles.map(f => ({
          id: crypto.randomUUID(),
          name: f.name,
          content: f.content,
          language: getLanguageFromFileName(f.name),
          path: f.path || `/${f.name}`,
          isModified: false,
          createdAt: now,
          updatedAt: now,
        }))
        
        const newProject: Project = {
          id,
          name: repo.name,
          description: repo.description,
          files,
          createdAt: now,
          updatedAt: now,
          githubRepo: repo.fullName,
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: id,
          files,
          activeFileId: files[0]?.id || null,
          openFileIds: files.length > 0 ? [files[0].id] : [],
          currentRepo: null,
          currentRepoFiles: [],
          currentPath: '',
          sidebarOpen: false,
          activePanel: 'explorer',
        }))
      },
      
      createFile: (name, content) => {
        const existingFile = get().files.find(f => f.name.toLowerCase() === name.toLowerCase())
        if (existingFile) {
          set({ activeFileId: existingFile.id, openFileIds: [...new Set([...get().openFileIds, existingFile.id])] })
          return
        }
        
        const id = crypto.randomUUID()
        const now = Date.now()
        const language = getLanguageFromFileName(name)
        const newFile: VSFile = {
          id,
          name,
          content: content !== undefined ? content : getDefaultContent(language, name),
          language,
          path: `/${name}`,
          isModified: false,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          files: [...state.files, newFile],
          activeFileId: id,
          openFileIds: [...state.openFileIds, id],
          sidebarOpen: false,
        }))
      },
      
      updateFile: (id, content) => {
        const state = get()
        set({
          files: state.files.map((f) =>
            f.id === id ? { ...f, content, isModified: true, updatedAt: Date.now() } : f
          ),
        })
        
        // Auto-save after a delay
        if (state.autoSave) {
          setTimeout(() => {
            get().saveFile(id)
          }, 1000)
        }
      },
      
      saveFile: (id) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, isModified: false, updatedAt: Date.now() } : f
          ),
        }))
        // Also save to current project
        get().saveCurrentProject()
      },
      
      deleteFile: (id) => {
        set((state) => {
          const newOpenIds = state.openFileIds.filter((fid) => fid !== id)
          const newActiveId = state.activeFileId === id 
            ? newOpenIds[newOpenIds.length - 1] || null 
            : state.activeFileId
          return {
            files: state.files.filter((f) => f.id !== id),
            openFileIds: newOpenIds,
            activeFileId: newActiveId,
          }
        })
      },
      
      openFile: (id) => {
        set((state) => ({
          openFileIds: state.openFileIds.includes(id) 
            ? state.openFileIds 
            : [...state.openFileIds, id],
          activeFileId: id,
          sidebarOpen: false,
        }))
      },
      
      closeFile: (id) => {
        set((state) => {
          const newOpenIds = state.openFileIds.filter((fid) => fid !== id)
          const newActiveId = state.activeFileId === id 
            ? newOpenIds[newOpenIds.length - 1] || null 
            : state.activeFileId
          return {
            openFileIds: newOpenIds,
            activeFileId: newActiveId,
          }
        })
      },
      
      setActiveFile: (id) => set({ activeFileId: id }),
      
      renameFile: (id, newName) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id 
              ? { ...f, name: newName, language: getLanguageFromFileName(newName), path: `/${newName}`, updatedAt: Date.now() }
              : f
          ),
        }))
      },
      
      importFiles: (importedFiles) => {
        const state = get()
        const newFiles: VSFile[] = []
        const now = Date.now()
        
        importedFiles.forEach(({ name, content, path }) => {
          const existingFile = state.files.find(f => f.name.toLowerCase() === name.toLowerCase())
          if (!existingFile) {
            const id = crypto.randomUUID()
            newFiles.push({
              id,
              name,
              content,
              language: getLanguageFromFileName(name),
              path: path || `/${name}`,
              isModified: false,
              createdAt: now,
              updatedAt: now,
            })
          }
        })
        
        if (newFiles.length > 0) {
          set({
            files: [...state.files, ...newFiles],
            activeFileId: newFiles[0].id,
            openFileIds: [...state.openFileIds, ...newFiles.map(f => f.id)],
          })
        }
      },
      
      clearAllFiles: () => {
        set({
          files: [],
          activeFileId: null,
          openFileIds: [],
        })
      },
      
      getFileByName: (name: string) => {
        return get().files.find(f => f.name.toLowerCase() === name.toLowerCase())
      },
      
      navigateToFile: (fileName: string) => {
        const file = get().getFileByName(fileName)
        if (file) {
          get().openFile(file.id)
        }
      },
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setTerminalOpen: (open) => set({ terminalOpen: open }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setPreviewOpen: (open) => set({ previewOpen: open }),
      setPreviewFullscreen: (fullscreen) => set({ previewFullscreen: fullscreen }),
      
      addConsoleOutput: (output) => {
        const newOutput: ConsoleOutput = {
          ...output,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        }
        set((state) => ({
          consoleOutput: [...state.consoleOutput, newOutput],
        }))
      },
      
      clearConsole: () => set({ consoleOutput: [] }),
      
      setGitHubToken: (token) => set({ githubToken: token }),
      setGitHubUser: (user) => set({ githubUser: user }),
      setRepos: (repos) => set({ repos }),
      setCurrentRepo: (repo) => set({ currentRepo: repo, currentRepoFiles: [], currentPath: '' }),
      setCurrentRepoFiles: (files) => set({ currentRepoFiles: files }),
      setCurrentPath: (path) => set({ currentPath: path }),
      setLoadingGithub: (loading) => set({ loadingGithub: loading }),
      setDownloadProgress: (progress) => set({ downloadProgress: progress }),
      
      toggleExtension: (id) => {
        set((state) => ({
          extensions: state.extensions.map((ext) =>
            ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
          ),
        }))
      },
      
      setFontSize: (size) => set({ fontSize: size }),
      setTabSize: (size) => set({ tabSize: size }),
      setWordWrap: (wrap) => set({ wordWrap: wrap }),
      setMinimap: (show) => set({ minimap: show }),
      setAutoSave: (auto) => set({ autoSave: auto }),
    }),
    {
      name: 'vsmobil-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        files: state.files,
        extensions: state.extensions,
        githubToken: state.githubToken,
        githubUser: state.githubUser,
        fontSize: state.fontSize,
        tabSize: state.tabSize,
        wordWrap: state.wordWrap,
        minimap: state.minimap,
        autoSave: state.autoSave,
      }),
    }
  )
)
