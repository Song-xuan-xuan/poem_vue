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

    <!-- 主内容区：左侧诗词列表 + 右侧对诗功能 -->
    <div class="main-content">
      <!-- 左侧：诗词列表 -->
      <div class="poem-list-container">
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
                <!-- 装饰背景：竹影 -->
                <div class="card-bg-pattern">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120,200 Q150,100 100,0" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.3" />
                    <path d="M140,180 Q160,120 130,40" stroke="currentColor" stroke-width="1" fill="none" opacity="0.2" />
                    <path d="M120,60 Q150,70 160,50" fill="currentColor" opacity="0.2" />
                    <path d="M110,120 Q140,130 150,110" fill="currentColor" opacity="0.2" />
                    <path d="M130,160 Q160,170 170,150" fill="currentColor" opacity="0.15" />
                  </svg>
                </div>
                <!-- 装饰：角落回纹 -->
                <div class="card-corner-decoration"></div>

                <h3 class="poem-title">{{ poem.title }}</h3>
                <p class="poem-author">
                  <span class="author-name">{{ poem.author }}</span>
  
                </p>
                <div class="poem-preview">
                  {{ poem.part_content }}
                </div>
                <div class="poem-footer" v-if="poem.tags && poem.tags.length > 0">
                  <el-tag
                    v-for="tag in poem.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    class="custom-tag"
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

      <!-- 右侧：对诗功能 -->
      <div class="sidebar">
        <PoemRespond />
      </div>
    </div>

    <!-- 卷轴弹窗 -->
    <ScrollDialog v-model="dialogVisible" width="900px">
      <PoemDetailContent 
        v-if="selectedPoemId" 
        :poem-id="selectedPoemId" 
      />
    </ScrollDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePoemSearch } from '@/composables/usePoemSearch'
import PoemRespond from '@/components/PoemRespond.vue'
import ScrollDialog from '@/components/ScrollDialog.vue'
import PoemDetailContent from '@/components/PoemDetailContent.vue'

// 卷轴弹窗状态
const dialogVisible = ref(false)
const selectedPoemId = ref<number | null>(null)

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
 * 打开卷轴弹窗展示诗词详情
 */
const goToDetail = (id: number) => {
  selectedPoemId.value = id
  dialogVisible.value = true
}


