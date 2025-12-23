<template>
  <div class="bamboo-background">
    <!-- 静态竹影 SVG -->
    <div class="bamboo-shadows">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
        <!-- 左侧竹影 (加深) -->
        <g opacity="0.1" filter="url(#blur-shadow)" fill="#022C22">
          <path d="M100,0 Q120,300 80,600 T100,1200" stroke="#022C22" stroke-width="20" fill="none"/>
          <path d="M100,200 L180,150 Q200,140 180,130 L100,180" />
          <path d="M90,400 L20,350 Q0,340 20,330 L90,380" />
          <path d="M95,700 L190,650 Q210,640 190,630 L95,680" />
        </g>
        <!-- 右侧竹影 (加深) -->
        <g opacity="0.08" filter="url(#blur-shadow)" fill="#022C22" transform="translate(1000, 0) scale(0.8)">
           <path d="M200,0 Q220,300 180,600 T200,1200" stroke="#022C22" stroke-width="15" fill="none"/>
           <path d="M200,300 L280,250 Q300,240 280,230 L200,280" />
           <path d="M190,500 L110,450 Q90,440 110,430 L190,480" />
        </g>
      </svg>
    </div>

    <!-- 动态落叶 Canvas -->
    <canvas ref="canvasRef" class="falling-leaves"></canvas>

    <!-- 水墨水印 -->
    <div class="watermark">
      <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="watermark-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>
        <!-- 远山 -->
        <path d="M0,200 Q80,120 160,160 T320,140 T400,200 Z" fill="#374151" opacity="0.05" filter="url(#watermark-blur)" />
        <!-- 近山 -->
        <path d="M120,200 Q200,100 280,140 T400,120 V200 Z" fill="#374151" opacity="0.03" filter="url(#watermark-blur)" />
        <!-- 兰草暗示 -->
        <path d="M350,200 Q360,150 340,120" stroke="#374151" stroke-width="2" fill="none" opacity="0.04" filter="url(#watermark-blur)" />
        <path d="M350,200 Q380,160 390,130" stroke="#374151" stroke-width="1.5" fill="none" opacity="0.04" filter="url(#watermark-blur)" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number

interface Leaf {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
}

const leaves: Leaf[] = []
const MAX_LEAVES = 15 // 稀疏，不抢眼

const createLeaf = (width: number, height: number): Leaf => {
  return {
    x: Math.random() * width,
    y: -20,
    size: Math.random() * 10 + 10, // 10-20px
    speedX: Math.random() * 1 - 0.5, // -0.5 to 0.5
    speedY: Math.random() * 0.5 + 0.2, // 0.2 to 0.7 (slow)
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 1 - 0.5,
    opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
    color: `rgba(4, 120, 87, ${Math.random() * 0.3 + 0.1})` // Deep Bamboo Green (Emerald 700)
  }
}

const drawLeaf = (ctx: CanvasRenderingContext2D, leaf: Leaf) => {
  ctx.save()
  ctx.translate(leaf.x, leaf.y)
  ctx.rotate((leaf.rotation * Math.PI) / 180)
  ctx.globalAlpha = leaf.opacity
  ctx.fillStyle = leaf.color
  
  // Draw a simple bamboo leaf shape
  ctx.beginPath()
  ctx.moveTo(0, -leaf.size / 2)
  ctx.quadraticCurveTo(leaf.size / 3, 0, 0, leaf.size / 2)
  ctx.quadraticCurveTo(-leaf.size / 3, 0, 0, -leaf.size / 2)
  ctx.fill()
  
  ctx.restore()
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Update and draw leaves
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i]
    leaf.y += leaf.speedY
    leaf.x += leaf.speedX + Math.sin(leaf.y / 100) * 0.2 // Slight sway
    leaf.rotation += leaf.rotationSpeed

    drawLeaf(ctx, leaf)

    // Reset if out of bounds
    if (leaf.y > canvas.height + 20) {
      leaves[i] = createLeaf(canvas.width, canvas.height)
      leaves[i].y = -20 // Start from top
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
}

onMounted(() => {
  if (canvasRef.value) {
    handleResize()
    window.addEventListener('resize', handleResize)

    // Initialize leaves
    for (let i = 0; i < MAX_LEAVES; i++) {
      const leaf = createLeaf(canvasRef.value.width, canvasRef.value.height)
      leaf.y = Math.random() * canvasRef.value.height // Distribute initially
      leaves.push(leaf)
    }

    animate()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.bamboo-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bamboo-shadows {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.falling-leaves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.watermark {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 400px;
  height: 200px;
  z-index: 0;
  pointer-events: none;
}</style>
