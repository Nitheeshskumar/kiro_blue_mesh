import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { CustomizationSelection } from '../../types/customization.types'
import  PremiumCard  from '../ui/PremiumCard'
import  PremiumButton  from '../ui/PremiumButton'

interface Enhanced3DPreviewProps {
  selection: CustomizationSelection
  productType?: 'shirt' | 'pants' | 'dress' | 'hoodie'
  className?: string
}

// 3D Model Component
const ProductModel: React.FC<{
  selection: CustomizationSelection
  productType: string
}> = ({ selection, productType }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Create basic geometry based on product type
  const getGeometry = () => {
    switch (productType) {
      case 'shirt':
        return new THREE.BoxGeometry(2, 2.5, 0.3)
      case 'hoodie':
        return new THREE.BoxGeometry(2.2, 2.8, 0.4)
      case 'pants':
        return new THREE.CylinderGeometry(0.8, 0.9, 3, 8)
      case 'dress':
        return new THREE.ConeGeometry(1.2, 3, 8)
      default:
        return new THREE.BoxGeometry(2, 2.5, 0.3)
    }
  }

  // Get material based on selection
  const getMaterial = () => {
    const color = selection.colorId ? getColorHex(selection.colorId) : '#ffffff'
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.3,
      metalness: 0.1,
    })
  }

  const getColorHex = (colorId: string): string => {
    // Map color IDs to hex values
    const colorMap: { [key: string]: string } = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00',
      'yellow': '#ffff00',
      'navy': '#000080',
      'gray': '#808080'
    }
    return colorMap[colorId] || '#ffffff'
  }

  // Animate the model
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = hovered ? state.clock.elapsedTime * 0.5 : 0
      meshRef.current.scale.setScalar(hovered ? 1.05 : 1)
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={getGeometry()}
      material={getMaterial()}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {/* Add sleeve modifications based on selection */}
      {selection.sleeveId === 'long' && productType === 'shirt' && (
        <>
          <mesh position={[-1.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
            <meshStandardMaterial color={getColorHex(selection.colorId || 'white')} />
          </mesh>
          <mesh position={[1.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
            <meshStandardMaterial color={getColorHex(selection.colorId || 'white')} />
          </mesh>
        </>
      )}
      
      {selection.sleeveId === 'short' && productType === 'shirt' && (
        <>
          <mesh position={[-1.1, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.6, 8]} />
            <meshStandardMaterial color={getColorHex(selection.colorId || 'white')} />
          </mesh>
          <mesh position={[1.1, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.6, 8]} />
            <meshStandardMaterial color={getColorHex(selection.colorId || 'white')} />
          </mesh>
        </>
      )}
    </mesh>
  )
}

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
  </div>
)

// Main 3D Preview Component
export const Enhanced3DPreview: React.FC<Enhanced3DPreviewProps> = ({
  selection,
  productType = 'shirt',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'front' | 'back' | 'side'>('front')
  const [autoRotate, setAutoRotate] = useState(false)

  const getCameraPosition = (): [number, number, number] => {
    switch (viewMode) {
      case 'front':
        return [0, 0, 5]
      case 'back':
        return [0, 0, -5]
      case 'side':
        return [5, 0, 0]
      default:
        return [0, 0, 5]
    }
  }

  return (
    <PremiumCard elevation="medium" className={`${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">3D Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                autoRotate 
                  ? 'bg-forest-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Auto Rotate
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-gradient-to-b from-gray-50 to-gray-100">
        <Canvas
          camera={{ position: getCameraPosition(), fov: 50 }}
          shadows
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />

            {/* Environment */}
            <Environment preset="studio" />

            {/* Product Model */}
            <ProductModel selection={selection} productType={productType} />

            {/* Ground */}
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />

            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              minDistance={3}
              maxDistance={8}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
            />
          </Suspense>
        </Canvas>

        {/* Loading overlay */}
        <Suspense fallback={<LoadingSpinner />}>
          <div />
        </Suspense>
      </div>

      {/* View Controls */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {(['front', 'back', 'side'] as const).map((view) => (
              <PremiumButton
                key={view}
                variant={viewMode === view ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </PremiumButton>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* Customization Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Selection</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {selection.colorId && (
              <div>Color: <span className="font-medium">{selection.colorId}</span></div>
            )}
            {selection.sizeId && (
              <div>Size: <span className="font-medium">{selection.sizeId}</span></div>
            )}
            {selection.sleeveId && (
              <div>Sleeves: <span className="font-medium">{selection.sleeveId}</span></div>
            )}
            {selection.customMeasurements && (
              <div>Fit: <span className="font-medium">Custom</span></div>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}