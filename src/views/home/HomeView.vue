<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Reading, ChatDotRound, TrophyBase, Compass } from '@element-plus/icons-vue'
import DailyPoem from '@/components/DailyPoem.vue'

const router = useRouter()

const handleStartLearning = () => {
  router.push('/poem/market')
}

const handleGoToCommunity = () => {
  router.push('/forum')
}

const handleGoToAI = () => {
  router.push('/ai')
}

// 功能特色（使用新的配色 - 护眼模式）
const features = [
  {
    icon: Reading,
    title: '诗词集市',
    desc: '海量古诗词库，按朝代、作者、标签精准检索',
    color: '#047857'  // 深竹青 (Emerald 700)
  },
  {
    icon: ChatDotRound,
    title: '论坛社区',
    desc: '与诗友交流创作心得，分享诗词感悟',
    color: '#0F766E'  // 深青 (Teal 700)
  },
  {
    icon: Compass,
    title: 'AI 助手',
    desc: '智能对诗、诗词解析、创作辅助',
    color: '#B45309'  // 暗金 (Amber 700)
  },
  {
    icon: TrophyBase,
    title: '成长体系',
    desc: '经验值、等级、成就，见证你的诗词之路',
    color: '#9F1239'  // 茜素红 (Rose 800)
  }
]
</script>

<template>
  <div class="home-view">
    <!-- Hero 区：左侧文案 + 右侧每日一首 -->
    <section class="hero-section">
      <!-- 左侧：主标题与行动按钮 -->
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-text">传承中华诗词之美</span>
        </div>

        <h1 class="hero-title">
          诗词学习<br />
          <span class="title-highlight">与创作社区</span>
        </h1>

        <!-- 诗词名句装饰 -->
        <div class="poem-quote">
          <div class="quote-mark">"</div>
          <p class="quote-text">腹有诗书气自华</p>
          <div class="quote-author">—— 苏轼</div>
        </div>

        <p class="hero-subtitle">
          探索千年诗词文化，与志同道合的诗友共同成长<br />
          在这里，每一首诗都是一次心灵的对话
        </p>

        <div class="hero-actions">
          <button class="ink-btn ink-btn-primary" @click="handleStartLearning">
            <el-icon><Reading /></el-icon>
            <span>开始学习</span>
          </button>

          <button class="ink-btn ink-btn-ghost" @click="handleGoToCommunity">
            <el-icon><ChatDotRound /></el-icon>
            <span>社区交流</span>
          </button>
          
          <button class="ink-btn ink-btn-ghost" @click="handleGoToAI">
            <el-icon><Compass /></el-icon>
            <span>AI 助手</span>
          </button>
        </div>
      </div>

      <!-- 右侧：每日一首（融合式展示）-->
      <div class="hero-daily-poem">
        <div class="card-wrapper">
          <DailyPoem />
          <!-- 朱砂印章 -->
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// ==================== 首页容器 ====================
.home-view {
  width: 100%;
  max-width: $content-max-width;
  margin: 0 auto;
  overflow: hidden;
}

// ==================== Hero 区：左右布局 ====================
.hero-section {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: $spacing-3xl;
  align-items: center;
  // 说明：HomeView 在 MainLayout 的主内容区内渲染，主内容区存在上下 padding。
  // 这里额外减去 $spacing-xl * 2，避免出现“多出来一点点”的外层滚动条。
  min-height: calc(100vh - $navbar-height - $spacing-3xl * 2 - $spacing-xl * 2);
  padding: $spacing-3xl 0;

  // 平板响应式
  @media (max-width: $breakpoint-tablet) {
    grid-template-columns: 1fr;
    gap: $spacing-2xl;
    min-height: auto;
    padding: $spacing-2xl 0;
  }
}

// ==================== Hero 左侧：文案区 ====================
.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;

  // 徽章（竹青色 - 加深）
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: rgba(4, 120, 87, 0.1); // 深竹青淡色背景
    border: 1px solid rgba(4, 120, 87, 0.2);
    border-radius: $radius-round;
    width: fit-content;

    .badge-icon {
      font-size: $font-size-lg;
    }

    .badge-text {
      font-size: $font-size-sm;
      color: #047857; // Emerald 700
      font-weight: 600;
      font-family: $font-family-chinese;
    }
  }

  // 主标题
  .hero-title {
    font-size: $font-size-4xl;
    font-weight: 700;
    line-height: $line-height-tight;
    color: $color-ink-primary; // Slate 900
    font-family: $font-family-serif;
    margin: 0;
    letter-spacing: 0.05em;

    .title-highlight {
      color: #047857; // Emerald 700
      position: relative;

      // 竹影装饰
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 2px;
        width: 100%;
        height: 10px;
        background: rgba(4, 120, 87, 0.15);
        z-index: -1;
        transform: skewX(-15deg);
      }
    }

    @media (max-width: $breakpoint-mobile) {
      font-size: $font-size-3xl;
    }
  }

  // 诗词名句装饰
  .poem-quote {
    position: relative;
    padding: $spacing-lg $spacing-xl;
    background: #F0F2F0; // 灰白玉 (不透明)
    border-left: 4px solid #047857; // 深竹青
    border-radius: $radius-md;
    margin: $spacing-md 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); // 微弱阴影

    .quote-mark {
      position: absolute;
      top: -10px;
      left: 10px;
      font-size: 48px;
      color: #047857;
      opacity: 0.15;
      font-family: Georgia, serif;
      line-height: 1;
    }

    .quote-text {
      font-size: $font-size-xl;
      font-family: $font-family-serif;
      color: $color-ink-primary;
      margin: 0 0 $spacing-sm 0;
      letter-spacing: 3px;
      text-align: center;
      font-weight: 500;
    }

    .quote-author {
      font-size: $font-size-sm;
      color: $color-ink-secondary;
      text-align: right;
      font-family: $font-family-serif;
      font-style: italic;
    }

    @media (max-width: $breakpoint-mobile) {
      padding: $spacing-md $spacing-lg;

      .quote-text {
        font-size: $font-size-lg;
        letter-spacing: 2px;
      }
    }
  }

  // 副标题
  .hero-subtitle {
    font-size: $font-size-lg;
    line-height: $line-height-relaxed;
    color: $color-ink-gray;
    font-family: $font-family-chinese;
    margin: 0;

    @media (max-width: $breakpoint-mobile) {
      font-size: $font-size-base;
    }
  }

  // 行动按钮组
  .hero-actions {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;
    margin-top: $spacing-lg;
  }
}

