<template>
  <Teleport to="body">
    <Transition name="scroll-dialog">
      <div v-if="visible" class="scroll-dialog-overlay" @click.self="handleOverlayClick">
        <div class="scroll-dialog-container" :style="{ '--target-width': width }">
          <!-- 卷轴左侧轴心 -->
          <div class="scroll-rod scroll-rod-left">
            <div class="rod-finial rod-finial-top"></div>
            <div class="rod-body"></div>
            <div class="rod-finial rod-finial-bottom"></div>
          </div>

          <!-- 卷轴内容区 -->
          <div class="scroll-content">
            <!-- 背景花纹装饰 (参考图片) -->
            <div class="floral-bg">
              <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="flower-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="#E6CBA8" opacity="0.4"/>
                    <circle cx="30" cy="25" r="1.5" fill="#E6CBA8" opacity="0.3"/>
                    <circle cx="25" cy="15" r="1.5" fill="#E6CBA8" opacity="0.3"/>
                    <circle cx="70" cy="60" r="2.5" fill="#E6CBA8" opacity="0.3"/>
                    <circle cx="80" cy="50" r="1.5" fill="#E6CBA8" opacity="0.2"/>
                  </pattern>
                  <radialGradient id="warm-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#FFFDF5" stop-opacity="1" />
                    <stop offset="100%" stop-color="#F5F0E6" stop-opacity="1" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#warm-glow)" />
                <rect width="100%" height="100%" fill="url(#flower-pattern)" />
                
                <!-- 左下角大花枝装饰 -->
                <g transform="translate(0, 300) scale(0.8)" opacity="0.15" fill="#8B5E3C">
                   <path d="M0,100 Q50,50 100,80 T200,60" stroke="#8B5E3C" stroke-width="2" fill="none"/>
                   <circle cx="50" cy="50" r="5" />
                   <circle cx="60" cy="40" r="4" />
                   <circle cx="40" cy="60" r="4" />
                   <circle cx="100" cy="80" r="6" />
                   <circle cx="110" cy="70" r="4" />
                   <circle cx="180" cy="60" r="5" />
                </g>
                <!-- 右上角花枝装饰 -->
                <g transform="translate(300, 0) scale(0.8) rotate(180)" opacity="0.15" fill="#8B5E3C">
                   <path d="M0,100 Q50,50 100,80 T200,60" stroke="#8B5E3C" stroke-width="2" fill="none"/>
                   <circle cx="50" cy="50" r="5" />
                   <circle cx="100" cy="80" r="6" />
                </g>
              </svg>
            </div>

            <!-- 印章装饰 -->
            <div class="seal-decoration">
              <span class="seal-text">诗</span>
            </div>

            <!-- 关闭按钮 -->
            <button class="close-button" @click="handleClose" title="关闭">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            
            <!-- 插槽：放置实际内容 -->
            <div class="scroll-inner-content">
              <slot></slot>
            </div>
          </div>

          <!-- 卷轴右侧轴心 -->
          <div class="scroll-rod scroll-rod-right">
            <div class="rod-finial rod-finial-top"></div>
            <div class="rod-body"></div>
            <div class="rod-finial rod-finial-bottom"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: boolean
  width?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '900px',
  closeOnClickModal: true,
  closeOnPressEscape: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape && visible.value) {
    handleClose()
  }
}

// 锁定背景滚动
watch(visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
// ==================== 卷轴弹窗遮罩层 ====================
.scroll-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: rgba(20, 20, 20, 0.7); // 加深背景，突出卷轴
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

// ==================== 卷轴弹窗容器 ====================
.scroll-dialog-container {
  position: relative;
  height: 85vh; // 固定高度
  display: flex;
  flex-direction: row; // 水平布局
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  
  // 初始状态由动画控制
  width: var(--target-width);
}

// ==================== 卷轴轴心 (垂直) ====================
.scroll-rod {
  width: 42px; // 轴的宽度
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  
  // 木质底色 - 垂直纹理
  background: linear-gradient(
    90deg,
    #2c1810 0%,
    #5d4037 20%,
    #8d6e63 45%,
    #5d4037 55%,
    #3e2723 80%,
    #1a100c 100%
  );
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  
  .rod-body {
    flex: 1;
    width: 100%;
  }
  
  // 轴头 (Finial)
  .rod-finial {
    width: 54px; // 比轴身宽
    height: 36px;
    background: radial-gradient(
      circle at 30% 30%,
      #f4e1c1 0%,
      #d4af37 50%,
      #8c7328 100%
    );
    border-radius: 4px;
    box-shadow: 
      inset 0 2px 4px rgba(255, 255, 255, 0.6),
      0 4px 8px rgba(0, 0, 0, 0.4);
    position: relative;
    z-index: 11;
    
    // 装饰凹槽
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 4px;
      background: rgba(0,0,0,0.3);
      border-radius: 2px;
    }
  }
  
  .rod-finial-top {
    margin-bottom: -10px; // 稍微重叠
    border-radius: 6px 6px 12px 12px;
  }
  
  .rod-finial-bottom {
    margin-top: -10px;
    border-radius: 12px 12px 6px 6px;
  }
}

