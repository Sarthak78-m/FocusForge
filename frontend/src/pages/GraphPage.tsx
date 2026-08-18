import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { useNoteStore } from '../store/noteStore';
import { HelpCircle, X, Maximize, ZoomIn, ZoomOut, Share2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function GraphPage() {
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const { mode: themeMode } = useTheme();
  
  const [showGuide, setShowGuide] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const graphRef = useRef<any>(null);

  // Responsive resize
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute nodes and links
  const graphData = useMemo(() => {
    const nodes = notes.map((n) => ({
      id: n.id,
      name: n.title,
      group: n.folder || 'Inbox',
      val: 1.5 + Math.log10(Math.max(1, n.wordCount || 0) + 1),
      favorite: n.favorite
    }));

    const links: any[] = [];
    const linkSet = new Set<string>();

    for (let i = 0; i < notes.length; i++) {
      const a = notes[i];

      for (let j = i + 1; j < notes.length; j++) {
        const b = notes[j];
        
        // 1. Tag overlap connections
        const sharedTags = a.tags.filter(t => b.tags.includes(t));
        if (sharedTags.length > 0) {
          const edgeId = [a.id, b.id].sort().join('-');
          if (!linkSet.has(edgeId)) {
            links.push({ source: a.id, target: b.id, name: `Tags: ${sharedTags.join(', ')}` });
            linkSet.add(edgeId);
          }
        }
      }

      // 2. Direct [[links]] in content
      const contentLinks = a.content.match(/\[\[(.*?)\]\]/g) || [];
      contentLinks.forEach(match => {
        const title = match.slice(2, -2).trim().toLowerCase();
        const b = notes.find(n => n.title.toLowerCase() === title && n.id !== a.id);
        if (b) {
          const edgeId = [a.id, b.id].sort().join('-');
          if (!linkSet.has(edgeId)) {
            links.push({ source: a.id, target: b.id, name: 'Linked in text' });
            linkSet.add(edgeId);
          }
        }
      });
    }

    return { nodes, links };
  }, [notes]);

  const handleNodeClick = useCallback((node: any) => {
    navigate(`/notes/${node.id}`);
  }, [navigate]);

  const handleZoomIn = () => {
    const currentZoom = graphRef.current?.zoom();
    if (currentZoom) graphRef.current.zoom(currentZoom * 1.5, 400);
  };

  const handleZoomOut = () => {
    const currentZoom = graphRef.current?.zoom();
    if (currentZoom) graphRef.current.zoom(currentZoom / 1.5, 400);
  };

  const handleFit = () => {
    graphRef.current?.zoomToFit(400, 50);
  };

  // Color palette
  const textColor = themeMode === 'dark' ? '#e5e7eb' : '#374151';
  const linkColor = themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Dot pattern background
  const dotColor = themeMode === 'dark' ? '#374151' : '#D1D5DB';
  const bgPattern = `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`;

  return (
    <div 
      className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[var(--color-bg)]"
      style={{
        backgroundImage: bgPattern,
        backgroundSize: '24px 24px'
      }}
    >
      
      {/* Top Header/Title Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Share2 className="h-5 w-5 text-[#E45834]" />
          Knowledge Graph
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {graphData.nodes.length} Notes • {graphData.links.length} Connections
        </p>
      </div>

      {/* Force Graph Renderer */}
      <div className="absolute inset-0 cursor-move">
        <ForceGraph2D
          ref={graphRef}
          width={windowSize.width}
          height={windowSize.height - 64} // Adjust for navbar approx
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(node: any) => node.favorite ? '#E45834' : (themeMode === 'dark' ? '#4B5563' : '#9CA3AF')}
          nodeRelSize={6}
          linkColor={() => linkColor}
          linkWidth={1.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={handleNodeClick}
          backgroundColor="rgba(0,0,0,0)"
          // Custom node drawing to render text labels
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            const r = Math.sqrt(Math.max(0, node.val || 1)) * 4;
            
            // Draw Circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.favorite ? '#E45834' : (themeMode === 'dark' ? '#374151' : '#D1D5DB');
            ctx.fill();
            
            // Draw Border
            ctx.lineWidth = 1 / globalScale;
            ctx.strokeStyle = themeMode === 'dark' ? '#1F2937' : '#F3F4F6';
            ctx.stroke();

            // Draw Text Label if zoomed in enough
            if (globalScale > 1.2) {
              const textWidth = ctx.measureText(label).width;
              const bgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
              
              ctx.fillStyle = themeMode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(node.x - bgDimensions[0] / 2, node.y + r + 2, bgDimensions[0], bgDimensions[1]);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = textColor;
              ctx.fillText(label, node.x, node.y + r + 2 + fontSize/2);
            }
          }}
        />
      </div>

      {/* Floating Toolbar (Zoom / Fit) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] p-1.5 rounded-full shadow-lg">
        <button onClick={handleZoomOut} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full text-[var(--color-text)] transition-colors" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={handleFit} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full text-[var(--color-text)] transition-colors" title="Fit to Screen">
          <Maximize className="h-4 w-4" />
        </button>
        <button onClick={handleZoomIn} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full text-[var(--color-text)] transition-colors" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Help / Guide Button (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
        {showGuide && (
          <div className="mb-3 w-64 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl animate-fade-in origin-bottom-right">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-sm text-[var(--color-text)]">How to use Graph View</h3>
              <button onClick={() => setShowGuide(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li className="flex gap-2">
                <span className="font-bold text-[#E45834]">1.</span> 
                <span><strong>Drag</strong> nodes around to organize your map.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#E45834]">2.</span> 
                <span><strong>Scroll</strong> your mouse to zoom in and out.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#E45834]">3.</span> 
                <span><strong>Click</strong> on any bubble to instantly open that note.</span>
              </li>
              <li className="flex gap-2 pt-1 mt-1 border-t border-[var(--color-border)]">
                <span className="text-[10px] italic">Lines connect notes that share tags or link to each other!</span>
              </li>
            </ul>
          </div>
        )}

        <button
          onClick={() => setShowGuide(!showGuide)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            showGuide 
              ? 'bg-[#E45834] text-white rotate-12' 
              : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[#E45834] hover:text-[#E45834]'
          }`}
          title="Graph Guide"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>

    </div>
  );
}
