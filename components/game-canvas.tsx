"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface GameCanvasProps {
  level: any
  code: any[]
  isRunning: boolean
  soundEnabled: boolean
  animationSpeed: number
  onLevelComplete: () => void
  onGameFailed: () => void
  gameState: string
}

interface DinosaurObject {
  x: number
  y: number
  width: number
  height: number
  vx?: number
  vy?: number
  active: boolean
  frame?: number
  animationType?: string
  isMoving?: boolean
  walkCycle?: number
}

export default function GameCanvas({
  level,
  code,
  isRunning,
  soundEnabled,
  animationSpeed,
  onLevelComplete,
  onGameFailed,
  gameState,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const backgroundImageRef = useRef<HTMLImageElement | null>(null)

  // Game state
  const [dinosaur, setDinosaur] = useState<DinosaurObject>({
    x: 120,
    y: 350,
    width: 100,
    height: 80,
    vx: 0,
    vy: 0,
    active: true,
    frame: 0,
    animationType: "idle",
    isMoving: false,
    walkCycle: 0,
  })

  const [enemies, setEnemies] = useState<DinosaurObject[]>([])
  const [fireballs, setFireballs] = useState<DinosaurObject[]>([])
  const [particles, setParticles] = useState<any[]>([])
  const [commandQueue, setCommandQueue] = useState<any[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentAction, setCurrentAction] = useState<string>("idle")
  const [animationFrame, setAnimationFrame] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 600

    // Load the forest background image
    const backgroundImg = new Image()
    backgroundImg.crossOrigin = "anonymous"

    backgroundImg.onload = () => {
      console.log("✅ Beautiful forest background loaded for main game!")
      console.log("Image dimensions:", backgroundImg.width, "x", backgroundImg.height)
      setBackgroundLoaded(true)
      backgroundImageRef.current = backgroundImg
    }

    backgroundImg.onerror = (error) => {
      console.error("❌ Failed to load forest background:", error)
      setBackgroundLoaded(false)
      // Try the original forest-background.png as fallback
      const fallbackImg = new Image()
      fallbackImg.crossOrigin = "anonymous"
      fallbackImg.onload = () => {
        console.log("✅ Fallback forest background loaded!")
        setBackgroundLoaded(true)
        backgroundImageRef.current = fallbackImg
      }
      fallbackImg.src = "/forest-background.png"
    }

    // Try both the new forest-bg.jpg and the original forest-background.png
    backgroundImg.src = "/forest-bg.jpg"

    // Initialize enemies from level data
    const initialEnemies = (level.enemies || []).map((enemy: any) => ({
      x: enemy.x,
      y: enemy.y,
      width: 70,
      height: 60,
      active: true,
      frame: 0,
      animationType: "idle",
      isMoving: false,
      walkCycle: 0,
    }))

    setEnemies(initialEnemies)
    setGameLoaded(true)

    // Start render loop
    const render = () => {
      drawGame()
      updateAnimations()
      setAnimationFrame((prev) => prev + 1)
      animationRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [level])

  // Execute code when running
  useEffect(() => {
    if (isRunning && gameLoaded && code.length > 0) {
      console.log("🦕 STARTING GAME - Code received:", code)
      setDebugInfo(`Starting with ${code.length} commands`)
      setCommandQueue([...code])
      setIsExecuting(true)
      setCurrentAction("idle")
    }
  }, [isRunning, code, gameLoaded])

  // Process command queue - SIMPLIFIED
  useEffect(() => {
    if (isExecuting && commandQueue.length > 0 && currentAction === "idle") {
      const command = commandQueue[0]
      console.log("🎮 EXECUTING COMMAND:", command, "Queue length:", commandQueue.length)
      setDebugInfo(`Executing: ${command.type}`)
      executeCommand(command)
    } else if (isExecuting && commandQueue.length === 0) {
      console.log("🏁 ALL COMMANDS COMPLETED")
      setIsExecuting(false)
      setCurrentAction("idle")
      setDebugInfo("All commands completed")
      setTimeout(() => {
        checkWinCondition()
      }, 200)
    }
  }, [commandQueue, isExecuting, currentAction])

  const updateAnimations = () => {
    // Update dinosaur animation frame
    setDinosaur((prev) => ({
      ...prev,
      frame: (prev.frame || 0) + 1,
      walkCycle: prev.isMoving ? (prev.walkCycle || 0) + 0.3 : 0,
    }))

    // Update enemy animations
    setEnemies((prev) =>
      prev.map((enemy) => ({
        ...enemy,
        frame: (enemy.frame || 0) + 1,
      })),
    )

    // Update particles
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1,
          alpha: particle.alpha * 0.98,
        }))
        .filter((particle) => particle.life > 0),
    )
  }

  const drawGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw forest background (NEW!)
    drawForestBackground(ctx)

    // Draw game objects
    drawAnimatedDinosaur(ctx)
    enemies.forEach((enemy) => enemy.active && drawAnimatedEnemy(ctx, enemy))
    fireballs.forEach((fireball) => fireball.active && drawFireball(ctx, fireball))
    drawHome(ctx)

    // Draw particles
    particles.forEach((particle) => drawParticle(ctx, particle))

    // Draw prehistoric UI
    drawPrehistoricUI(ctx)

    // Draw debug info
    drawDebugInfo(ctx)
  }

  const drawForestBackground = (ctx: CanvasRenderingContext2D) => {
    if (backgroundLoaded && backgroundImageRef.current) {
      // Draw the beautiful forest background to fill the entire canvas
      ctx.drawImage(backgroundImageRef.current, 0, 0, 800, 600)

      // Add a very subtle overlay to enhance contrast for the game elements
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, 800, 600)

      console.log("🌲 Forest background rendered in main game!")
    } else {
      // Enhanced fallback forest scene
      drawEnhancedFallbackForest(ctx)
    }
  }

  const drawEnhancedFallbackForest = (ctx: CanvasRenderingContext2D) => {
    // Sky gradient (warm yellow like in the forest image)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 400)
    skyGradient.addColorStop(0, "#F5E6A3") // Light yellow
    skyGradient.addColorStop(0.5, "#E6D16A") // Medium yellow
    skyGradient.addColorStop(1, "#D4C55A") // Darker yellow
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, 800, 400)

    // Draw distant mountains
    ctx.fillStyle = "#8FBC8F"
    ctx.beginPath()
    ctx.moveTo(0, 300)
    ctx.lineTo(200, 200)
    ctx.lineTo(400, 250)
    ctx.lineTo(600, 180)
    ctx.lineTo(800, 220)
    ctx.lineTo(800, 400)
    ctx.lineTo(0, 400)
    ctx.closePath()
    ctx.fill()

    // Draw tree trunks
    ctx.fillStyle = "#8B4513"
    const treePositions = [50, 150, 250, 350, 450, 550, 650, 750]
    treePositions.forEach((x, i) => {
      const height = 200 + Math.sin(i) * 30
      const width = 25 + Math.sin(i * 0.5) * 10
      ctx.fillRect(x - width / 2, 400 - height, width, height)
    })

    // Draw tree canopy with depth
    const canopyGradient = ctx.createLinearGradient(0, 0, 0, 150)
    canopyGradient.addColorStop(0, "#228B22")
    canopyGradient.addColorStop(0.5, "#32CD32")
    canopyGradient.addColorStop(1, "#90EE90")
    ctx.fillStyle = canopyGradient
    ctx.fillRect(0, 0, 800, 150)

    // Add some leaves hanging down with animation
    ctx.fillStyle = "#32CD32"
    for (let i = 0; i < 20; i++) {
      const x = i * 40 + Math.sin(animationFrame * 0.01 + i) * 10
      const y = 120 + Math.sin(animationFrame * 0.02 + i) * 20
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Ground with texture
    const groundGradient = ctx.createLinearGradient(0, 450, 0, 600)
    groundGradient.addColorStop(0, "#90EE90") // Light green
    groundGradient.addColorStop(0.5, "#228B22") // Forest green
    groundGradient.addColorStop(1, "#006400") // Dark green
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, 450, 800, 150)

    // Add grass texture
    ctx.fillStyle = "#32CD32"
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 800
      const y = 450 + Math.random() * 50
      ctx.fillRect(x, y, 2, 8 + Math.random() * 10)
    }

    // Add mushrooms like in the forest image
    ctx.fillStyle = "#FF6B6B"
    const mushroomPositions = [100, 200, 400, 500, 600]
    mushroomPositions.forEach((x) => {
      // Mushroom cap
      ctx.beginPath()
      ctx.arc(x, 520, 12, 0, Math.PI * 2)
      ctx.fill()
      // Mushroom stem
      ctx.fillStyle = "#F5F5DC"
      ctx.fillRect(x - 3, 520, 6, 15)
      ctx.fillStyle = "#FF6B6B"
    })

    // Add flowers
    ctx.fillStyle = "#FFB6C1"
    const flowerPositions = [80, 180, 320, 480, 580, 680]
    flowerPositions.forEach((x, i) => {
      const y = 500 + Math.sin(i) * 10
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    })

    // Loading indicator if background is still loading
    if (!backgroundLoaded) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(250, 280, 300, 40)
      ctx.fillStyle = "#FFF"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("🌲 Loading Forest Background... 🌲", 400, 305)
    }
  }

  const drawDebugInfo = (ctx: CanvasRenderingContext2D) => {
    // Debug information with forest theme
    ctx.fillStyle = "rgba(34, 139, 34, 0.9)" // Forest green background
    ctx.fillRect(10, 520, 400, 80)
    ctx.strokeStyle = "#FFD700"
    ctx.lineWidth = 2
    ctx.strokeRect(10, 520, 400, 80)

    ctx.fillStyle = "#FFFF00"
    ctx.font = "14px monospace"
    ctx.fillText(`🦕 Dino Position: (${Math.round(dinosaur.x)}, ${Math.round(dinosaur.y)})`, 15, 540)
    ctx.fillText(`🎬 Current Action: ${currentAction}`, 15, 555)
    ctx.fillText(`🚶 Is Moving: ${dinosaur.isMoving}`, 15, 570)
    ctx.fillText(`📋 Queue Length: ${commandQueue.length}`, 15, 585)
    ctx.fillText(`🌲 Background: ${backgroundLoaded ? "Forest Image Loaded" : "Using Fallback Scene"}`, 220, 540)
    ctx.fillText(`🎯 Debug: ${debugInfo}`, 220, 555)
  }

  const drawPrehistoricUI = (ctx: CanvasRenderingContext2D) => {
    // Enhanced UI with forest theme
    ctx.fillStyle = "rgba(34, 139, 34, 0.95)" // Forest green
    ctx.fillRect(10, 10, 350, 90)

    ctx.strokeStyle = "#FFD700"
    ctx.lineWidth = 3
    ctx.strokeRect(10, 10, 350, 90)

    // Level info with forest styling
    ctx.fillStyle = "#FFFF00"
    ctx.font = "bold 18px Arial"
    ctx.fillText(`🌲 ${level.title}`, 20, 35)

    // Progress bar with forest colors
    const progress = Math.min((dinosaur.x - 120) / ((level.goalX || 700) - 120), 1)
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fillRect(20, 50, 250, 15)

    // Forest-themed progress bar
    const progressGradient = ctx.createLinearGradient(20, 50, 270, 65)
    progressGradient.addColorStop(0, "#32CD32")
    progressGradient.addColorStop(0.5, "#228B22")
    progressGradient.addColorStop(1, "#006400")
    ctx.fillStyle = progressGradient
    ctx.fillRect(20, 50, 250 * progress, 15)

    // Progress text
    ctx.fillStyle = "#FFF"
    ctx.font = "12px Arial"
    ctx.fillText(`Forest Journey: ${Math.round(progress * 100)}%`, 280, 60)

    // Background status
    ctx.fillStyle = backgroundLoaded ? "#32CD32" : "#FFB347"
    ctx.font = "10px Arial"
    ctx.fillText(backgroundLoaded ? "🌲 Forest Loaded" : "🎨 Fallback Scene", 20, 85)
  }

  const drawAnimatedDinosaur = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.translate(dinosaur.x, dinosaur.y)

    // Enhanced shadow for forest scene
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
    ctx.beginPath()
    ctx.ellipse(0, 55, 50, 20, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body animation based on action with enhanced walking
    const bodyBob = dinosaur.isMoving
      ? Math.sin(dinosaur.walkCycle || 0) * 6 // More pronounced walking bob
      : Math.sin((dinosaur.frame || 0) * 0.05) * 2
    const actionScale = dinosaur.isMoving ? 1.08 : 1 // Slightly bigger when walking

    // Add walking lean
    const walkLean = dinosaur.isMoving ? Math.sin((dinosaur.walkCycle || 0) * 0.5) * 0.1 : 0
    ctx.rotate(walkLean)

    ctx.scale(actionScale, actionScale)

    // Dinosaur body with enhanced colors
    drawEnhancedDinosaurBody(ctx, bodyBob)

    // Legs with enhanced walking animation
    drawEnhancedDinosaurLegs(ctx, bodyBob)

    // Dinosaur head with walking expression
    drawEnhancedDinosaurHead(ctx, bodyBob)

    // Tail with walking sway
    drawEnhancedDinosaurTail(ctx, bodyBob)

    // Enhanced walking effects
    if (dinosaur.isMoving) {
      drawEnhancedWalkingEffects(ctx, bodyBob)
    }

    ctx.restore()

    // Action text with enhanced styling
    if (currentAction !== "idle") {
      ctx.fillStyle = "rgba(34, 139, 34, 0.95)"
      ctx.fillRect(dinosaur.x - 70, dinosaur.y - 100, 140, 35)
      ctx.strokeStyle = "#FFD700"
      ctx.lineWidth = 3
      ctx.strokeRect(dinosaur.x - 70, dinosaur.y - 100, 140, 35)
      ctx.fillStyle = "#FFFF00"
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`🦕 ${currentAction.toUpperCase()}`, dinosaur.x, dinosaur.y - 78)
    }
  }

  const drawEnhancedDinosaurBody = (ctx: CanvasRenderingContext2D, bodyBob: number) => {
    // Main body with enhanced gradient
    const bodyGradient = ctx.createRadialGradient(0, bodyBob, 0, 0, bodyBob, 50)
    bodyGradient.addColorStop(0, "#90EE90")
    bodyGradient.addColorStop(0.4, "#32CD32")
    bodyGradient.addColorStop(0.8, "#228B22")
    bodyGradient.addColorStop(1, "#006400")
    ctx.fillStyle = bodyGradient
    ctx.beginPath()
    ctx.ellipse(0, bodyBob, 45, 35, 0, 0, Math.PI * 2)
    ctx.fill()

    // Belly with breathing animation
    const breathe = Math.sin((animationFrame || 0) * 0.1) * 2
    ctx.fillStyle = "#98FB98"
    ctx.beginPath()
    ctx.ellipse(0, bodyBob + 15, 35 + breathe, 25, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body spots
    ctx.fillStyle = "#228B22"
    ctx.beginPath()
    ctx.arc(-15, bodyBob - 10, 6, 0, Math.PI * 2)
    ctx.arc(20, bodyBob + 5, 4, 0, Math.PI * 2)
    ctx.arc(-5, bodyBob + 20, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawEnhancedDinosaurLegs = (ctx: CanvasRenderingContext2D, bodyBob: number) => {
    const walkOffset = dinosaur.isMoving ? Math.sin(dinosaur.walkCycle || 0) * 12 : 0
    const legBob = dinosaur.isMoving ? Math.sin((dinosaur.walkCycle || 0) * 2) * 6 : 0

    ctx.fillStyle = "#228B22"

    // Enhanced leg animation with alternating movement
    const leftLegOffset = dinosaur.isMoving ? Math.sin((dinosaur.walkCycle || 0) + Math.PI) * 8 : 0
    const rightLegOffset = dinosaur.isMoving ? Math.sin(dinosaur.walkCycle || 0) * 8 : 0

    // Left legs
    ctx.fillRect(-25, bodyBob + 25 + leftLegOffset, 15, 25 + legBob)
    ctx.fillRect(-25, bodyBob + 25 - leftLegOffset, 15, 25 - legBob)

    // Right legs
    ctx.fillRect(15, bodyBob + 25 + rightLegOffset, 15, 25 - legBob)
    ctx.fillRect(15, bodyBob + 25 - rightLegOffset, 15, 25 + legBob)

    // Enhanced feet with walking animation
    ctx.fillStyle = "#006400"
    ctx.fillRect(-30, bodyBob + 50 + leftLegOffset, 20, 8)
    ctx.fillRect(15, bodyBob + 50 + rightLegOffset, 20, 8)

    // Foot details
    if (dinosaur.isMoving) {
      ctx.fillStyle = "#8B4513" // Dirt on feet
      ctx.fillRect(-28, bodyBob + 52 + leftLegOffset, 16, 4)
      ctx.fillRect(17, bodyBob + 52 + rightLegOffset, 16, 4)
    }
  }

  const drawEnhancedDinosaurHead = (ctx: CanvasRenderingContext2D, bodyBob: number) => {
    // Head with walking bob
    const headBob = dinosaur.isMoving ? Math.sin((dinosaur.walkCycle || 0) * 1.5) * 3 : 0

    const headGradient = ctx.createRadialGradient(50, bodyBob - 35 + headBob, 0, 50, bodyBob - 35 + headBob, 30)
    headGradient.addColorStop(0, "#98FB98")
    headGradient.addColorStop(0.6, "#90EE90")
    headGradient.addColorStop(1, "#32CD32")
    ctx.fillStyle = headGradient
    ctx.beginPath()
    ctx.ellipse(50, bodyBob - 35 + headBob, 28, 25, 0, 0, Math.PI * 2)
    ctx.fill()

    // Enhanced eyes with blinking
    const blink = Math.sin((animationFrame || 0) * 0.02) < -0.95 ? 0.3 : 1
    ctx.fillStyle = "#FFF"
    ctx.beginPath()
    ctx.ellipse(45, bodyBob - 42 + headBob, 8, 10 * blink, 0, 0, Math.PI * 2)
    ctx.ellipse(55, bodyBob - 42 + headBob, 8, 10 * blink, 0, 0, Math.PI * 2)
    ctx.fill()

    if (blink > 0.5) {
      ctx.fillStyle = "#000"
      ctx.beginPath()
      ctx.ellipse(45, bodyBob - 40 + headBob, 4, 6, 0, 0, Math.PI * 2)
      ctx.ellipse(55, bodyBob - 40 + headBob, 4, 6, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Enhanced snout
    ctx.fillStyle = "#32CD32"
    ctx.beginPath()
    ctx.ellipse(65, bodyBob - 30 + headBob, 15, 12, 0, 0, Math.PI * 2)
    ctx.fill()

    // Nostrils
    ctx.fillStyle = "#228B22"
    ctx.beginPath()
    ctx.ellipse(68, bodyBob - 32 + headBob, 2, 3, 0, 0, Math.PI * 2)
    ctx.ellipse(72, bodyBob - 32 + headBob, 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawEnhancedDinosaurTail = (ctx: CanvasRenderingContext2D, bodyBob: number) => {
    const tailSway = dinosaur.isMoving
      ? Math.sin((dinosaur.walkCycle || 0) * 0.8) * 0.4
      : Math.sin((dinosaur.frame || 0) * 0.1) * 0.2

    ctx.save()
    ctx.translate(-45, bodyBob)
    ctx.rotate(tailSway)

    // Enhanced tail with segments
    const tailGradient = ctx.createLinearGradient(-40, -5, -40, 5)
    tailGradient.addColorStop(0, "#32CD32")
    tailGradient.addColorStop(0.5, "#228B22")
    tailGradient.addColorStop(1, "#006400")
    ctx.fillStyle = tailGradient
    ctx.beginPath()
    ctx.ellipse(-20, 0, 25, 12, 0, 0, Math.PI * 2)
    ctx.fill()

    // Tail tip
    ctx.fillStyle = "#006400"
    ctx.beginPath()
    ctx.ellipse(-35, 0, 12, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawEnhancedWalkingEffects = (ctx: CanvasRenderingContext2D, bodyBob: number) => {
    // Enhanced forest dust clouds
    ctx.fillStyle = "rgba(139, 69, 19, 0.7)"
    for (let i = 0; i < 4; i++) {
      const x = -50 - i * 8 + Math.sin((dinosaur.walkCycle || 0) + i) * 5
      const y = 45 + Math.random() * 15
      const size = 3 + Math.random() * 3
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Enhanced forest-themed speed lines
    ctx.strokeStyle = "rgba(50, 205, 50, 0.9)"
    ctx.lineWidth = 3
    for (let i = 0; i < 4; i++) {
      const offset = Math.sin((dinosaur.walkCycle || 0) + i) * 3
      ctx.beginPath()
      ctx.moveTo(-70 - i * 12, -15 + i * 4 + bodyBob + offset)
      ctx.lineTo(-55 - i * 12, -15 + i * 4 + bodyBob + offset)
      ctx.stroke()
    }

    // Walking rhythm indicator
    if (Math.sin(dinosaur.walkCycle || 0) > 0.8) {
      ctx.fillStyle = "rgba(255, 215, 0, 0.8)"
      ctx.beginPath()
      ctx.arc(0, bodyBob - 60, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawAnimatedEnemy = (ctx: CanvasRenderingContext2D, enemy: DinosaurObject) => {
    ctx.save()
    ctx.translate(enemy.x, enemy.y)

    // Simple enemy with forest theme
    ctx.fillStyle = "#8B0000"
    ctx.beginPath()
    ctx.ellipse(0, 0, 35, 40, 0, 0, Math.PI * 2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = "#FF0000"
    ctx.beginPath()
    ctx.ellipse(-10, -10, 5, 8, 0, 0, Math.PI * 2)
    ctx.ellipse(10, -10, 5, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawFireball = (ctx: CanvasRenderingContext2D, fireball: DinosaurObject) => {
    ctx.save()
    ctx.translate(fireball.x, fireball.y)

    // Enhanced fireball
    const fireGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15)
    fireGradient.addColorStop(0, "#FFD700")
    fireGradient.addColorStop(0.5, "#FF4500")
    fireGradient.addColorStop(1, "#FF0000")
    ctx.fillStyle = fireGradient
    ctx.beginPath()
    ctx.arc(0, 0, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawHome = (ctx: CanvasRenderingContext2D) => {
    const homeX = level.goalX || 700
    const homeY = 320

    ctx.save()
    ctx.translate(homeX, homeY)

    // Enhanced home with forest theme
    const homeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50)
    homeGradient.addColorStop(0, "#8B4513")
    homeGradient.addColorStop(0.7, "#A0522D")
    homeGradient.addColorStop(1, "#654321")
    ctx.fillStyle = homeGradient
    ctx.beginPath()
    ctx.arc(0, 0, 50, 0, Math.PI * 2)
    ctx.fill()

    // Cave entrance
    ctx.fillStyle = "#2F4F4F"
    ctx.beginPath()
    ctx.arc(0, 5, 35, 0, Math.PI * 2)
    ctx.fill()

    // Home sign with forest styling
    ctx.fillStyle = "rgba(34, 139, 34, 0.9)"
    ctx.fillRect(-40, -80, 80, 25)
    ctx.strokeStyle = "#FFD700"
    ctx.lineWidth = 2
    ctx.strokeRect(-40, -80, 80, 25)
    ctx.fillStyle = "#FFFF00"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("🏠 FOREST HOME", 0, -62)

    ctx.restore()
  }

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: any) => {
    ctx.save()
    ctx.globalAlpha = particle.alpha
    ctx.fillStyle = particle.color
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const executeCommand = (command: any) => {
    console.log("🚀 EXECUTING COMMAND:", command.type, "Current dino position:", dinosaur.x)

    switch (command.type) {
      case "move_forward":
        console.log("🦕 MOVE FORWARD - Starting smooth animation")
        setCurrentAction("moving")
        setDebugInfo("Moving forward with smooth animation...")

        // Start smooth walking animation
        setDinosaur((prev) => ({ ...prev, isMoving: true }))

        // Animate to new position smoothly
        const targetX = dinosaur.x + 120
        animateDinosaurSmoothly(targetX, dinosaur.y, 1500) // 1.5 second animation
        break

      case "fly_up":
        setCurrentAction("flying_up")
        setDebugInfo("Flying up...")
        animateDinosaur({ y: Math.max(180, dinosaur.y - 100) })
        break

      case "fly_down":
        setCurrentAction("flying_down")
        setDebugInfo("Flying down...")
        animateDinosaur({ y: Math.min(420, dinosaur.y + 100) })
        break

      case "fly_down":
        setCurrentAction("flying_down")
        setDebugInfo("Flying down...")
        animateDinosaur({ y: Math.min(420, dinosaur.y + 100) })
        break

      case "shoot_fire":
        setCurrentAction("shooting")
        setDebugInfo("Shooting fire...")
        shootFireball()
        return

      case "wait":
        setCurrentAction("waiting")
        setDebugInfo("Waiting...")
        setTimeout(
          () => {
            setCommandQueue((prev) => prev.slice(1))
            setCurrentAction("idle")
          },
          (command.duration || 1000) / animationSpeed,
        )
        return

      case "repeat":
        const repeatCommands: any[] = []
        for (let i = 0; i < command.times; i++) {
          repeatCommands.push(...command.commands)
        }
        setCommandQueue((prev) => [...repeatCommands, ...prev.slice(1)])
        return

      case "if_enemy_ahead":
        const hasEnemyAhead = enemies.some(
          (enemy) =>
            enemy.active && enemy.x > dinosaur.x && enemy.x < dinosaur.x + 180 && Math.abs(enemy.y - dinosaur.y) < 100,
        )

        if (hasEnemyAhead) {
          setCommandQueue((prev) => [...command.commands, ...prev.slice(1)])
        } else {
          setCommandQueue((prev) => prev.slice(1))
        }
        return

      default:
        console.log("❌ Unknown command:", command.type)
        setCommandQueue((prev) => prev.slice(1))
        return
    }
  }

  const animateDinosaur = (targetPos: { x?: number; y?: number }) => {
    const startX = dinosaur.x
    const startY = dinosaur.y
    const endX = targetPos.x ?? dinosaur.x
    const endY = targetPos.y ?? dinosaur.y

    console.log("🎬 STARTING ANIMATION from", startX, "to", endX)

    const duration = 1000 / animationSpeed
    const startTime = Date.now()

    // Set dinosaur as moving
    setDinosaur((prev) => ({ ...prev, isMoving: true }))

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentX = startX + (endX - startX) * progress
      const currentY = startY + (endY - startY) * progress

      console.log("🎬 Animation progress:", progress, "Position:", currentX, currentY)

      // Update dinosaur position
      setDinosaur((prev) => ({
        ...prev,
        x: currentX,
        y: currentY,
        isMoving: true,
      }))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        console.log("✅ ANIMATION COMPLETE - Final position:", endX, endY)
        // Animation complete
        setDinosaur((prev) => ({
          ...prev,
          isMoving: false,
          x: endX,
          y: endY,
        }))
        setCurrentAction("idle")
        setCommandQueue((prev) => prev.slice(1))
        setDebugInfo("Animation complete")
      }
    }

    animate()
  }

  const animateDinosaurSmoothly = (targetX: number, targetY: number, duration: number) => {
    const startX = dinosaur.x
    const startY = dinosaur.y
    const startTime = Date.now()

    console.log("🎬 STARTING SMOOTH ANIMATION from", startX, "to", targetX)

    // Set dinosaur as moving with walking animation
    setDinosaur((prev) => ({
      ...prev,
      isMoving: true,
      animationType: "walking",
    }))

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Use easing function for smoother movement
      const easeProgress = easeInOutQuad(progress)

      const currentX = startX + (targetX - startX) * easeProgress
      const currentY = startY + (targetY - startY) * easeProgress

      // Add walking bob animation
      const walkBob = Math.sin(progress * Math.PI * 6) * 8 // 6 steps during animation

      console.log("🎬 Smooth animation progress:", progress, "Position:", currentX, currentY)

      // Update dinosaur position with walking animation
      setDinosaur((prev) => ({
        ...prev,
        x: currentX,
        y: currentY + walkBob,
        isMoving: true,
        walkCycle: (prev.walkCycle || 0) + 0.4, // Faster walk cycle
        animationType: "walking",
      }))

      // Add walking dust particles
      if (progress > 0.1 && Math.random() < 0.3) {
        addWalkingParticles(currentX, currentY)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        console.log("✅ SMOOTH ANIMATION COMPLETE - Final position:", targetX, targetY)
        // Animation complete
        setDinosaur((prev) => ({
          ...prev,
          isMoving: false,
          x: targetX,
          y: targetY,
          animationType: "idle",
        }))
        setCurrentAction("idle")
        setCommandQueue((prev) => prev.slice(1))
        setDebugInfo("Smooth animation complete")
      }
    }

    animate()
  }

  // Easing function for smoother animation
  const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  // Add walking particles
  const addWalkingParticles = (x: number, y: number) => {
    const newParticles = []
    for (let i = 0; i < 3; i++) {
      newParticles.push({
        x: x - 20 + Math.random() * 40,
        y: y + 40 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2,
        size: 2 + Math.random() * 3,
        color: `rgba(139, 69, 19, ${0.6 + Math.random() * 0.4})`,
        life: 30 + Math.random() * 20,
        alpha: 0.8,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }

  const shootFireball = () => {
    const newFireball: DinosaurObject = {
      x: dinosaur.x + 70,
      y: dinosaur.y - 20,
      width: 30,
      height: 30,
      active: true,
    }

    setFireballs((prev) => [...prev, newFireball])

    // Simple fireball animation
    const startX = newFireball.x
    const endX = startX + 300
    const duration = 1000 / animationSpeed
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentX = startX + (endX - startX) * progress

      setFireballs((prev) => prev.map((fb) => (fb === newFireball ? { ...fb, x: currentX } : fb)))

      // Check collisions
      setEnemies((prev) =>
        prev.map((enemy) => {
          if (enemy.active && Math.abs(enemy.x - currentX) < 60 && Math.abs(enemy.y - newFireball.y) < 60) {
            console.log("🔥 Enemy defeated!")
            return { ...enemy, active: false }
          }
          return enemy
        }),
      )

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setFireballs((prev) => prev.filter((fb) => fb !== newFireball))
        setCurrentAction("idle")
        setCommandQueue((prev) => prev.slice(1))
      }
    }

    animate()
  }

  const checkWinCondition = () => {
    const reachedHome = Math.abs(dinosaur.x - (level.goalX || 700)) < 100
    const allEnemiesDefeated = enemies.every((enemy) => !enemy.active)

    console.log(
      "🏆 WIN CHECK - Dino position:",
      dinosaur.x,
      "Goal:",
      level.goalX,
      "Distance:",
      Math.abs(dinosaur.x - (level.goalX || 700)),
      "Reached:",
      reachedHome,
    )

    if (reachedHome || (level.winCondition === "defeat_enemies" && allEnemiesDefeated)) {
      console.log("🎉 LEVEL COMPLETE!")
      setCurrentAction("celebrating")
      onLevelComplete()
    } else if (dinosaur.y > 480) {
      console.log("💥 LEVEL FAILED")
      onGameFailed()
    }
  }

  const resetGame = () => {
    console.log("🔄 RESETTING GAME")
    setDinosaur({
      x: 120,
      y: 350,
      width: 100,
      height: 80,
      vx: 0,
      vy: 0,
      active: true,
      frame: 0,
      animationType: "idle",
      isMoving: false,
      walkCycle: 0,
    })

    const initialEnemies = (level.enemies || []).map((enemy: any) => ({
      x: enemy.x,
      y: enemy.y,
      width: 70,
      height: 60,
      active: true,
      frame: 0,
      animationType: "idle",
      isMoving: false,
      walkCycle: 0,
    }))

    setEnemies(initialEnemies)
    setFireballs([])
    setParticles([])
    setCommandQueue([])
    setIsExecuting(false)
    setCurrentAction("idle")
    setDebugInfo("Game reset")
  }

  // Reset when not running
  useEffect(() => {
    if (!isRunning) {
      resetGame()
    }
  }, [isRunning])

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-green-800 to-green-900 relative">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-4 border-yellow-400 rounded-lg shadow-2xl"
            style={{ display: "block" }}
          />
          {!gameLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-800 rounded-lg">
              <div className="text-yellow-300 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-300 mx-auto mb-4"></div>
                <p className="text-xl font-bold">🌲 Loading Forest Adventure...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game State Overlays */}
      {gameState === "success" && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <Card className="p-10 text-center bg-gradient-to-br from-green-200 to-green-400 border-4 border-green-500">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">Dinosaur Reached Forest Home!</h2>
            <p className="text-lg text-green-700 mb-4">🎉 Our friendly dino made it through the magical forest! 🎉</p>
            <div className="text-6xl animate-pulse">🦕🌲🏠✨</div>
          </Card>
        </div>
      )}

      {gameState === "failure" && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <Card className="p-10 text-center bg-gradient-to-br from-red-200 to-red-400 border-4 border-red-500">
            <div className="text-8xl mb-6 animate-bounce">🤔</div>
            <h2 className="text-3xl font-bold text-red-800 mb-4">Try Again, Forest Explorer!</h2>
            <p className="text-lg text-red-700 mb-4">🌲 The magical forest adventure continues! 🌲</p>
            <div className="text-4xl animate-pulse">🦕💪🌿</div>
          </Card>
        </div>
      )}
    </div>
  )
}
