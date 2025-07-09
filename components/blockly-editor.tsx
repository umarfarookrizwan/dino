"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    Blockly: any
  }
}

interface BlocklyEditorProps {
  onCodeChange: (code: any[]) => void
  level: any
}

export default function BlocklyEditor({ onCodeChange, level }: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null)
  const workspace = useRef<any>(null)

  useEffect(() => {
    // Load Blockly from CDN
    if (!window.Blockly) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/blockly/blockly.min.js"
      script.onload = initializeBlockly
      script.onerror = () => {
        console.error("Failed to load Blockly, creating fallback interface")
        createFallbackInterface()
      }
      document.head.appendChild(script)
    } else {
      initializeBlockly()
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose()
      }
    }
  }, [])

  const createFallbackInterface = () => {
    if (!blocklyDiv.current) return

    // Create a simple fallback interface with buttons
    blocklyDiv.current.innerHTML = `
      <div style="padding: 20px; background: #f5f5f5; height: 100%; overflow-y: auto;">
        <h3 style="margin-bottom: 20px; color: #333;">Drag blocks to build your code:</h3>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #666; margin-bottom: 10px;">Movement Blocks:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
            <button class="block-btn" data-type="move_forward" style="background: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              🚀 Move Forward
            </button>
            <button class="block-btn" data-type="fly_up" style="background: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              ⬆️ Fly Up
            </button>
            <button class="block-btn" data-type="fly_down" style="background: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              ⬇️ Fly Down
            </button>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #666; margin-bottom: 10px;">Action Blocks:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
            <button class="block-btn" data-type="shoot_fire" style="background: #FF5722; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              🔥 Shoot Fire
            </button>
            <button class="block-btn" data-type="wait" style="background: #9C27B0; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              ⏱️ Wait 1s
            </button>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #666; margin-bottom: 10px;">Logic Blocks:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
            <button class="block-btn" data-type="repeat" style="background: #FF9800; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              🔄 Repeat 3x
            </button>
            <button class="block-btn" data-type="if_enemy_ahead" style="background: #795548; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">
              👹 If Enemy Ahead
            </button>
          </div>
        </div>

        <div style="border: 2px dashed #ccc; min-height: 200px; padding: 20px; background: white; border-radius: 5px;">
          <h4 style="color: #666; margin-bottom: 10px;">Your Code:</h4>
          <div id="code-sequence" style="min-height: 150px;">
            <p style="color: #999; font-style: italic;">Click blocks above to add them to your code sequence</p>
          </div>
          <div style="margin-top: 15px;">
            <button id="clear-code" style="background: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 3px; cursor: pointer; margin-right: 10px;">
              Clear All
            </button>
            <button id="test-code" style="background: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 3px; cursor: pointer;">
              Test Code
            </button>
          </div>
        </div>
      </div>
    `

    // Add event listeners for the fallback interface
    setupFallbackListeners()
  }

  const setupFallbackListeners = () => {
    let codeSequence: any[] = []

    const updateCodeDisplay = () => {
      const codeDiv = document.getElementById("code-sequence")
      if (!codeDiv) return

      if (codeSequence.length === 0) {
        codeDiv.innerHTML =
          '<p style="color: #999; font-style: italic;">Click blocks above to add them to your code sequence</p>'
      } else {
        codeDiv.innerHTML = codeSequence
          .map(
            (cmd, index) => `
          <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: #f0f0f0; border-radius: 3px;">
            <span style="margin-right: 10px; font-weight: bold;">${index + 1}.</span>
            <span style="flex: 1;">${getCommandDisplay(cmd)}</span>
            <button onclick="removeCommand(${index})" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">
              Remove
            </button>
          </div>
        `,
          )
          .join("")
      }

      // Update parent component
      onCodeChange(codeSequence)
    }

    const getCommandDisplay = (cmd: any) => {
      switch (cmd.type) {
        case "move_forward":
          return "🚀 Move Forward"
        case "fly_up":
          return "⬆️ Fly Up"
        case "fly_down":
          return "���️ Fly Down"
        case "shoot_fire":
          return "🔥 Shoot Fire"
        case "wait":
          return `⏱️ Wait ${cmd.duration / 1000}s`
        case "repeat":
          return `🔄 Repeat ${cmd.times} times`
        case "if_enemy_ahead":
          return "👹 If Enemy Ahead"
        default:
          return cmd.type
      }
    }

    // Make removeCommand globally available
    ;(window as any).removeCommand = (index: number) => {
      codeSequence.splice(index, 1)
      updateCodeDisplay()
    }

    // Add block button listeners
    const blockButtons = document.querySelectorAll(".block-btn")
    blockButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.getAttribute("data-type")
        const command: any = { type }

        // Add specific properties for certain commands
        switch (type) {
          case "wait":
            command.duration = 1000
            break
          case "repeat":
            command.times = 3
            command.commands = []
            break
          case "if_enemy_ahead":
            command.commands = []
            break
        }

        codeSequence.push(command)
        updateCodeDisplay()
        console.log("Added command:", command)
      })
    })

    // Clear button
    const clearButton = document.getElementById("clear-code")
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        codeSequence = []
        updateCodeDisplay()
      })
    }

    // Test button
    const testButton = document.getElementById("test-code")
    if (testButton) {
      testButton.addEventListener("click", () => {
        console.log("Testing code sequence:", codeSequence)
        onCodeChange([...codeSequence])
      })
    }

    updateCodeDisplay()
  }

  const initializeBlockly = () => {
    if (!window.Blockly || !blocklyDiv.current) return

    // Define custom blocks
    window.Blockly.Blocks["move_forward"] = {
      init: function () {
        this.appendDummyInput().appendField("🚀 move forward")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(120)
        this.setTooltip("Move Goofie forward")
      },
    }

    window.Blockly.Blocks["fly_up"] = {
      init: function () {
        this.appendDummyInput().appendField("⬆️ fly up")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(200)
        this.setTooltip("Make Goofie fly up")
      },
    }

    window.Blockly.Blocks["fly_down"] = {
      init: function () {
        this.appendDummyInput().appendField("⬇️ fly down")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(200)
        this.setTooltip("Make Goofie fly down")
      },
    }

    window.Blockly.Blocks["shoot_fire"] = {
      init: function () {
        this.appendDummyInput().appendField("🔥 shoot fire")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(0)
        this.setTooltip("Shoot a fireball")
      },
    }

    window.Blockly.Blocks["wait"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("⏱️ wait")
          .appendField(new window.Blockly.FieldNumber(1, 0.1, 5, 0.1), "SECONDS")
          .appendField("seconds")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(290)
        this.setTooltip("Wait for specified seconds")
      },
    }

    window.Blockly.Blocks["repeat"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🔄 repeat")
          .appendField(new window.Blockly.FieldNumber(3, 1, 10), "TIMES")
          .appendField("times")
        this.appendStatementInput("DO").setCheck(null).appendField("do")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(120)
        this.setTooltip("Repeat actions")
      },
    }

    window.Blockly.Blocks["if_enemy_ahead"] = {
      init: function () {
        this.appendDummyInput().appendField("👹 if enemy ahead")
        this.appendStatementInput("DO").setCheck(null).appendField("do")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(210)
        this.setTooltip("Check if enemy is ahead")
      },
    }

    // Create toolbox
    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Movement",
          colour: 120,
          contents: [
            { kind: "block", type: "move_forward" },
            { kind: "block", type: "fly_up" },
            { kind: "block", type: "fly_down" },
          ],
        },
        {
          kind: "category",
          name: "Actions",
          colour: 0,
          contents: [
            { kind: "block", type: "shoot_fire" },
            { kind: "block", type: "wait" },
          ],
        },
        {
          kind: "category",
          name: "Logic",
          colour: 210,
          contents: [
            { kind: "block", type: "repeat" },
            { kind: "block", type: "if_enemy_ahead" },
          ],
        },
      ],
    }

    // Initialize workspace
    workspace.current = window.Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: "#ccc",
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
    })

    // Listen for changes
    workspace.current.addChangeListener(() => {
      const code = blocklyToCode(workspace.current)
      console.log("Blockly code generated:", code)
      onCodeChange(code)
    })
  }

  const blocklyToCode = (workspace: any) => {
    const blocks = workspace.getTopBlocks(true)
    const commands: any[] = []

    const processBlock = (block: any) => {
      if (!block) return

      switch (block.type) {
        case "move_forward":
          commands.push({ type: "move_forward" })
          break
        case "fly_up":
          commands.push({ type: "fly_up" })
          break
        case "fly_down":
          commands.push({ type: "fly_down" })
          break
        case "shoot_fire":
          commands.push({ type: "shoot_fire" })
          break
        case "wait":
          const seconds = block.getFieldValue("SECONDS")
          commands.push({ type: "wait", duration: seconds * 1000 })
          break
        case "repeat":
          const times = block.getFieldValue("TIMES")
          const doBlock = block.getInputTargetBlock("DO")
          const repeatCommands: any[] = []
          let currentBlock = doBlock
          while (currentBlock) {
            const subCommands = blocklyToCode({ getTopBlocks: () => [currentBlock] })
            repeatCommands.push(...subCommands)
            currentBlock = currentBlock.getNextBlock()
          }
          commands.push({ type: "repeat", times, commands: repeatCommands })
          break
        case "if_enemy_ahead":
          const ifDoBlock = block.getInputTargetBlock("DO")
          const ifCommands: any[] = []
          let ifCurrentBlock = ifDoBlock
          while (ifCurrentBlock) {
            const subCommands = blocklyToCode({ getTopBlocks: () => [ifCurrentBlock] })
            ifCommands.push(...subCommands)
            ifCurrentBlock = ifCurrentBlock.getNextBlock()
          }
          commands.push({ type: "if_enemy_ahead", commands: ifCommands })
          break
      }

      const nextBlock = block.getNextBlock()
      if (nextBlock) {
        processBlock(nextBlock)
      }
    }

    blocks.forEach(processBlock)
    return commands
  }

  return (
    <div className="h-full">
      <div ref={blocklyDiv} className="h-full" />
    </div>
  )
}
