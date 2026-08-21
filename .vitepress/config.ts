import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// 侧边栏：按「0 地图 + 四阶段」分组，和 docs/ 里的章节一一对应。
const stage = (text: string, items: [string, string][], collapsed = false) => ({
  text,
  collapsed,
  items: items.map(([label, link]) => ({ text: label, link })),
})

export default withMermaid(
  defineConfig({
    title: 'Learn DeepSeek Harness',
    description: '深入浅出吃透 DeepSeek Harness',
    lang: 'zh-CN',
    cleanUrls: true,
    // GitHub Pages 项目站部署在 /<repo>/ 子路径下，构建时用 BASE_PATH 注入；本地默认 '/'。
    base: process.env.BASE_PATH || '/',
    themeConfig: {
      nav: [
        { text: '主页', link: '/' },
        { text: '主线 Timeline', link: '/timeline' },
        { text: '四阶段 Layers', link: '/layers' },
        { text: '相邻对比 Compare', link: '/compare' },
        { text: '演示动画', link: '/demo' },
        { text: 'GitHub 仓库', link: 'https://github.com/ScorpLin/learn-deepseek-harness' },
      ],
      sidebar: [
        { text: '开始', items: [
          { text: '首页 / 阅读路线', link: '/' },
          { text: '主线 Timeline', link: '/timeline' },
          { text: '四阶段 Layers', link: '/layers' },
          { text: '相邻对比 Compare', link: '/compare' },
          { text: '小作业演示动画', link: '/demo' },
        ]},
        stage('0 · 地图', [
          ['架构总览 s00', '/docs/s00-architecture-overview'],
          ['章节顺序理由 s00d', '/docs/s00d-chapter-order-rationale'],
          ['代码阅读顺序 s00f', '/docs/s00f-code-reading-order'],
          ['术语表 glossary', '/docs/glossary'],
          ['教学范围', '/docs/teaching-scope'],
          ['数据结构', '/docs/data-structures'],
          ['实体关系', '/docs/entity-map'],
        ]),
        stage('1 · 地基（Cordis）', [
          ['s01 Cordis 地基', '/docs/s01-cordis-foundation'],
          ['s02 事件与 waterfall', '/docs/s02-events-and-waterfall'],
          ['s03 服务与依赖注入', '/docs/s03-services-and-inject'],
          ['s04 配置与 Loader', '/docs/s04-config-and-loader'],
        ]),
        stage('2 · 主干', [
          ['s05 Capability Seam', '/docs/s05-capability-seam'],
          ['s05a shell seam 精读', '/docs/s05a-shell-seam-deep-read'],
          ['s06 Agent Loop', '/docs/s06-agent-loop'],
          ['s06a agent-loop 精读', '/docs/s06a-agent-loop-deep-read'],
          ['s07 Session Log', '/docs/s07-session-log'],
          ['s07a session-log 精读', '/docs/s07a-session-log-deep-read'],
          ['s08 Tools', '/docs/s08-tools'],
          ['s08a tools 管线精读', '/docs/s08a-tools-deep-read'],
          ['s09 Prompt Assembly', '/docs/s09-prompt-assembly'],
        ]),
        stage('3 · 动手', [
          ['s10 Scope', '/docs/s10-scope'],
          ['s11 LLM Adapter', '/docs/s11-llm-adapter'],
          ['s11a llm adapter 精读', '/docs/s11a-llm-adapter-deep-read'],
          ['s12 写一个工具', '/docs/s12-write-a-tool'],
          ['s13 Subagent', '/docs/s13-subagent'],
          ['s14 Skill', '/docs/s14-skill'],
        ]),
        stage('4 · 平台', [
          ['s15 Workflow', '/docs/s15-workflow'],
          ['s16 权限与审批', '/docs/s16-permission-approval'],
          ['s17 Goal 与 Plan', '/docs/s17-goal-plan'],
          ['s18 沙箱与执行世界', '/docs/s18-sandbox-execution'],
          ['s19 扩展与自修改', '/docs/s19-extensions'],
        ]),
      ],
      outline: { level: [2, 3] },
      socialLinks: [{ icon: 'github', link: 'https://github.com/ScorpLin/learn-deepseek-harness' }],
      footer: { message: 'Learn DeepSeek Harness · 教学线', copyright: 'MIT' },
      lastUpdated: false,
    },
    // mermaid 的 ESM chunk 用 `import fastdom from 'fastdom'` 默认导入，但
    // fastdom@1.0.12 是纯 CJS（无 module/exports），必须让 Vite 预构建它做
    // CJS→ESM 转换，否则浏览器报 "does not provide an export named 'default'"。
    vite: {
      optimizeDeps: {
        include: ['fastdom', 'fastdom/extensions/fastdom-promised.js'],
      },
    },
  }),
)
