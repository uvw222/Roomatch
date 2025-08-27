"use client"

import { useEffect, useRef } from 'react'

interface ConfettiProps {
  isActive: boolean
  onComplete?: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  size: number
  opacity: number
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348'
]

export default function Confetti({ isActive, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create particles
    const particles: Particle[] = []
    const particleCount = 200 // Increased particle count for more celebration

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 10, // Increased velocity
        vy: Math.random() * 4 + 3, // Increased fall speed
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15, // Increased rotation speed
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6, // Increased size
        opacity: 1
      })
    }

    particlesRef.current = particles

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let activeParticles = 0

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed

        // Add gravity
        particle.vy += 0.15

        // Reduce opacity over time
        if (particle.y > canvas.height * 0.3) {
          particle.opacity -= 0.008
        }

        // Draw particle
        if (particle.opacity > 0 && particle.y < canvas.height + 50) {
          ctx.save()
          ctx.globalAlpha = particle.opacity
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)

          // Draw confetti piece with more variety
          ctx.fillStyle = particle.color
          
          // Random confetti shapes
          const shapeType = Math.random()
          if (shapeType < 0.3) {
            // Square
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
          } else if (shapeType < 0.6) {
            // Circle
            ctx.beginPath()
            ctx.arc(0, 0, particle.size / 2, 0, 2 * Math.PI)
            ctx.fill()
          } else {
            // Triangle
            ctx.beginPath()
            ctx.moveTo(0, -particle.size / 2)
            ctx.lineTo(-particle.size / 2, particle.size / 2)
            ctx.lineTo(particle.size / 2, particle.size / 2)
            ctx.closePath()
            ctx.fill()
          }

          ctx.restore()
          activeParticles++
        }
      })

      if (activeParticles > 0) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, onComplete])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isActive) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: 'fixed', top: 0, left: 0 }}
    />
  )
}
