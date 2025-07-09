"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Mountain } from "lucide-react"

interface LevelPanelProps {
  level: any
  onClose: () => void
}

export default function LevelPanel({ level, onClose }: LevelPanelProps) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full p-8 bg-gradient-to-br from-orange-100 to-yellow-200 border-4 border-orange-400">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <Mountain className="w-8 h-8 text-orange-600 mr-3 animate-bounce" />
            <h3 className="text-2xl font-bold text-orange-800">
              {level.icon} {level.title}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-orange-700 hover:text-orange-900">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-300">
            <h4 className="font-bold text-orange-800 mb-3 text-lg">🎯 Mission:</h4>
            <p className="text-orange-700 text-base">{level.description}</p>
          </div>

          <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
            <h4 className="font-bold text-orange-800 mb-3 text-lg">💡 Prehistoric Guide:</h4>
            <p className="text-orange-700 text-base">{level.hint}</p>
          </div>

          {level.blocks && (
            <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
              <h4 className="font-bold text-orange-800 mb-3 text-lg">🧩 Available Dino Blocks:</h4>
              <div className="flex flex-wrap gap-2">
                {level.blocks.map((block: string, index: number) => (
                  <span
                    key={index}
                    className="bg-orange-200 text-orange-800 text-sm px-3 py-1 rounded-full border-2 border-orange-400 font-medium"
                  >
                    {block}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
            <h4 className="font-bold text-orange-800 mb-2 text-lg">🦕 Prehistoric Tips:</h4>
            <ul className="text-orange-700 text-sm space-y-1">
              <li>• 🦕 Drag blocks to build the dinosaur's journey path</li>
              <li>• 🚀 Click "Start Journey" to begin the prehistoric adventure</li>
              <li>• 🏠 Help the dinosaur reach their cozy cave home</li>
              <li>• 🔥 Use fire blocks to defeat dangerous predators</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg py-3"
        >
          🌟 Start Prehistoric Adventure!
        </Button>
      </Card>
    </div>
  )
}
