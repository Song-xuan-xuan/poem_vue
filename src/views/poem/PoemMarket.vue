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

        <!-- 标签筛选 -->
        <div class="tag-filter">
          <span class="filter-label">标签筛选：</span>
          <el-check-tag
            v-for="tag in commonTags"
            :key="tag"
            :checked="selectedTags.includes(tag)"
            @change="handleTagChange(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-check-tag>
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
    <div class="poem-list" v-loading="loading">
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
            <p class="poem-author">{{ poem.author }} · {{ poem.dynasty }}</p>
            <div class="poem-preview">
              <p v-for="(para, index) in poem.paragraphs?.slice(0, 2)" :key="index">
                {{ para }}
              </p>
              <span v-if="(poem.paragraphs?.length || 0) > 2" class="more-text">...</span>
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
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { PoemDetail } from '@/api/type'
import { getDailyPoem } from '@/api/poem'
import { usePoemSearch } from '@/composables/usePoemSearch'

const router = useRouter()

// 常用标签
const commonTags = ref([
  '春天',
  '夏天',
  '秋天',
  '冬天',
  '山水',
  '田园',
  '边塞',
  '咏物',
  '咏史',
  '怀古',
  '送别',
  '思乡',
  '爱情',
  '友情',
  '励志'
])

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
const selectedTags = ref<string[]>([])

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
 * 标签选择变化
 */
const handleTagChange = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  handleSearch()
}

/**
 * 重置搜索
 */
const handleResetSearch = () => {
  keyword.value = ''
  searchType.value = 'all'
  selectedTags.value = []
  resetSearch()
}

/**
 * 分页切换
 */
const handlePageChange = (page: number) => {
  changePage(page)
}

/**
 * 每页条数切换
 */
const handleSizeChange = (size: number) => {
  changePageSize(size)
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
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .filter-label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }

        .tag-item {
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
          }
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

  .pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
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
