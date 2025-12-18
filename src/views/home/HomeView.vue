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

// 功能特色（使用新的配色）
const features = [
  {
    icon: Reading,
    title: '诗词集市',
    desc: '海量古诗词库，按朝代、作者、标签精准检索',
    color: '#6b9080'  // 竹青
  },
  {
    icon: ChatDotRound,
    title: '论坛社区',
    desc: '与诗友交流创作心得，分享诗词感悟',
    color: '#a4c3b2'  // 浅竹青
  },
  {
    icon: Compass,
    title: 'AI 助手',
    desc: '智能对诗、诗词解析、创作辅助',
    color: '#c9a961'  // 印章金
  },
  {
    icon: TrophyBase,
    title: '成长体系',
    desc: '经验值、等级、成就，见证你的诗词之路',
    color: '#b8705f'  // 朱砂红
  }
]
</script>

<template>
  <div class="home-view">
    <!-- Hero 区：左侧文案 + 右侧每日一首 -->
    <section class="hero-section">
      <!-- 诗词装饰元素 -->
      <div class="poem-decoration">
        <!-- 左上角印章 -->
        <div class="seal seal-top">诗</div>
        <!-- 右下角印章 -->
        <div class="seal seal-bottom">词</div>
        <!-- 竹节装饰 -->
        <div class="bamboo-node bamboo-node-1"></div>
        <div class="bamboo-node bamboo-node-2"></div>
        <div class="bamboo-node bamboo-node-3"></div>
      </div>

      <!-- 左侧：主标题与行动按钮 -->
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🎋</span>
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
          <el-button
            type="primary"
            size="large"
            class="action-btn primary-btn"
            @click="handleStartLearning"
          >
            <el-icon><Reading /></el-icon>
            <span>开始学习</span>
          </el-button>

          <el-button
            size="large"
            class="action-btn secondary-btn"
            @click="handleGoToCommunity"
          >
            <el-icon><ChatDotRound /></el-icon>
            <span>社区交流</span>
          </el-button>

          <el-button
            size="large"
            class="action-btn tertiary-btn"
            @click="handleGoToAI"
          >
            <el-icon><Compass /></el-icon>
            <span>AI 助手</span>
          </el-button>
        </div>
      </div>

      <!-- 右侧：每日一首（融合式展示）-->
      <div class="hero-daily-poem">
        <DailyPoem />
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
}

// ==================== Hero 区：左右布局 ====================
.hero-section {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: $spacing-3xl;
  align-items: center;
  min-height: calc(100vh - $navbar-height - $spacing-3xl * 2);
  padding: $spacing-3xl 0;

  // 平板响应式
  @media (max-width: $breakpoint-tablet) {
    grid-template-columns: 1fr;
    gap: $spacing-2xl;
    min-height: auto;
    padding: $spacing-2xl 0;
  }
}

// ==================== 诗词装饰元素 ====================
.poem-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;

  // 印章样式（更柔和的朱砂红）
  .seal {
    position: absolute;
    width: 60px;
    height: 60px;
    background: $color-accent-red;
    color: $color-paper-white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: bold;
    font-family: $font-family-poem;
    border: 3px solid $color-accent-red;
    box-shadow: 0 4px 12px rgba(184, 112, 95, 0.25);
    opacity: 0.8;
    transform: rotate(-5deg);
    animation: sealFade 3s ease-in-out infinite;

    &.seal-top {
      top: 10%;
      left: 5%;
    }

    &.seal-bottom {
      bottom: 15%;
      right: 8%;
      transform: rotate(8deg);
      animation-delay: 1.5s;
    }

    @media (max-width: $breakpoint-tablet) {
      display: none;
    }
  }

  // 竹节装饰（使用新的竹青色）
  .bamboo-node {
    position: absolute;
    width: 8px;
    height: 80px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(107, 144, 128, 0.12) 10%,
      rgba(107, 144, 128, 0.2) 48%,
      rgba(107, 144, 128, 0.25) 50%,
      rgba(107, 144, 128, 0.2) 52%,
      rgba(107, 144, 128, 0.12) 90%,
      transparent 100%
    );
    border-radius: 4px;

    // 竹节纹理
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -2px;
      right: -2px;
      height: 3px;
      background: rgba(107, 144, 128, 0.35);
      transform: translateY(-50%);
    }

    &.bamboo-node-1 {
      top: 20%;
      left: 2%;
      animation: bambooSway 4s ease-in-out infinite;
    }

    &.bamboo-node-2 {
      top: 50%;
      right: 3%;
      height: 100px;
      animation: bambooSway 5s ease-in-out infinite;
      animation-delay: 1s;
    }

    &.bamboo-node-3 {
      bottom: 20%;
      left: 8%;
      height: 70px;
      animation: bambooSway 4.5s ease-in-out infinite;
      animation-delay: 2s;
    }

    @media (max-width: $breakpoint-tablet) {
      display: none;
    }
  }
}

