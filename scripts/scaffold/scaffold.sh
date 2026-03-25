#!/bin/bash

# Research Tool Scaffolder
# Usage: ./scaffold.sh <project-name>

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./scaffold.sh <project-name>"
  exit 1
fi

echo "🚀 Scaffolding new research tool: $PROJECT_NAME..."

# 1. Create directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# 2. Initialize Vite
npm init vite@latest . -- --template react-ts

# 3. Add Research Tool Library dependencies
# Note: In a real world, these would be npm packages. 
# Here we will link them or assume they are available.
npm install framer-motion lucide-react d3

# 4. Create base structure
mkdir -p src/data src/analysis src/components

# 5. Overwrite App.tsx with a research-ready template
cat <<EOF > src/App.tsx
import { useState } from 'react';
import { GlassCard, TranscriptViewer, AnnotationDesk, RadialLayout, theme } from '@research-tools/ui'; // Mock imports
import './App.css';

function App() {
  const [messages] = useState([
    { id: '1', speaker: 'user', content: 'Hello, I need help with my research.', role: 'Seeker' },
    { id: '2', speaker: 'assistant', content: 'Sure, what are you working on?', role: 'Supporter' },
  ]);

  return (
    <div style={{ background: theme.colors.background, minHeight: '100vh', padding: '40px', color: theme.colors.text.primary }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ background: theme.gradients.premium, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          $PROJECT_NAME
        </h1>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <GlassCard title="Conversation Analysis">
          <TranscriptViewer messages={messages} />
        </GlassCard>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AnnotationDesk 
            fields={[
              { id: 'role', label: 'Assign Role', type: 'select', options: ['Seeker', 'Supporter', 'Expert'] },
              { id: 'note', label: 'Notes', type: 'text' }
            ]}
            onSubmit={(data) => console.log('Annotation:', data)}
          />
          
          <GlassCard title="Role Dynamics">
            <RadialLayout messages={messages} width={400} height={400} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default App;
EOF

echo "✅ $PROJECT_NAME created successfully!"
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  npm install"
echo "  npm run dev"