onMounted(() => {
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
    margin-bottom: 24px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 244, 0.8) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px -8px rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
    }

    :deep(.el-card__body) {
      padding: 24px 32px;
    }

    .search-section {
      .search-bar {
        margin-bottom: 24px;
        display: flex;
        justify-content: center;

        .search-input {
          width: 100%;
          max-width: 800px;

          // 输入框样式重写
          :deep(.el-input-group__prepend) {
            background-color: rgba(255, 255, 255, 0.6);
            box-shadow: none;
            border-right: 1px solid rgba(16, 185, 129, 0.1);
            padding: 0 20px;
            
            .el-select .el-input__wrapper {
              box-shadow: none !important;
              background: transparent;
              padding: 0;
            }
            
            .el-input__inner {
              color: #047857;
              font-weight: 500;
            }
          }
          
          :deep(.el-input__wrapper) {
            background-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) inset;
            padding-left: 16px;
            
            &.is-focus {
              box-shadow: 0 0 0 1px #10B981 inset;
              background-color: #fff;
            }

            .el-input__inner {
              height: 44px;
              color: #1F2937;
            }
          }
          
          :deep(.el-input-group__append) {
            background-color: #10B981;
            border: none;
            box-shadow: none;
            padding: 0 24px;
            transition: all 0.3s;
            
            &:hover {
              background-color: #059669;
            }
            
            .el-button {
              color: white;
              border: none;
              margin: 0;
              padding: 12px 0;
              
              &:hover {
                color: white;
                background: transparent;
              }
            }
          }
        }
      }

      .tag-filter {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 20px;
        border-top: 1px dashed rgba(16, 185, 129, 0.2);

        .filter-label {
          font-size: 15px;
          color: #047857;
          font-weight: 600;
          font-family: 'Noto Serif SC', serif;
          display: flex;
          align-items: center;
          gap: 8px;
          
          &::before {
            content: '';
            display: block;
            width: 4px;
            height: 16px;
            background: #10B981;
            border-radius: 2px;
          }
        }

        .tag-selects {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;

          .category-select {
            flex: 1;
            min-width: 160px;
            max-width: 220px;
            
            :deep(.el-input__wrapper) {
              background-color: rgba(255, 255, 255, 0.5);
              box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.15) inset;
              border-radius: 8px;
              padding: 4px 12px;
              
              &.is-focus {
                box-shadow: 0 0 0 1px #10B981 inset !important;
                background-color: #fff;
              }
            }
          }
        }

        .el-button {
          align-self: flex-start;
          font-family: 'Noto Serif SC', serif;
          font-weight: 500;
          
          &:hover {
            color: #047857;
          }
        }
      }
    }
  }

  .main-content {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    .poem-list-container {
      flex: 1;
      min-width: 0;
    }

    .sidebar {
      width: 320px;
      flex-shrink: 0;
    }
  }

  .poem-list {
    min-height: 400px;
    margin-bottom: 20px;

    .poem-card {
      margin-bottom: 24px;
      cursor: pointer;
      height: 280px;
      position: relative;
      border: 1px solid rgba(16, 185, 129, 0.1);
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 244, 0.6) 100%);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: cardFadeIn 0.6s ease-out backwards;

      // 覆盖 el-card 默认样式
      :deep(.el-card__body) {
        height: 100%;
        padding: 24px;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 2;
        background: transparent;
        overflow: hidden; // 防止内容溢出导致滚动条
      }

      // 悬停效果
      &:hover {
        transform: translateY(-8px) scale(1.01);
        box-shadow: 0 16px 32px -8px rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.3);
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(236, 253, 245, 0.8) 100%);

        .card-bg-pattern {
          opacity: 0.2;
          transform: scale(1.1) rotate(2deg);
          color: #059669;
        }

        .card-corner-decoration {
          border-color: rgba(16, 185, 129, 0.4);
          &::before {
            border-color: rgba(16, 185, 129, 0.4);
          }
        }

        .poem-title {
          color: #047857;
        }
      }

      // 装饰：竹影背景
      .card-bg-pattern {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 160px;
        height: 160px;
        color: #10B981;
        opacity: 0.08;
        transition: all 0.6s ease;
        z-index: 0;
        pointer-events: none;
        
        svg {
          width: 100%;
          height: 100%;
        }
      }

      // 装饰：角落回纹
      .card-corner-decoration {
        position: absolute;
        bottom: 16px;
        right: 16px;
        width: 24px;
        height: 24px;
        border-bottom: 2px solid rgba(16, 185, 129, 0.15);
        border-right: 2px solid rgba(16, 185, 129, 0.15);
        z-index: 1;
        transition: all 0.3s ease;
        
        &::before {
          content: '';
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 12px;
          height: 12px;
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
          border-right: 1px solid rgba(16, 185, 129, 0.15);
          transition: all 0.3s ease;
        }
      }

      .poem-title {
        font-size: 20px;
        margin: 0 0 12px 0;
        font-weight: 700;
        color: #1F2937;
        font-family: 'Noto Serif SC', 'Songti SC', serif;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.3s ease;
      }

      .poem-author {
        font-size: 14px;
        color: #6B7280;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        .author-name {
          font-weight: 500;
        }

        .dynasty-badge {
          font-size: 12px;
          padding: 1px 6px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-radius: 4px;
          font-family: 'Noto Serif SC', serif;
        }
      }

      .poem-preview {
        flex: 1;
        line-height: 1.8;
        color: #4B5563;
        font-family: 'Noto Serif SC', serif;
        font-size: 15px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        line-clamp: 4;
        -webkit-box-orient: vertical;
        margin-bottom: 12px;
        text-align: justify;
      }

      .poem-footer {
        margin-top: auto;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .custom-tag {
          background: transparent;
          border-color: rgba(16, 185, 129, 0.2);
          color: #059669;
          font-family: 'Noto Serif SC', serif;
          
          &:hover {
            background: rgba(16, 185, 129, 0.05);
          }
        }
      }
    }
  }

  // 列表加载动画延迟
  @for $i from 1 through 12 {
    .el-col:nth-child(#{$i}) .poem-card {
      animation-delay: #{$i * 0.08}s;
    }
  }

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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

    .main-content {
      flex-direction: column;

      .sidebar {
        width: 100%;
      }
    }
  }
}
</style>
