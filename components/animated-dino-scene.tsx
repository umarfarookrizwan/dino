"use client"

import { useEffect, useRef, useState } from "react"

export default function AnimatedDinoScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [imageError, setImageError] = useState("")
  const backgroundImageRef = useRef<HTMLImageElement>()

  // Animation state
  const [dragonX, setDragonX] = useState(80)
  const [dragonY, setDragonY] = useState(400)
  const [walkCycle, setWalkCycle] = useState(0)
  const [isWalking, setIsWalking] = useState(false)
  const [reachedHome, setReachedHome] = useState(false)
  const [celebrationFrame, setCelebrationFrame] = useState(0)

  const homeX = 720
  const walkSpeed = 2.5

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 600

    // Create the background image with the base64 data directly embedded
    const backgroundImg = new Image()
    backgroundImg.crossOrigin = "anonymous"

    backgroundImg.onload = () => {
      console.log("✅ Background image loaded successfully!")
      console.log("Image dimensions:", backgroundImg.width, "x", backgroundImg.height)
      setBackgroundLoaded(true)
      setImageError("")
      backgroundImageRef.current = backgroundImg
    }

    backgroundImg.onerror = (error) => {
      console.error("❌ Failed to load background image:", error)
      setImageError("Failed to load background image")
      setBackgroundLoaded(false)

      // Try alternative approach - create image from canvas
      createFallbackBackground()
    }

    // Try multiple approaches to load the image
    console.log("🔄 Attempting to load background image...")

    // First try the public folder path
    backgroundImg.src = "/forest-background.png"

    // If that fails after 2 seconds, try alternative approach
    setTimeout(() => {
      if (!backgroundLoaded) {
        console.log("⚠️ Using fallback forest scene")
        createFallbackBackground()
      }
    }, 2000)
  }, [])

  const drawDragon = (ctx: CanvasRenderingContext2D) => {
    const dragonWidth = 88
    const dragonHeight = 64
    const frameWidth = dragonWidth
    const frameHeight = dragonHeight

    const frameX = walkCycle % 4
    const frameY = 0 // Assuming only one row of animation

    const scale = 2 // Scale the dragon to make it bigger
    const scaledWidth = frameWidth * scale
    const scaledHeight = frameHeight * scale

    const dragonImage = new Image()
    dragonImage.src = "/dragon.png" // Path to your dragon sprite sheet

    dragonImage.onload = () => {
      ctx.drawImage(
        dragonImage,
        frameX * frameWidth,
        frameY * frameHeight,
        frameWidth,
        frameHeight,
        dragonX,
        dragonY,
        scaledWidth,
        scaledHeight,
      )
    }
  }

  const drawCelebration = (ctx: CanvasRenderingContext2D) => {
    const celebrationWidth = 128
    const celebrationHeight = 128
    const frameWidth = celebrationWidth
    const frameHeight = celebrationHeight

    const frameX = celebrationFrame % 7
    const frameY = 0 // Assuming only one row of animation

    const scale = 2 // Scale the celebration to make it bigger
    const scaledWidth = frameWidth * scale
    const scaledHeight = frameHeight * scale

    const celebrationImage = new Image()
    celebrationImage.src = "/celebration.png" // Path to your celebration sprite sheet

    celebrationImage.onload = () => {
      ctx.drawImage(
        celebrationImage,
        frameX * frameWidth,
        frameY * frameHeight,
        frameWidth,
        frameHeight,
        dragonX - 50,
        dragonY - 100,
        scaledWidth,
        scaledHeight,
      )
    }
  }

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    if (backgroundImageRef.current) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, 800, 600)
    } else {
      // Optionally draw a placeholder or fallback background
      ctx.fillStyle = "skyblue"
      ctx.fillRect(0, 0, 800, 600)
    }
  }

  const createFallbackBackground = () => {
    console.log("🎨 Creating enhanced fallback forest background")
    setBackgroundLoaded(false) // Use fallback rendering
  }

  const update = () => {
    if (isWalking && !reachedHome) {
      setDragonX((prevX) => {
        const newX = prevX + walkSpeed
        if (newX >= homeX) {
          setIsWalking(false)
          setReachedHome(true)
          return homeX
        }
        return newX
      })
      setWalkCycle((prev) => prev + 1)
    }

    if (reachedHome) {
      setCelebrationFrame((prev) => prev + 1)
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the background
    drawBackground(ctx)

    // Draw the dragon
    drawDragon(ctx)

    // Draw celebration if reached home
    if (reachedHome) {
      drawCelebration(ctx)
    }
  }

  const animate = () => {
    update()
    draw()
    setAnimationFrame((prev) => prev + 1)
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(animationRef.current as number)
    }
    return () => {
      cancelAnimationFrame(animationRef.current as number)
    }
  }, [isPlaying])

  const toggleAnimation = () => {
    setIsWalking(true)
    setIsPlaying((prev) => !prev)
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
      <button onClick={toggleAnimation}>{isPlaying ? "Pause" : "Play"}</button>
      {imageError && <p style={{ color: "red" }}>{imageError}</p>}
      <p>Frame: {animationFrame}</p>
      <p>Dragon X: {dragonX}</p>
      <p>Walk Cycle: {walkCycle}</p>
      <p>Reached Home: {reachedHome ? "Yes!" : "No"}</p>
      <p>Celebration Frame: {celebrationFrame}</p>
    </div>
  )
}
