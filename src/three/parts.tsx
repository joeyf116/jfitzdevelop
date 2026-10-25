import type { ThreeElements } from '@react-three/fiber'

type MeshProps = ThreeElements['mesh']

interface BoxProps extends Omit<MeshProps, 'args'> {
  size: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
}

// Small helpers so the room reads as a layout, not a wall of mesh boilerplate.
export function Box({ size, color, roughness = 0.8, metalness = 0, ...props }: BoxProps) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

interface CylinderProps extends Omit<MeshProps, 'args'> {
  radiusTop: number
  radiusBottom?: number
  height: number
  color: string
  segments?: number
  roughness?: number
  metalness?: number
}

export function Cylinder({
  radiusTop,
  radiusBottom = radiusTop,
  height,
  color,
  segments = 24,
  roughness = 0.7,
  metalness = 0,
  ...props
}: CylinderProps) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}
