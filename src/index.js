import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import * as THREE from 'three'
import { Canvas } from 'react-three-fiber'
import { Tetrahedron, Box, Octahedron, Polyhedron, Dodecahedron, Icosahedron } from '@react-three/drei'
import { Physics, usePlane, useBox, useConvexPolyhedron } from 'use-cannon'
import niceColors from 'nice-color-palettes'
import './styles.css'

const textColor = 'white'
const dieColor = 'indigo'

const calculateTextureSize = (approx) => {
  return Math.max(128, Math.pow(2, Math.floor(Math.log(approx) / Math.log(2))))
}

const createTextTexture = (text, color, backColor) => {
  // TODO Set size/textMargin for each shape
  const size = 100
  const textMargin = 1

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const ts = calculateTextureSize(size / 2 + size * textMargin) * 2
  canvas.width = canvas.height = ts
  context.font = ts / (1 + 2 * textMargin) + 'pt Arial'
  context.fillStyle = backColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  if (text === 6 || text === 9) {
    context.fillText('  .', canvas.width / 2, canvas.height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

const createUvs = (sides, fl, tab, af) => {
  // TODO Store tab and af as variables for each shape

  const uvs = []
  const aa = (Math.PI * 2) / fl

  for (let i = 0; i < sides; ++i) {
    for (let j = 0; j < fl - 2; ++j) {
      for (let k = 0; k < 3; ++k) {
        const theta = aa * (j + k)

        uvs.push(
          // u
          (Math.cos(theta + af) + 1 + tab) / 2 / (1 + tab),
          // v
          (Math.sin(theta + af) + 1 + tab) / 2 / (1 + tab)
        )
      }
    }
  }

  return new Float32Array(uvs)
}

const Plane = ({ color, ...props }) => {
  const [ref] = usePlane(() => ({ ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <meshPhongMaterial attach="material" color={color} />
    </mesh>
  )
}

const D4 = (props) => {
  const sides = 4
  const verticesPerFace = 3
  const radius = 2
  const tetrahedronGeometry = new THREE.TetrahedronGeometry(radius)
  const [ref, api] = useConvexPolyhedron(() => {
    return {
      args: tetrahedronGeometry,
      mass: 1,
      ...props
    }
  })

  // Defining groups allows us to use a material array for BufferGeometry
  useEffect(() => {
    if (ref.current) {
      for (let i = 0; i < sides; i++) {
        ref.current.geometry.addGroup(i * verticesPerFace, verticesPerFace, i)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Tetrahedron args={radius} ref={ref} onClick={() => api.applyImpulse([0, 40, 0], [0, 0, 0])} castShadow receiveShadow>
      {/* TODO Write texture creation function that's specific to D4 */}
      <meshPhongMaterial attachArray="material" color="grey" />
      <meshPhongMaterial attachArray="material" color="white" />
      <meshPhongMaterial attachArray="material" color="brown" />
      <meshPhongMaterial attachArray="material" color="black" />
    </Tetrahedron>
  )
}

const D6 = (props) => {
  const sides = 6
  const radius = 2.5
  const [ref, api] = useBox(() => ({ args: [radius, radius, radius], mass: 1, ...props }))

  var array = []
  const x = 0
  const y = 0

  const rolldice = () => {
    const rand = Math.floor(Math.random() * (1 - 6) + 6)
    console.log(rand + ' This is the random number')
    if (rand == 1) {
      api.applyImpulse([23, 0, 0], [0, 0, 0])
      console.log('1')
    } else if (rand == 2) {
      api.applyImpulse([10, 0, 0], [0, 0, 0])
      console.log('2')
    } else if (rand == 3) {
      api.applyImpulse([0, 23, 0], [0, 0, 0])
      console.log('3')
    } else if (rand == 4) {
      api.applyImpulse([0, -23, 0], [0, 0, 0])
      console.log('4')
    } else if (rand == 5) {
      api.applyImpulse([0, 37, 0], [0, 0, 0])
      console.log('5')
    } else if (rand == 6) {
      api.applyImpulse([0, 20, 0], [0, 0, 0])
      console.log('6')
    }
  }
  return (
    <Box args={[radius, radius, radius]} ref={ref} onClick={rolldice} castShadow receiveShadow>
      {Array.from(Array(sides)).map((_, i) => (
        <meshPhongMaterial attachArray="material" map={createTextTexture(i + 1, textColor, dieColor)} key={i} />
      ))}
    </Box>
  )
}

ReactDOM.render(
  <Canvas concurrent shadowMap sRGB gl={{ alpha: false }} camera={{ position: [0, -12, 16] }}>
    <hemisphereLight intensity={0.35} />
    <spotLight position={[30, 0, 30]} angle={0.3} penumbra={1} intensity={2} castShadow shadow-mapSize-width={256} shadow-mapSize-height={256} />
    <pointLight position={[-30, 0, -30]} intensity={0.5} />
    <Physics gravity={[0, 0, -30]}>
      <Plane color={niceColors[0][0]} />
      <Plane color={niceColors[0][0]} position={[-10, 0, 0]} rotation={[0, 1, 0]} />
      <Plane color={niceColors[0][0]} position={[10, 0, 0]} rotation={[0, -1, 0]} />
      <Plane color={niceColors[0][0]} position={[0, 10, 0]} rotation={[1, 0, 0]} />
      <Plane color={niceColors[0][0]} position={[0, -10, 0]} rotation={[-1, 0, 0]} />

      <D6 position={[0, 0, 2]} />
    </Physics>
  </Canvas>,
  document.getElementById('root')
)
