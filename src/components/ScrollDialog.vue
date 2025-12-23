<template>
  <Teleport to="body">
    <Transition name="scroll-dialog">
      <div v-if="visible" class="scroll-dialog-overlay" @click.self="handleClose">
        <div class="scroll-dialog">
          <!-- 卷轴上端轴心 -->
          <div class="scroll-rod scroll-rod-top">
            <div class="rod-end rod-end-left"></div>
            <div class="rod-body"></div>
            <div class="rod-end rod-end-right"></div>
          </div>

          <!-- 卷轴内容区 -->
          <div class="scroll-body">
            <!-- 关闭按钮 -->
            <button class="scroll-close-btn" @click="handleClose">
              <el-icon><Close /></el-icon>
            </button>

            <!-- 卷轴纸张 -->
            <div class="scroll-paper">
              <!-- 竹叶装饰 -->
              <div class="bamboo-decor bamboo-decor-left"></div>
              <div class="bamboo-decor bamboo-decor-right"></div>

              <!-- 内容插槽 -->
              <div class="scroll-content">
                <slot></slot>
              </div>

              <!-- 印章装饰 -->
              <div class="seal-stamp">
                <svg viewBox="0 0 60 60" class="seal-svg">
                  <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
                  <text x="30" y="35" font-family="serif" font-size="18" fill="currentColor" text-anchor="middle">诗</text>
                </svg>
              </div>
            </div>
          </div>

          <!-- 卷轴下端轴心 -->
          <div class="scroll-rod scroll-rod-bottom">
            <div class="rod-end rod-end-left"></div>
            <div class="rod-body"></div>
            <div class="rod-end rod-end-right"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped lang="scss">
// ==================== 卷轴弹窗遮罩 ====================
.scroll-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 40px;
}

// ==================== 卷轴主体 ====================
.scroll-dialog {
  display: flex;
  flex-direction: column;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  animation: scrollUnfold 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform-origin: center;
}

// ==================== 卷轴轴心 ====================
.scroll-rod {
  display: flex;
  align-items: center;
  height: 24px;
  position: relative;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));

  .rod-body {
    flex: 1;
    height: 16px;
    background: linear-gradient(
      to bottom,
      #5D4037 0%,
      #8D6E63 20%,
      #6D4C41 50%,
      #4E342E 80%,
      #3E2723 100%
    );
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);
    position: relative;

    // 木纹纹理
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        90deg,
        transparent 0px,
        rgba(255, 255, 255, 0.03) 1px,
        transparent 2px,
        transparent 8px
      );
    }
  }

  .rod-end {
    width: 28px;
    height: 24px;
    background: linear-gradient(
      to bottom,
      #6D4C41 0%,
      #5D4037 30%,
      #4E342E 70%,
      #3E2723 100%
    );
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    position: relative;

    // 金属装饰圈
    &::before {
      content: '';
      position: absolute;
      top: 4px;
      bottom: 4px;
      width: 4px;
      background: linear-gradient(
        to bottom,
        #B8860B 0%,
        #DAA520 50%,
        #B8860B 100%
      );
      border-radius: 2px;
    }

    &.rod-end-left::before {
      right: 4px;
    }

    &.rod-end-right::before {
      left: 4px;
    }
  }

  &.scroll-rod-top {
    margin-bottom: -4px;
  }

  &.scroll-rod-bottom {
    margin-top: -4px;
  }
}

// ==================== 卷轴内容区 ====================
.scroll-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.scroll-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(4, 120, 87, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #047857;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #047857;
    color: #fff;
    transform: rotate(90deg);
  }
}

// ==================== 卷轴纸张 ====================
.scroll-paper {
  position: relative;
  background: linear-gradient(
    135deg,
    #F8F6F0 0%,
    #F5F3ED 25%,
    #F2EDE3 50%,
    #EFE9DD 75%,
    #EBE5D8 100%
  );
  border-left: 4px solid #047857;
  border-right: 4px solid #047857;
  padding: 32px 40px;
  min-height: 400px;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
  box-shadow: 
    inset 0 0 60px rgba(139, 119, 101, 0.1),
    inset 0 0 20px rgba(139, 119, 101, 0.05);

  // 宣纸纹理
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(4, 120, 87, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(4, 120, 87, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(4, 120, 87, 0.3);
    }
  }
}

// ==================== 竹叶装饰 ====================
.bamboo-decor {
  position: absolute;
  width: 60px;
  height: 120px;
  opacity: 0.06;
  pointer-events: none;
  z-index: 1;

  &.bamboo-decor-left {
    top: 20px;
    left: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 120'%3E%3Cpath d='M30 0 Q35 30 25 60 Q35 90 30 120' stroke='%23047857' stroke-width='3' fill='none'/%3E%3Cpath d='M25 20 L10 15 Q5 14 10 12 L25 18' fill='%23047857'/%3E%3Cpath d='M28 50 L45 45 Q50 44 45 42 L28 48' fill='%23047857'/%3E%3Cpath d='M26 85 L12 80 Q7 79 12 77 L26 83' fill='%23047857'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
  }

  &.bamboo-decor-right {
    bottom: 20px;
    right: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 120'%3E%3Cpath d='M30 0 Q25 30 35 60 Q25 90 30 120' stroke='%23047857' stroke-width='3' fill='none'/%3E%3Cpath d='M35 30 L50 25 Q55 24 50 22 L35 28' fill='%23047857'/%3E%3Cpath d='M32 65 L15 60 Q10 59 15 57 L32 63' fill='%23047857'/%3E%3Cpath d='M34 95 L48 90 Q53 89 48 87 L34 93' fill='%23047857'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
    transform: rotate(180deg);
  }
}

// ==================== 印章装饰 ====================
.seal-stamp {
  position: absolute;
  bottom: 40px;
  right: 50px;
  width: 50px;
  height: 50px;
  color: #9F1239;
  opacity: 0.7;
  transform: rotate(-15deg);
  z-index: 2;
  filter: drop-shadow(1px 1px 2px rgba(159, 18, 57, 0.2));
}

// ==================== 内容区 ====================
.scroll-content {
  position: relative;
  z-index: 5;
}

// ==================== 卷轴展开动画 ====================
@keyframes scrollUnfold {
  0% {
    transform: scaleY(0) rotateX(90deg);
    opacity: 0;
  }
  40% {
    transform: scaleY(0.3) rotateX(60deg);
    opacity: 0.5;
  }
  70% {
    transform: scaleY(0.7) rotateX(20deg);
    opacity: 0.8;
  }
  100% {
    transform: scaleY(1) rotateX(0deg);
    opacity: 1;
  }
}

// ==================== 过渡动画 ====================
.scroll-dialog-enter-active {
  animation: scrollUnfold 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.scroll-dialog-leave-active {
  animation: scrollUnfold 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards;
}

// ==================== 响应式 ====================
@media (max-width: 768px) {
  .scroll-dialog-overlay {
    padding: 20px;
  }

  .scroll-paper {
    padding: 24px 20px;
  }

  .bamboo-decor {
    display: none;
  }

  .seal-stamp {
    width: 40px;
    height: 40px;
    bottom: 20px;
    right: 30px;
  }
}
</style>
