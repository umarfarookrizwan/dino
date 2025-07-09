"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCcw, Flag } from "lucide-react"

interface Sprite {
  id: string
  name: string
  x: number
  y: number
  size: number
  visible: boolean
  currentCostume: number
  costumes: string[]
  isMoving: boolean
}

export default function TynkerStyleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentScript, setCurrentScript] = useState("")
  const [animationFrame, setAnimationFrame] = useState(0)

  // Sprite states
  const [dino, setDino] = useState<Sprite>({
    id: "dino",
    name: "Friendly Dino",
    x: 120,
    y: 350,
    size: 1,
    visible: true,
    currentCostume: 0,
    costumes: ["🦕", "🚶‍♂️🦕", "🏃‍♂️🦕", "🦘🦕", "🔥🦕", "😊🦕"],
    isMoving: false,
  })

  const [cave, setCave] = useState<Sprite>({
    id: "cave",
    name: "Dino Home",
    x: 700,
    y: 320,
    size: 1.5,
    visible: true,
    currentCostume: 0,
    costumes: ["🏠", "✨🏠✨", "🎉🏠🎉"],
    isMoving: false,
  })

  const [pterodactyl, setPterodactyl] = useState<Sprite>({
    id: "pterodactyl",
    name: "Flying Friend",
    x: 100,
    y: 100,
    size: 0.8,
    visible: true,
    currentCostume: 0,
    costumes: ["🦅", "🕊️"],
    isMoving: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 600

    const render = () => {
      drawScene()
      setAnimationFrame((prev) => prev + 1)
      animationRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dino, cave, pterodactyl])

  const drawScene = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#FF6B35")
    gradient.addColorStop(0.5, "#FFD23F")
    gradient.addColorStop(1, "#8B4513")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw ground
    ctx.fillStyle = "#654321"
    ctx.fillRect(0, 450, canvas.width, 150)

    // Draw sprites
    drawSprite(ctx, pterodactyl)
    drawSprite(ctx, cave)
    drawSprite(ctx, dino)

    // Draw debug info
    drawDebugInfo(ctx)
  }

  const drawSprite = (ctx: CanvasRenderingContext2D, sprite: Sprite) => {
    if (!sprite.visible) return

    ctx.save()
    ctx.translate(sprite.x, sprite.y)
    ctx.scale(sprite.size, sprite.size)

    // Draw sprite costume (emoji)
    const costume = sprite.costumes[sprite.currentCostume]
    ctx.font = "60px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(costume, 0, 0)

    ctx.restore()

    // Draw sprite info
    if (sprite.id === "dino") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(sprite.x - 80, sprite.y - 80, 160, 25)
      ctx.fillStyle = "#00FF00"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${sprite.name} - Costume: ${sprite.currentCostume}`, sprite.x, sprite.y - 65)
    }
  }

  const drawDebugInfo = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(10, 520, 400, 80)
    ctx.fillStyle = "#00FF00"
    ctx.font = "14px monospace"
    ctx.fillText(`Dino Position: (${Math.round(dino.x)}, ${Math.round(dino.y)})`, 15, 540)
    ctx.fillText(`Dino Costume: ${dino.currentCostume} (${dino.costumes[dino.currentCostume]})`, 15, 555)
    ctx.fillText(`Is Playing: ${isPlaying}`, 15, 570)
    ctx.fillText(`Current Script: ${currentScript}`, 15, 585)
  }

  // Tynker-style animation functions
  const switchCostume = (spriteId: string, costumeIndex: number) => {
    if (spriteId === "dino") {
      setDino((prev) => ({ ...prev, currentCostume: costumeIndex }))
    } else if (spriteId === "cave") {
      setCave((prev) => ({ ...prev, currentCostume: costumeIndex }))
    } else if (spriteId === "pterodactyl") {
      setPterodactyl((prev) => ({ ...prev, currentCostume: costumeIndex }))
    }
  }

  const nextCostume = (spriteId: string) => {
    if (spriteId === "dino") {
      setDino((prev) => ({
        ...prev,
        currentCostume: (prev.currentCostume + 1) % prev.costumes.length,
      }))
    } else if (spriteId === "pterodactyl") {
      setPterodactyl((prev) => ({
        ...prev,
        currentCostume: (prev.currentCostume + 1) % prev.costumes.length,
      }))
    }
  }

  const moveSteps = (spriteId: string, steps: number) => {
    if (spriteId === "dino") {
      setDino((prev) => ({ ...prev, x: prev.x + steps }))
    } else if (spriteId === "pterodactyl") {
      setPterodactyl((prev) => ({ ...prev, x: prev.x + steps }))
    }
  }

  const glideTo = (spriteId: string, targetX: number, targetY: number, duration: number) => {
    let startX = 0,
      startY = 0

    if (spriteId === "pterodactyl") {
      startX = pterodactyl.x
      startY = pterodactyl.y
    }

    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      const currentX = startX + (targetX - startX) * progress
      const currentY = startY + (targetY - startY) * progress

      if (spriteId === "pterodactyl") {
        setPterodactyl((prev) => ({ ...prev, x: currentX, y: currentY }))
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  const isTouching = (sprite1Id: string, sprite2Id: string): boolean => {
    let sprite1, sprite2

    if (sprite1Id === "dino") sprite1 = dino
    if (sprite1Id === "cave") sprite1 = cave
    if (sprite2Id === "dino") sprite2 = dino
    if (sprite2Id === "cave") sprite2 = cave

    if (!sprite1 || !sprite2) return false

    const distance = Math.sqrt(Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2))

    return distance < 100
  }

  const wait = (seconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }

  // 🦕 Main Animation Script (Like Tynker)
  const startGreenFlag = async () => {
    setIsPlaying(true)
    setCurrentScript("Dino Walk to Home")
    console.log("🏁 Green Flag Clicked!")

    // Switch to walking costume
    switchCostume("dino", 1) // dino_walk1
    console.log("🎭 Switched to walking costume")

    // Make cave glow
    switchCostume("cave", 1) // cave_glowing

    // Start pterodactyl flying
    startPterodactylAnimation()

    // Dino walking animation
    let walkCycle = 1
    const walkInterval = setInterval(async () => {
      if (!isPlaying) {
        clearInterval(walkInterval)
        return
      }

      // Check if touching cave
      if (isTouching("dino", "cave")) {
        clearInterval(walkInterval)

        // Celebration!
        console.log("🏠 Dino reached home!")
        switchCostume("dino", 5) // happy
        switchCostume("cave", 2) // welcome
        setCurrentScript("🎉 Celebration!")

        // Bounce animation
        for (let i = 0; i < 5; i++) {
          setDino((prev) => ({ ...prev, size: 1.2 }))
          await wait(0.1)
          setDino((prev) => ({ ...prev, size: 1.0 }))
          await wait(0.1)
        }

        setCurrentScript("Animation Complete!")
        return
      }

      // Move 10 steps
      moveSteps("dino", 10)

      // Switch costume for walking animation
      walkCycle = walkCycle === 1 ? 2 : 1
      switchCostume("dino", walkCycle)

      console.log(`🚶 Dino walking... Position: ${dino.x}`)
    }, 300) // Every 0.3 seconds
  }

  const startPterodactylAnimation = () => {
    const flyLoop = async () => {
      if (!isPlaying) return

      // Fly across screen
      glideTo("pterodactyl", 700, 150, 3)
      await wait(3)

      if (!isPlaying) return
      nextCostume("pterodactyl")

      // Fly back
      glideTo("pterodactyl", 100, 100, 3)
      await wait(3)

      if (!isPlaying) return
      nextCostume("pterodactyl")

      // Repeat
      setTimeout(flyLoop, 100)
    }

    flyLoop()
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentScript("")

    // Reset all sprites
    setDino({
      id: "dino",
      name: "Friendly Dino",
      x: 120,
      y: 350,
      size: 1,
      visible: true,
      currentCostume: 0,
      costumes: ["🦕", "🚶‍♂️🦕", "🏃‍♂️🦕", "🦘🦕", "🔥🦕", "😊🦕"],
      isMoving: false,
    })

    setCave((prev) => ({ ...prev, currentCostume: 0 }))
    setPterodactyl((prev) => ({ ...prev, x: 100, y: 100, currentCostume: 0 }))
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-800 to-blue-900 relative">
      <div className="p-4 bg-gradient-to-r from-purple-700 to-blue-700 border-b-4 border-yellow-400">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">🎭 Tynker-Style Sprite Animation</h1>
          <div className="flex gap-3">
            <Button
              onClick={startGreenFlag}
              disabled={isPlaying}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Flag className="w-4 h-4 mr-2" />🏁 Green Flag
            </Button>
            <Button onClick={resetAnimation} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-4 border-yellow-400 rounded-lg shadow-2xl"
            style={{ display: "block" }}
          />

          {/* Animation status */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
            <div className="text-sm font-bold">
              {!isPlaying && "Ready to start animation"}
              {isPlaying && `🎬 Running: ${currentScript}`}
            </div>
          </div>
        </div>
      </div>

      {/* Tynker-Style Code Display */}
      <div className="p-4 bg-gradient-to-r from-yellow-200 to-orange-300 border-t-4 border-yellow-400">
        <Card className="p-4 bg-white/90">
          <h3 className="font-bold text-purple-800 mb-2">🎯 Tynker-Style Animation Code:</h3>
          <div className="bg-green-100 p-3 rounded border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800">🦕 Dino Script:</h4>
            <div className="font-mono text-xs mt-2 space-y-1">
              <div>🏁 When green flag clicked</div>
              <div>🎭 Switch costume to "dino_walk1"</div>
              <div>🔄 Repeat until touching "Cave"</div>
              <div className="ml-4">📍 Move 10 steps</div>
              <div className="ml-4">🎭 Switch to next costume</div>
              <div className="ml-4">⏱️ Wait 0.3 seconds</div>
              <div>💬 Say "I'm home!" for 2 seconds</div>
              <div>🎉 Play celebration animation</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
