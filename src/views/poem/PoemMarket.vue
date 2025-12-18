<template>
  <div class="poem-market">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-section">
        <!-- 搜索框 -->
        <div class="search-bar">
          <el-input
            v-model="keyword"
            placeholder="输入标题或诗句搜索"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prepend>
              <el-select v-model="searchType" style="width: 120px">
                <el-option label="全部" value="all" />
                <el-option label="标题搜索" value="title" />
                <el-option label="诗句搜索" value="paragraph" />
              </el-select>
            </template>
            <template #append>
              <el-button :icon="Search" @click="handleSearch" :loading="loading" />
            </template>
          </el-input>
        </div>

        <!-- 标签筛选 - 分类选择 -->
        <div class="tag-filter">
          <span class="filter-label">标签筛选：</span>
          <div class="tag-selects">
            <el-select
              v-for="(tags, category) in tagCategories"
              :key="category"
              v-model="selectedTagsByCategory[category]"
              :placeholder="category"
              clearable
              @change="handleCategoryTagChange"
              class="category-select"
            >
              <el-option
                v-for="tag in tags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </div>
          <el-button link type="primary" @click="handleResetSearch" v-if="hasSearchCondition">
            重置筛选
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 每日一首 -->
    <el-card class="daily-poem-card" shadow="hover" v-if="dailyPoem">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><StarFilled /></el-icon>
            每日一首
          </span>
          <span class="header-date">{{ formatDate(new Date()) }}</span>
        </div>
      </template>
      <div class="daily-poem-content" @click="goToDetail(dailyPoem.id)">
        <h2 class="poem-title">{{ dailyPoem.title }}</h2>
        <p class="poem-author">{{ dailyPoem.author }} · {{ dailyPoem.dynasty }}</p>
        <div class="poem-paragraphs">
          <p v-for="(para, index) in dailyPoem.paragraphs?.slice(0, 4)" :key="index">
            {{ para }}
          </p>
          <span v-if="(dailyPoem.paragraphs?.length || 0) > 4" class="more-text">...</span>
        </div>
        <div class="poem-tags" v-if="dailyPoem.tags && dailyPoem.tags.length > 0">
          <el-tag
            v-for="tag in dailyPoem.tags"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 诗词列表 -->
    <div class="poem-list">
      <el-empty v-if="!loading && poems.length === 0" description="暂无诗词数据" />
      <el-row :gutter="20" v-else>
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          v-for="poem in poems"
          :key="poem.id"
        >
          <el-card
            class="poem-card"
            shadow="hover"
            @click="goToDetail(poem.id)"
          >
            <h3 class="poem-title">{{ poem.title }}</h3>
            <p class="poem-author">{{ poem.author }}</p>
            <div class="poem-preview">
              {{ poem.part_content }}
            </div>
            <div class="poem-footer" v-if="poem.tags && poem.tags.length > 0">
              <el-tag
                v-for="tag in poem.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 加载更多提示 -->
      <div class="load-more" v-if="poems.length > 0">
        <div v-if="loading" class="loading-text">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="hasMore" class="load-more-text">
          向下滚动加载更多
        </div>
        <div v-else class="no-more-text">
          已加载全部诗词
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, StarFilled, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { PoemDetail } from '@/api/type'
import { getDailyPoem } from '@/api/poem'
import { usePoemSearch } from '@/composables/usePoemSearch'

const router = useRouter()

// 标签分类数据
const tagCategories = ref<Record<string, string[]>>({
  '体裁类': [
    '七言古诗', '七言律诗', '七言绝句',
    '五言古诗', '五言律诗', '五言绝句',
    '乐府', '新乐府辞', '杂曲歌辞', '相和歌辞', '清商曲辞', '鼓吹曲辞', '近代曲辞',
    '古体', '咏物诗', '组诗', '长诗'
  ],
  '意象类': [
    '山', '水', '花', '草', '树', '雨', '雪', '风', '马', '鸟',
    '月亮', '梅花', '荷花', '植物', '塔',
    '黄河', '长江', '洞庭湖',
    '泰山', '黄山', '庐山', '峨眉山', '终南山',
    '黄鹤楼', '岳阳楼'
  ],
  '情感类': [
    '喜悦', '悲伤', '伤怀', '孤独', '哀怨', '愁思', '感伤', '感叹', '感慨',
    '思乡', '思亲', '思归', '思念', '怀念', '依恋',
    '忧国忧民', '忧思', '愤懑', '怅惘', '失意', '惜别', '惜时', '惜春',
    '热爱', '爱国', '爱情', '友情', '母爱', '相思',
    '励志', '慰藉', '慰勉', '豪放', '豪迈', '婉约',
    '怨情', '宫怨', '闺怨', '悼亡', '托物寄情'
  ],
  '主题类': [
    '怀古', '咏史', '咏史怀古', '吊古伤今', '凭吊古迹',
    '边塞', '戍边', '战争', '征人', '将士',
    '田园', '隐逸', '归隐', '隐士',
    '咏物', '咏叹', '题咏', '题画',
    '讽喻', '讽刺', '托古讽今', '议论', '哲理',
    '抒怀', '抒志', '即景抒情', '触景感怀', '寓人', '寓言',
    '叙事', '写人', '待客', '访友', '寻访',
    '离别', '送别', '赠别', '酬和', '酬答', '酬赠', '和诗', '唱和',
    '羁旅', '旅途', '游历', '纪游',
    '人生', '人格', '抱负', '怀才不遇', '仕途', '贬谪', '迁谪',
    '豪侠', '游侠', '狩猎', '生活', '宴会', '宴饮', '早朝', '应制',
    '考试', '新婚', '妇女', '女子', '宫廷'
  ],
  '场景/时节类': [
    '春天', '夏天', '秋天', '冬天',
    '春节', '中秋节', '寒食节', '清明节', '重阳节',
    '月下', '月夜', '秋雨', '风雨',
    '寺庙', '名楼、庙宇', '家乡', '地名', '地点', '景点'
  ],
  '手法/风格类': [
    '写景', '描写山', '描写水', '写塔', '写树', '写花', '写草', '写雨', '写雪', '写风', '写马', '写鸟',
    '拟古', '援引', '用典', '典故',
    '赞美', '赞扬', '赞颂', '规劝',
    '记梦', '相和', '鼓吹', '清商',
    '豪放', '婉约', '豪迈', '直白', '含蓄'
  ]
})

