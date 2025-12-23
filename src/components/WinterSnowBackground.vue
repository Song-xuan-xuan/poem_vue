<template>
  <div class="winter-snow-background">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  layer: 'foreground' | 'midground' | 'background';
  angle: number;
  spin: number;
}

const snowflakes: Snowflake[] = [];
const SNOWFLAKE_COUNT = 150;

const createSnowflake = (width: number, height: number): Snowflake => {
  const layerRandom = Math.random();
  let layer: 'foreground' | 'midground' | 'background';
  let radius, speedY, opacity;

  if (layerRandom < 0.2) {
    // Foreground (20%)
    layer = 'foreground';
    radius = Math.random() * 3 + 2;
    speedY = Math.random() * 1.5 + 1.5;
    opacity = Math.random() * 0.3 + 0.7;
  } else if (layerRandom < 0.6) {
    // Midground (40%)
    layer = 'midground';
    radius = Math.random() * 2 + 1;
    speedY = Math.random() * 1 + 0.5;
    opacity = Math.random() * 0.3 + 0.4;
  } else {
    // Background (40%)
    layer = 'background';
    radius = Math.random() * 1.5 + 0.5;
    speedY = Math.random() * 0.5 + 0.2;
    opacity = Math.random() * 0.2 + 0.1;
  }

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius,
    speedY,
    speedX: (Math.random() - 0.5) * 0.5,
    opacity,
    layer,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.02,
  };
};

const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
};

const init = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  // Initialize snowflakes
  for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
    snowflakes.push(createSnowflake(canvas.width, canvas.height));
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snowflakes.forEach((flake) => {
      // Update position
      flake.y += flake.speedY;
      flake.x += flake.speedX + Math.sin(flake.y * 0.01) * 0.5; // Wind effect
      flake.angle += flake.spin;

      // Reset if out of bounds
      if (flake.y > canvas.height) {
        flake.y = -10;
        flake.x = Math.random() * canvas.width;
      }
      if (flake.x > canvas.width) {
        flake.x = 0;
      } else if (flake.x < 0) {
        flake.x = canvas.width;
      }

      // Draw
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.save();
      ctx.translate(flake.x, flake.y);
      ctx.rotate(flake.angle);
      drawHexagon(ctx, 0, 0, flake.radius);
      ctx.restore();
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();
};

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', () => {});
});
</script>

<style scoped>
.winter-snow-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allow clicks to pass through */
  z-index: 1; /* Layer 1 - Background Snow */
}
</style>
