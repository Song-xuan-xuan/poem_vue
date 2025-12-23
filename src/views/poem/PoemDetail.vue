<template>
  <div class="poem-detail-page">
    <!-- 返回按钮 -->
    <el-button class="back-btn" :icon="ArrowLeft" @click="goBack">返回列表</el-button>

    <!-- 卷轴容器 (水平布局) -->
    <div class="scroll-container">
      <!-- 卷轴左侧轴心 -->
      <div class="scroll-rod scroll-rod-left">
        <div class="rod-finial rod-finial-top"></div>
        <div class="rod-body"></div>
        <div class="rod-finial rod-finial-bottom"></div>
      </div>

      <!-- 卷轴内容区 -->
      <div class="scroll-content">
        <!-- 背景花纹装饰 -->
        <div class="floral-bg">
          <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="flower-pattern-page" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#E6CBA8" opacity="0.4"/>
                <circle cx="30" cy="25" r="1.5" fill="#E6CBA8" opacity="0.3"/>
                <circle cx="25" cy="15" r="1.5" fill="#E6CBA8" opacity="0.3"/>
                <circle cx="70" cy="60" r="2.5" fill="#E6CBA8" opacity="0.3"/>
                <circle cx="80" cy="50" r="1.5" fill="#E6CBA8" opacity="0.2"/>
              </pattern>
              <radialGradient id="warm-glow-page" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FFFDF5" stop-opacity="1" />
                <stop offset="100%" stop-color="#F5F0E6" stop-opacity="1" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#warm-glow-page)" />
            <rect width="100%" height="100%" fill="url(#flower-pattern-page)" />
            
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

        <!-- 诗词详情内容 -->
        <div class="scroll-inner-content">
          <PoemDetailContent :poem-id="poemId" />
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import PoemDetailContent from '@/components/PoemDetailContent.vue'

const route = useRoute()
const router = useRouter()

const poemId = computed(() => {
  const id = route.params.id as string
  return id ? Number(id) : null
})

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.poem-detail-page {
  padding: 20px;
  max-width: 1200px; // 增加宽度以适应横向卷轴
  margin: 0 auto;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  .back-btn {
    margin-bottom: 20px;
    align-self: flex-start;
    font-family: 'Noto Serif SC', serif;
  }
}

// ==================== 卷轴容器 ====================
.scroll-container {
  flex: 1;
  display: flex;
  flex-direction: row; // 水平布局
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  min-height: 600px;
  
  // 页面加载时的展开动画
  animation: pageScrollUnroll 1s cubic-bezier(0.25, 1, 0.5, 1);
  transform-origin: center;
}

// ==================== 卷轴轴心 (垂直) ====================
.scroll-rod {
  width: 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  
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
  
  .rod-finial {
    width: 54px;
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
    margin-bottom: -10px;
    border-radius: 6px 6px 12px 12px;
  }
  
  .rod-finial-bottom {
    margin-top: -10px;
    border-radius: 12px 12px 6px 6px;
  }
}

.scroll-rod-left {
  margin-right: -1px;
}

.scroll-rod-right {
  margin-left: -1px;
}

// ==================== 卷轴内容区 ====================
.scroll-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #FEFDF5;
  
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
  border: 3px solid #8B1A1A;
  border-radius: 8px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-5deg);
  z-index: 1;
  mix-blend-mode: multiply;
  
  .seal-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 28px;
    font-weight: bold;
    color: #8B1A1A;
  }
}

// ==================== 内容滚动区 ====================
.scroll-inner-content {
  position: relative;
  z-index: 2;
  padding: 40px 60px;
  height: 100%;
  overflow-y: auto;
  
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

// ==================== 展开动画 ====================
@keyframes pageScrollUnroll {
  0% {
    clip-path: inset(0 50% 0 50%);
    opacity: 0;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

// ==================== 响应式适配 ====================
@media (max-width: 768px) {
  .poem-detail-page {
    padding: 12px;
  }
  
  .scroll-rod {
    width: 24px;
    
    .rod-finial {
      width: 30px;
      height: 24px;
    }
  }
  
  .scroll-inner-content {
    padding: 24px 16px;
  }
  
  .seal-decoration {
    width: 40px;
    height: 40px;
    top: 16px;
    right: 16px;
    
    .seal-text {
      font-size: 20px;
    }
  }
}
</style>
