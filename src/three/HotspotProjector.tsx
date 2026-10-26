import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { hotspots, labelElements } from './hotspots'

/** Projects each hotspot into screen space and moves its DOM label there. */
export function HotspotProjector() {
  const point = useMemo(() => new Vector3(), [])

  useFrame(({ camera, size }) => {
    // The camera rig moved the camera this frame; refresh its matrices before projecting.
    camera.updateMatrixWorld()
    for (const hotspot of hotspots) {
      const el = labelElements.get(hotspot.id)
      if (!el) continue
      point.set(...hotspot.position).project(camera)
      const behind = point.z > 1
      const x = ((point.x + 1) / 2) * size.width
      const y = ((1 - point.y) / 2) * size.height
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      el.style.visibility = behind ? 'hidden' : ''
    }
  })

  return null
}