// 各分类已选中的标签
const selectedTagsByCategory = ref<Record<string, string>>({})

// 使用搜索 composable
const {
  loading,
  poems,
  total,
  currentPage,
  pageSize,
  searchParams,
  hasSearchCondition,
  search,
  resetSearch,
  setKeyword,
  setTags,
  setSearchType,
  changePage,
  changePageSize
} = usePoemSearch()

// 本地搜索状态
const keyword = ref('')
const searchType = ref<'title' | 'paragraph' | 'all'>('all')

// 计算所有已选中的标签（从各分类中提取）
const selectedTags = computed(() => {
  return Object.values(selectedTagsByCategory.value).filter(tag => tag && tag.trim())
})

// 每日一首
const dailyPoem = ref<PoemDetail | null>(null)

/**
 * 加载每日一首
 */
const loadDailyPoem = async () => {
  try {
    const res = await getDailyPoem()
    dailyPoem.value = res.data.poem
  } catch (error: any) {
    console.error('加载每日一首失败:', error)
  }
}

/**
 * 执行搜索
 */
const handleSearch = () => {
  setKeyword(keyword.value)
  setTags(selectedTags.value)
  setSearchType(searchType.value)
  search()
}

/**
 * 分类标签变化
 */
const handleCategoryTagChange = () => {
  handleSearch()
}

/**
 * 重置搜索
 */
const handleResetSearch = () => {
  keyword.value = ''
  searchType.value = 'all'
  selectedTagsByCategory.value = {}
  resetSearch()
}

/**
 * 是否还有更多数据
 */
const hasMore = computed(() => {
  return currentPage.value < Math.ceil(total.value / pageSize.value)
})

/**
 * 加载下一页
 */
const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  await changePage(currentPage.value + 1)
}

/**
 * 滚动事件处理
 */
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 距离底部 200px 时触发加载
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMore()
  }
}

/**
 * 跳转到详情页
 */
const goToDetail = (id: number) => {
  router.push(`/poem/detail/${id}`)
}

/**
 * 格式化日期
 */
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

onMounted(() => {
  loadDailyPoem()
  search()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.poem-market {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .search-card {
    margin-bottom: 20px;

    .search-section {
      .search-bar {
        margin-bottom: 16px;

        .search-input {
          width: 100%;
          max-width: 800px;
        }
      }

      .tag-filter {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .filter-label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }

        .tag-selects {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;

          .category-select {
            flex: 1;
            min-width: 180px;
            max-width: 250px;
          }
        }

        .el-button {
          align-self: flex-start;
        }
      }
    }
  }

  .daily-poem-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    :deep(.el-card__header) {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;

        .el-icon {
          color: #ffd700;
        }
      }

      .header-date {
        font-size: 14px;
        opacity: 0.9;
      }
    }

    .daily-poem-content {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .poem-title {
        font-size: 24px;
        margin: 0 0 12px 0;
        font-weight: 600;
      }

      .poem-author {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 16px;
      }

      .poem-paragraphs {
        line-height: 1.8;
        font-size: 16px;
        margin-bottom: 16px;

        p {
          margin: 8px 0;
        }

        .more-text {
          opacity: 0.7;
        }
      }

      .poem-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        :deep(.el-tag) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;
        }
      }
    }
  }

  .poem-list {
    min-height: 400px;
    margin-bottom: 20px;

    .poem-card {
      margin-bottom: 20px;
      cursor: pointer;
      height: 280px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .poem-title {
        font-size: 18px;
        margin: 0 0 8px 0;
        font-weight: 600;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .poem-author {
        font-size: 13px;
        color: #909399;
        margin-bottom: 12px;
      }

      .poem-preview {
        flex: 1;
        line-height: 1.8;
        color: #606266;
        overflow: hidden;

        p {
          margin: 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .more-text {
          color: #909399;
          font-style: italic;
        }
      }

      .poem-footer {
        margin-top: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 40px 0;
    color: #909399;
    font-size: 14px;

    .loading-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #409eff;

      .el-icon {
        font-size: 18px;
      }
    }

    .load-more-text {
      color: #909399;
    }

    .no-more-text {
      color: #c0c4cc;
      font-style: italic;
    }
  }
}

@media (max-width: 768px) {
  .poem-market {
    padding: 12px;

    .daily-poem-card {
      .daily-poem-content {
        .poem-title {
          font-size: 20px;
        }

        .poem-paragraphs {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