.scroll-rod-left {
  margin-right: -1px; // 防止缝隙
}

.scroll-rod-right {
  margin-left: -1px;
}

// ==================== 卷轴内容区 ====================
.scroll-content {
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #FEFDF5; // 暖白/米黄底色
  
  // 左右内阴影，模拟纸张卷曲感
  box-shadow: 
    inset 15px 0 20px -10px rgba(0,0,0,0.15),
    inset -15px 0 20px -10px rgba(0,0,0,0.15);
}

// ==================== 背景花纹 ====================
.floral-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.8;
}

// ==================== 印章装饰 ====================
.seal-decoration {
  position: absolute;
  top: 40px;
  right: 40px;
  width: 56px;
  height: 56px;
  border: 3px solid #8B1A1A; // 深红
  border-radius: 8px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-5deg);
  z-index: 1;
  mix-blend-mode: multiply; // 正片叠底效果更像印泥
  
  .seal-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 28px;
    font-weight: bold;
    color: #8B1A1A;
  }
}

// ==================== 关闭按钮 ====================
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8d6e63;
  transition: all 0.25s ease;
  z-index: 20;
  
  &:hover {
    color: #3e2723;
    transform: rotate(90deg);
    background: rgba(0,0,0,0.05);
    border-radius: 50%;
  }
}

// ==================== 内容滚动区 ====================
.scroll-inner-content {
  position: relative;
  z-index: 2;
  padding: 40px 60px;
  height: 100%;
  overflow-y: auto;
  
  // 滚动条样式优化
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(141, 110, 99, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(141, 110, 99, 0.5);
    }
  }
}

// ==================== 动画定义 ====================

// 1. 遮罩淡入
.scroll-dialog-enter-active {
  animation: overlayFadeIn 0.8s ease-out;
  
  .scroll-dialog-container {
    animation: horizontalUnroll 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
  
  .scroll-content {
    // 内容淡入稍微延迟，避免一开始看到被压缩的内容
    animation: contentFadeIn 0.8s ease-out;
  }
}

.scroll-dialog-leave-active {
  animation: overlayFadeOut 0.5s ease-in;
  
  .scroll-dialog-container {
    animation: horizontalRoll 0.5s cubic-bezier(0.5, 0, 0.75, 0) forwards;
  }
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes overlayFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

// 核心：水平展开动画
@keyframes horizontalUnroll {
  0% {
    width: 100px; // 初始宽度 = 两个轴的宽度 + 一点点缝隙
  }
  100% {
    width: var(--target-width);
  }
}

@keyframes horizontalRoll {
  0% {
    width: var(--target-width);
  }
  100% {
    width: 100px;
  }
}

@keyframes contentFadeIn {
  0% { opacity: 0; }
  30% { opacity: 0; }
  100% { opacity: 1; }
}

// ==================== 响应式适配 ====================
@media (max-width: 768px) {
  .scroll-dialog-container {
    height: 80vh;
    width: 95vw !important; // 移动端强制宽度
    --target-width: 95vw;
  }
  
  .scroll-rod {
    width: 24px;
    
    .rod-finial {
      width: 30px;
      height: 24px;
    }
  }
  
  .scroll-inner-content {
    padding: 24px 20px;
  }
  
  .seal-decoration {
    width: 40px;
    height: 40px;
    top: 20px;
    right: 40px;
    
    .seal-text {
      font-size: 20px;
    }
  }
}
</style>
