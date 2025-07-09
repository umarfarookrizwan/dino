"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, Lightbulb, Volume2, VolumeX, Home, Mountain, Film, Sparkles } from "lucide-react"
import BlocklyEditor from "@/components/blockly-editor"
import GameCanvas from "@/components/game-canvas"
import LevelPanel from "@/components/level-panel"
import AnimatedDinoScene from "@/components/animated-dino-scene"
import TynkerStyleAnimation from "@/components/tynker-style-animation"
import { levels } from "@/data/levels"

export default function DinosaurGame() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameState, setGameState] = useState<"menu" | "playing" | "success" | "failure" | "animation" | "tynker">(
    "menu",
  )
  const [code, setCode] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [progress, setProgress] = useState<number[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(1)

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("dinosaur-progress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const handleRunCode = () => {
    if (code.length === 0) return
    setIsRunning(true)
    setGameState("playing")
  }

  const handleReset = () => {
    setIsRunning(false)
    setGameState("playing")
  }

  const handleLevelComplete = () => {
    setGameState("success")
    setIsRunning(false)

    // Update progress
    const newProgress = [...progress]
    if (!newProgress.includes(currentLevel)) {
      newProgress.push(currentLevel)
      setProgress(newProgress)
      localStorage.setItem("dinosaur-progress", JSON.stringify(newProgress))
    }
  }

  const handleGameFailed = () => {
    setGameState("failure")
    setIsRunning(false)
  }

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1)
      setGameState("playing")
      setCode([])
    }
  }

  const goToMenu = () => {
    setGameState("menu")
    setCurrentLevel(0)
    setCode([])
  }

  const showAnimation = () => {
    setGameState("animation")
  }

  const showTynkerAnimation = () => {
    setGameState("tynker")
  }

  // Tynker-Style Animation Scene
  if (gameState === "tynker") {
    return (
      <div className="h-screen flex flex-col">
        <TynkerStyleAnimation />
        <div className="p-4 bg-gradient-to-r from-purple-700 to-blue-700 border-t-4 border-yellow-400">
          <Button
            onClick={goToMenu}
            className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 border-yellow-500 font-bold"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Game Menu
          </Button>
        </div>
      </div>
    )
  }

  // Animation Scene
  if (gameState === "animation") {
    return (
      <div className="h-screen flex flex-col">
        <AnimatedDinoScene />
        <div className="p-4 bg-gradient-to-r from-orange-700 to-red-700 border-t-4 border-yellow-400">
          <Button
            onClick={goToMenu}
            className="bg-yellow-400 hover:bg-yellow-500 text-orange-800 border-yellow-500 font-bold"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Game Menu
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-600 via-yellow-500 to-green-400 relative overflow-hidden">
        {/* Prehistoric Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-10 left-10 text-6xl animate-bounce">🌋</div>
            <div className="absolute top-20 right-20 text-5xl animate-pulse">🦕</div>
            <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-300">🌿</div>
            <div className="absolute top-40 left-1/3 text-4xl animate-pulse delay-500">🦴</div>
            <div className="absolute bottom-40 right-1/3 text-5xl animate-bounce delay-700">🏔️</div>
            <div className="absolute top-60 right-10 text-3xl animate-spin">☄️</div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Mountain className="w-12 h-12 text-orange-300 mr-4 animate-bounce" />
              <h1 className="text-8xl font-bold text-orange-200 drop-shadow-2xl animate-pulse">
                🦕 Dino's Journey Home
              </h1>
              <Mountain className="w-12 h-12 text-orange-300 ml-4 animate-bounce" />
            </div>
            <p className="text-2xl text-yellow-100 mb-8 drop-shadow-lg">
              Help our friendly dinosaur navigate through the prehistoric world to reach home!
            </p>

            {/* Animation Buttons */}
            <div className="mb-8 flex gap-4 justify-center">
              <Button
                onClick={showTynkerAnimation}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-6 h-6 mr-3" />🎭 Tynker-Style Sprites
              </Button>
              <Button
                onClick={showAnimation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Film className="w-6 h-6 mr-3" />🎬 Smooth Animation
              </Button>
            </div>
            <p className="text-yellow-200 text-sm">
              🎭 Tynker-Style: Learn how sprites, costumes, and events work!
              <br />🎬 Smooth Animation: Watch realistic dinosaur movement!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl">
            {levels.map((level, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-1 ${
                  progress.includes(index)
                    ? "bg-gradient-to-br from-green-200 to-green-300 border-green-500 shadow-lg"
                    : index === 0 || progress.includes(index - 1)
                      ? "bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400 hover:bg-gradient-to-br hover:from-orange-200 hover:to-orange-300 shadow-md"
                      : "bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 opacity-60 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (index === 0 || progress.includes(index - 1)) {
                    setCurrentLevel(index)
                    setGameState("playing")
                  }
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 animate-bounce">{level.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-orange-800">Level {index + 1}</h3>
                  <p className="text-sm text-orange-700 font-medium">{level.title}</p>
                  {progress.includes(index) && (
                    <div className="text-green-600 text-sm mt-3 font-bold animate-pulse">🏆 Complete 🏆</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-orange-700 to-yellow-600">
      {/* Prehistoric Header */}
      <div className="bg-gradient-to-r from-orange-800 to-red-700 shadow-lg border-b-4 border-yellow-400 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToMenu}
            className="bg-yellow-400 hover:bg-yellow-500 text-orange-800 border-yellow-500 font-bold"
          >
            <Home className="w-4 h-4 mr-2" />🏠 Dino Home
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={showTynkerAnimation}
            className="bg-purple-500 hover:bg-purple-600 text-white border-purple-600 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />🎭 Sprites
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={showAnimation}
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-600 font-bold"
          >
            <Film className="w-4 h-4 mr-2" />🎬 Animation
          </Button>
          <div className="flex items-center">
            <Mountain className="w-8 h-8 text-yellow-300 mr-2 animate-bounce" />
            <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">🦕 Dino's Adventure</h1>
          </div>
          <span className="text-lg text-orange-100 bg-orange-900 px-3 py-1 rounded-full">
            🌋 Level {currentLevel + 1}: {levels[currentLevel]?.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-orange-900 px-3 py-1 rounded-full">
            <span className="text-sm text-orange-100">🚀 Speed:</span>
            <Button
              variant={animationSpeed === 0.5 ? "default" : "outline"}
              size="sm"
              onClick={() => setAnimationSpeed(0.5)}
              className="h-6 px-2 text-xs"
            >
              🐌 0.5x
            </Button>
            <Button
              variant={animationSpeed === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setAnimationSpeed(1)}
              className="h-6 px-2 text-xs"
            >
              🦕 1x
            </Button>
            <Button
              variant={animationSpeed === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => setAnimationSpeed(2)}
              className="h-6 px-2 text-xs"
            >
              🦖 2x
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className="bg-yellow-400 hover:bg-yellow-500 text-orange-800 border-yellow-500"
          >
            <Lightbulb className="w-4 h-4 mr-2" />💡 Hint
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-yellow-400 hover:bg-yellow-500 text-orange-800 border-yellow-500"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Blockly Editor */}
        <div className="w-1/2 border-r-4 border-yellow-400 bg-gradient-to-b from-orange-100 to-yellow-200">
          <div className="p-4 border-b-2 border-yellow-400 bg-gradient-to-r from-yellow-200 to-orange-300">
            <div className="flex gap-3">
              <Button
                onClick={handleRunCode}
                disabled={isRunning || code.length === 0}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg"
              >
                <Play className="w-4 h-4 mr-2" />🦕 Start Journey
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!isRunning}
                className="bg-red-500 hover:bg-red-600 text-white border-red-600 font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />🔄 Reset Path
              </Button>
              {gameState === "success" && currentLevel < levels.length - 1 && (
                <Button
                  onClick={nextLevel}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse"
                >
                  🌟 Next Adventure
                </Button>
              )}
            </div>
          </div>
          <BlocklyEditor onCodeChange={setCode} level={levels[currentLevel]} />
        </div>

        {/* Game Canvas */}
        <div className="w-1/2 flex flex-col bg-gradient-to-b from-orange-700 to-red-800">
          <GameCanvas
            level={levels[currentLevel]}
            code={code}
            isRunning={isRunning}
            soundEnabled={soundEnabled}
            animationSpeed={animationSpeed}
            onLevelComplete={handleLevelComplete}
            onGameFailed={handleGameFailed}
            gameState={gameState}
          />
        </div>
      </div>

      {/* Level Panel */}
      {showHint && <LevelPanel level={levels[currentLevel]} onClose={() => setShowHint(false)} />}
    </div>
  )
}
