import { StrictMode, Suspense } from 'react';
import './App.css'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience';
import { Loader, KeyboardControls } from '@react-three/drei';

const controlsMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'hit', keys: ['Space'] },
]

function App() {

  return (
      <StrictMode>
          <KeyboardControls map={controlsMap}>
              <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                  <Suspense fallback={null}>
                      <Experience />
                  </Suspense>
              </Canvas>
          </KeyboardControls>
          <Loader />
      </StrictMode>
  );
}

export default App