// ==================== 行动按钮样式 (Enamel Style) ====================
.ink-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 $spacing-xl;
  border-radius: 12px; // 略带棱角，体现竹节感
  font-size: $font-size-base;
  font-family: $font-family-serif;
  font-weight: 600;
  transition: all $transition-base;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  .el-icon {
    margin-right: $spacing-sm;
    font-size: $font-size-lg;
  }

  @media (max-width: $breakpoint-mobile) {
    height: 44px;
    padding: 0 $spacing-lg;
    font-size: $font-size-sm;
  }
}

// 主按钮：珐琅彩风格 (加深)
.ink-btn-primary {
  background: linear-gradient(135deg, #059669 0%, #0F766E 100%); // Emerald 600 -> Teal 700
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3); // 深绿色光晕

  // 金色内描边效果 (伪元素)
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 1px solid rgba(180, 83, 9, 0.3); // 暗金色
    border-radius: 10px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(4, 120, 87, 0.4);
    filter: brightness(1.1);
  }
}

// 次级按钮：清透风格 (加深)
.ink-btn-ghost {
  background: transparent;
  color: #047857; // Emerald 700
  border: 1px solid #6EE7B7; // Emerald 300

  &:hover {
    background: rgba(4, 120, 87, 0.05); // 极淡的深绿背景
    border-color: #047857;
    transform: translateY(-2px);
  }
}

// ==================== Hero 右侧：每日一首 (Matte Jade Style) ====================
.hero-daily-poem {
  position: relative;
  width: 100%;
  animation: float 6s ease-in-out infinite;

  .card-wrapper {
    position: relative;
    // 凝脂老玉质感 (不透明)
    background: #F0F2F0;
    // 移除 backdrop-filter 以去除发光感
    border: 1px solid rgba(148, 163, 184, 0.2); // 灰蓝边框
    border-radius: 16px;
    padding: $spacing-lg;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1); // 深色投影
    
    // 回纹装饰 (Corner Ornaments - Darkened)
    &::before, &::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      border: 2px solid #94A3B8; // Slate 400
      transition: all 0.3s ease;
      pointer-events: none;
    }

    // 左上角
    &::before {
      top: 12px;
      left: 12px;
      border-right: none;
      border-bottom: none;
      border-top-left-radius: 4px;
    }

    // 右下角
    &::after {
      bottom: 12px;
      right: 12px;
      border-left: none;
      border-top: none;
      border-bottom-right-radius: 4px;
    }
    
    // 确保内容在纹理之上
    :deep(*) {
      position: relative;
      z-index: 1;
    }
  }

  // 朱砂印章 (加深)
  .seal-mark {
    position: absolute;
    bottom: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    z-index: 2;
    transform: rotate(-15deg);
    opacity: 0.9;
    filter: drop-shadow(2px 4px 6px rgba(159, 18, 57, 0.2)); // Rose 800 shadow
  }

  @media (max-width: $breakpoint-tablet) {
    max-width: 500px;
    margin: 0 auto;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// ==================== 功能特色区 ====================
.features-section {
  padding: $spacing-3xl 0;
  margin-top: $spacing-3xl;

  .section-title {
    font-size: $font-size-3xl;
    font-weight: 600;
    text-align: center;
    color: $color-ink-black;
    font-family: $font-family-chinese;
    margin-bottom: $spacing-2xl;

    // 标题装饰
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -$spacing-md;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: #10B981; // 竹青
      border-radius: $radius-sm;
    }
  }
}

// 功能卡片网格
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-xl;
  margin-top: $spacing-2xl;

  @media (max-width: $breakpoint-tablet) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
  }
}

// 功能卡片
.feature-card {
  background: #F0F2F0; // 灰白玉
  // 移除 backdrop-filter
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: $radius-xl;
  padding: $spacing-xl;
  text-align: center;
  transition: all $transition-base;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);
    border-color: rgba(4, 120, 87, 0.3);
  }

  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: #FFFFFF; // 纯白背景以突出图标
    border-radius: $radius-xl;
    margin-bottom: $spacing-md;
    transition: transform $transition-base;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:hover .feature-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .feature-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-ink-black;
    font-family: $font-family-chinese;
    margin: $spacing-md 0 $spacing-sm;
  }

  .feature-desc {
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    color: $color-ink-gray;
    font-family: $font-family-chinese;
    margin: 0;
  }
}
</style>