// 印章淡入淡出动画（更柔和）
@keyframes sealFade {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.55;
  }
}

// 竹子摇曳动画
@keyframes bambooSway {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(2deg);
  }
  75% {
    transform: rotate(-2deg);
  }
}

// ==================== Hero 左侧：文案区 ====================
.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;

  // 徽章（使用新的竹青色）
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: rgba(107, 144, 128, 0.08);
    border: 1px solid rgba(107, 144, 128, 0.18);
    border-radius: $radius-round;
    width: fit-content;

    .badge-icon {
      font-size: $font-size-lg;
    }

    .badge-text {
      font-size: $font-size-sm;
      color: $color-bamboo-primary;
      font-weight: 500;
      font-family: $font-family-chinese;
    }
  }

  // 主标题
  .hero-title {
    font-size: $font-size-4xl;
    font-weight: 700;
    line-height: $line-height-tight;
    color: $color-ink-black;
    font-family: $font-family-chinese;
    margin: 0;

    .title-highlight {
      color: $color-bamboo-primary;
      position: relative;

      // 下划线装饰
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, $color-bamboo-primary, transparent);
        border-radius: $radius-sm;
      }
    }

    @media (max-width: $breakpoint-mobile) {
      font-size: $font-size-3xl;
    }
  }

  // 诗词名句装饰（使用新的竹青色）
  .poem-quote {
    position: relative;
    padding: $spacing-lg $spacing-xl;
    background: linear-gradient(
      135deg,
      rgba(107, 144, 128, 0.04) 0%,
      rgba(107, 144, 128, 0.07) 100%
    );
    border-left: 4px solid $color-bamboo-primary;
    border-radius: $radius-md;
    margin: $spacing-md 0;

    .quote-mark {
      position: absolute;
      top: -10px;
      left: 10px;
      font-size: 48px;
      color: $color-bamboo-light;
      opacity: 0.3;
      font-family: Georgia, serif;
      line-height: 1;
    }

    .quote-text {
      font-size: $font-size-xl;
      font-family: $font-family-poem;
      color: $color-ink-black;
      margin: 0 0 $spacing-sm 0;
      letter-spacing: 3px;
      text-align: center;
      font-weight: 500;
    }

    .quote-author {
      font-size: $font-size-sm;
      color: $color-ink-gray;
      text-align: right;
      font-family: $font-family-chinese;
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

// ==================== 行动按钮样式 ====================
.action-btn {
  height: 48px;
  padding: 0 $spacing-xl;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-family: $font-family-chinese;
  font-weight: 500;
  transition: all $transition-base;
  border: none;

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

// 主按钮
.primary-btn {
  background: $color-bamboo-primary;
  color: #fff;
  box-shadow: $shadow-md;

  &:hover {
    background: $color-bamboo-dark;
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

// 次按钮
.secondary-btn {
  background: rgba(255, 255, 255, 0.8);
  color: $color-bamboo-primary;
  border: 2px solid $color-bamboo-primary;

  &:hover {
    background: rgba(90, 140, 111, 0.1);
    transform: translateY(-2px);
  }
}

// 第三按钮
.tertiary-btn {
  background: rgba(212, 175, 55, 0.1);
  color: $color-accent-gold;
  border: 2px solid $color-accent-gold;

  &:hover {
    background: rgba(212, 175, 55, 0.2);
    transform: translateY(-2px);
  }
}

// ==================== Hero 右侧：每日一首 ====================
.hero-daily-poem {
  // 移除固定定位，融入 Hero 区
  position: relative;
  width: 100%;

  // 添加轻微动画
  animation: float 6s ease-in-out infinite;

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
      background: $color-bamboo-primary;
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
  background: $gradient-card-bg;
  backdrop-filter: $blur-sm;
  border: 1px solid rgba(90, 140, 111, 0.1);
  border-radius: $radius-xl;
  padding: $spacing-xl;
  text-align: center;
  transition: all $transition-base;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: rgba(90, 140, 111, 0.2);
  }

  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: $radius-xl;
    margin-bottom: $spacing-md;
    transition: transform $transition-base;
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
