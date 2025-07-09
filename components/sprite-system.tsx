"use client"

// Sprite System - Like Tynker
interface Costume {
  name: string
  image: string // We'll use emoji/text for now, but could be actual images
  width: number
  height: number
}

interface Sprite {
  id: string
  name: string
  x: number
  y: number
  direction: number // 0-360 degrees
  size: number // scale factor
  visible: boolean
  currentCostume: number
  costumes: Costume[]
  isAnimating: boolean
  animationSpeed: number
}

interface AnimationEvent {
  type: "green_flag" | "message" | "touching" | "key_pressed"
  data?: any
}

export class SpriteAnimationSystem {
  private sprites: Map<string, Sprite> = new Map()
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationFrame = 0
  private events: AnimationEvent[] = []
  private messages: string[] = []
  private isRunning = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.setupSprites()
  }

  // 🦕 Setup all sprites with their costumes
  setupSprites() {
    // Dino Sprite with walking costumes
    this.addSprite({
      id: "dino",
      name: "Friendly Dino",
      x: 120,
      y: 350,
      direction: 90, // facing right
      size: 1,
      visible: true,
      currentCostume: 0,
      costumes: [
        { name: "dino_idle", image: "🦕", width: 60, height: 60 },
        { name: "dino_walk1", image: "🚶‍♂️🦕", width: 60, height: 60 },
        { name: "dino_walk2", image: "🏃‍♂️🦕", width: 60, height: 60 },
        { name: "dino_jump", image: "🦘🦕", width: 60, height: 60 },
        { name: "dino_fire", image: "🔥🦕", width: 60, height: 60 },
        { name: "dino_happy", image: "😊🦕", width: 60, height: 60 },
      ],
      isAnimating: false,
      animationSpeed: 0.2,
    })

    // Cave Home Sprite
    this.addSprite({
      id: "cave",
      name: "Dino Home",
      x: 700,
      y: 320,
      direction: 0,
      size: 1.5,
      visible: true,
      currentCostume: 0,
      costumes: [
        { name: "cave_normal", image: "🏠", width: 80, height: 80 },
        { name: "cave_glowing", image: "✨🏠✨", width: 80, height: 80 },
        { name: "cave_welcome", image: "🎉🏠🎉", width: 80, height: 80 },
      ],
      isAnimating: false,
      animationSpeed: 0.5,
    })

    // Background Elements
    this.addSprite({
      id: "background",
      name: "Prehistoric World",
      x: 400,
      y: 300,
      direction: 0,
      size: 1,
      visible: true,
      currentCostume: 0,
      costumes: [
        { name: "jungle_day", image: "🌋🌿🌳", width: 800, height: 600 },
        { name: "jungle_sunset", image: "🌅🌿🌳", width: 800, height: 600 },
      ],
      isAnimating: false,
      animationSpeed: 1,
    })

    // Flying Pterodactyl
    this.addSprite({
      id: "pterodactyl",
      name: "Flying Friend",
      x: 100,
      y: 100,
      direction: 90,
      size: 0.8,
      visible: true,
      currentCostume: 0,
      costumes: [
        { name: "fly1", image: "🦅", width: 40, height: 40 },
        { name: "fly2", image: "🕊️", width: 40, height: 40 },
      ],
      isAnimating: false,
      animationSpeed: 0.3,
    })
  }

  addSprite(sprite: Sprite) {
    this.sprites.set(sprite.id, sprite)
  }

  getSprite(id: string): Sprite | undefined {
    return this.sprites.get(id)
  }

  // 🎬 Animation Blocks (Like Tynker)

  // Motion Blocks
  moveSteps(spriteId: string, steps: number) {
    const sprite = this.getSprite(spriteId)
    if (!sprite) return

    const radians = (sprite.direction * Math.PI) / 180
    sprite.x += Math.cos(radians) * steps
    sprite.y += Math.sin(radians) * steps
  }

  glideTo(spriteId: string, x: number, y: number, duration: number) {
    const sprite = this.getSprite(spriteId)
    if (!sprite) return

    const startX = sprite.x
    const startY = sprite.y
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      sprite.x = startX + (x - startX) * progress
      sprite.y = startY + (y - startY) * progress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  changeX(spriteId: string, deltaX: number) {
    const sprite = this.getSprite(spriteId)
    if (sprite) sprite.x += deltaX
  }

  changeY(spriteId: string, deltaY: number) {
    const sprite = this.getSprite(spriteId)
    if (sprite) sprite.y += deltaY
  }

  pointInDirection(spriteId: string, direction: number) {
    const sprite = this.getSprite(spriteId)
    if (sprite) sprite.direction = direction
  }

  // Looks Blocks
  switchCostume(spriteId: string, costumeIndex: number) {
    const sprite = this.getSprite(spriteId)
    if (sprite && costumeIndex >= 0 && costumeIndex < sprite.costumes.length) {
      sprite.currentCostume = costumeIndex
    }
  }

  nextCostume(spriteId: string) {
    const sprite = this.getSprite(spriteId)
    if (sprite) {
      sprite.currentCostume = (sprite.currentCostume + 1) % sprite.costumes.length
    }
  }

  changeSizeBy(spriteId: string, delta: number) {
    const sprite = this.getSprite(spriteId)
    if (sprite) sprite.size += delta
  }

  show(spriteId: string) {
    const sprite = this.getSprite(spriteId)
    if (sprite) sprite.visible = true
  }

  hide(spriteId: string) {
    const sprite = this.getSprite(spriteId)
    if (sprite) sprite.visible = false
  }

  // Sound Blocks (placeholder)
  say(spriteId: string, message: string, duration: number) {
    console.log(`${spriteId} says: "${message}" for ${duration} seconds`)
    // Could implement speech bubbles here
  }

  // Event Blocks
  whenGreenFlagClicked(callback: () => void) {
    this.events.push({ type: "green_flag" })
    if (this.isRunning) callback()
  }

  whenIReceive(message: string, callback: () => void) {
    if (this.messages.includes(message)) {
      callback()
    }
  }

  broadcast(message: string) {
    this.messages.push(message)
  }

  whenTouching(spriteId1: string, spriteId2: string, callback: () => void) {
    if (this.isTouching(spriteId1, spriteId2)) {
      callback()
    }
  }

  // Control Blocks
  wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000)
    })
  }

  repeat(times: number, callback: () => void) {
    for (let i = 0; i < times; i++) {
      callback()
    }
  }

  forever(callback: () => void) {
    const loop = () => {
      if (this.isRunning) {
        callback()
        requestAnimationFrame(loop)
      }
    }
    loop()
  }

  repeatUntil(condition: () => boolean, callback: () => void) {
    const loop = () => {
      if (this.isRunning && !condition()) {
        callback()
        requestAnimationFrame(loop)
      }
    }
    loop()
  }

  // Sensing Blocks
  isTouching(spriteId1: string, spriteId2: string): boolean {
    const sprite1 = this.getSprite(spriteId1)
    const sprite2 = this.getSprite(spriteId2)

    if (!sprite1 || !sprite2) return false

    const distance = Math.sqrt(Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2))

    return distance < 60 // Simple collision detection
  }

  getX(spriteId: string): number {
    const sprite = this.getSprite(spriteId)
    return sprite ? sprite.x : 0
  }

  getY(spriteId: string): number {
    const sprite = this.getSprite(spriteId)
    return sprite ? sprite.y : 0
  }

  // 🎬 Render all sprites
  render() {
    if (!this.ctx || !this.canvas) return

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, "#FF6B35")
    gradient.addColorStop(0.5, "#FFD23F")
    gradient.addColorStop(1, "#8B4513")
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Render sprites in order (background first)
    const renderOrder = ["background", "pterodactyl", "cave", "dino"]

    renderOrder.forEach((spriteId) => {
      const sprite = this.getSprite(spriteId)
      if (sprite && sprite.visible) {
        this.renderSprite(sprite)
      }
    })

    this.animationFrame++
  }

  renderSprite(sprite: Sprite) {
    if (!this.ctx) return

    const costume = sprite.costumes[sprite.currentCostume]
    if (!costume) return

    this.ctx.save()

    // Transform for sprite
    this.ctx.translate(sprite.x, sprite.y)
    this.ctx.scale(sprite.size, sprite.size)
    this.ctx.rotate((sprite.direction * Math.PI) / 180)

    // Draw sprite (using emoji for now)
    this.ctx.font = `${costume.width}px Arial`
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    this.ctx.fillText(costume.image, 0, 0)

    this.ctx.restore()

    // Debug info
    if (sprite.id === "dino") {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      this.ctx.fillRect(sprite.x - 60, sprite.y - 80, 120, 20)
      this.ctx.fillStyle = "#00FF00"
      this.ctx.font = "12px Arial"
      this.ctx.textAlign = "center"
      this.ctx.fillText(`${costume.name} (${Math.round(sprite.x)}, ${Math.round(sprite.y)})`, sprite.x, sprite.y - 70)
    }
  }

  // 🚀 Start the animation system
  start() {
    this.isRunning = true
    this.messages = []
    this.greenFlag()
  }

  stop() {
    this.isRunning = false
  }

  // 🏁 Green Flag Event (starts everything)
  greenFlag() {
    console.log("🏁 Green Flag Clicked - Starting Animation!")
    this.broadcast("start_animation")
  }
}
