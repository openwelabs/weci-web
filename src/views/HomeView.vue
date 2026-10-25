<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import FeatureCard from '@/components/FeatureCard.vue'
import { locale, UI } from '@/lib/i18n'

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key

const GITHUB = 'https://github.com/openwelabs/weci'
const PLUGHUB = 'https://plughub.pages.dev/'

/* ---------------- 安装命令 ---------------- */
const installCmd = `git clone ${GITHUB}.git
cd weci
python3 -m venv .venv && source .venv/bin/activate
pip install .
weci serve`

const copied = ref(false)
async function copyInstall() {
  try {
    await navigator.clipboard.writeText(installCmd)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch (e) {
    copied.value = false
  }
}

/* ---------------- 内容数据（双语） ---------------- */

const CONTENT = {
  'zh-CN': {
    features: [
      {
        icon: '💬',
        title: '安静地聊天',
        desc: '流式 SSE 逐字渲染，Markdown、代码高亮、LaTeX 公式一应俱全。支持重新生成、编辑重发、消息复制。',
        tags: ['streaming', 'markdown', 'katex'],
      },
      {
        icon: '🛠️',
        title: 'Agent 模式',
        desc: '切换到 Agent，AI 会自主调用工具完成任务。执行过程以卡片形式呈现：步骤、参数、结果、耗时一目了然。',
        tags: ['agent-loop', 'tools', 'max 10 steps'],
      },
      {
        icon: '🔒',
        title: '本地优先',
        desc: '没有账号系统，没有数据库。对话历史保存在浏览器 localStorage，模型服务由你自己提供。',
        tags: ['no-account', 'localStorage'],
      },
      {
        icon: '🧩',
        title: '插件系统',
        desc: 'Plugin SDK v0.1 + weci-maker 工具链，声明 manifest、实现工具、打包成 .wcp 即可安装。',
        tags: ['sdk', 'weci-maker', '.wcp'],
      },
      {
        icon: '🔌',
        title: 'MCP 支持',
        desc: '接入 Model Context Protocol Server，把外部能力注册为工具，Agent 与插件使用同一套 ToolRegistry。',
        tags: ['mcp', 'tools'],
      },
      {
        icon: '🧠',
        title: '上下文管理',
        desc: 'Chat 与 Agent 共用同一套上下文构建逻辑，按模型窗口估算 token，超出时自动压缩较早内容。',
        tags: ['context-manager', 'token'],
      },
      {
        icon: '🖼️',
        title: '图片与文件',
        desc: '拖拽上传图片或文本类文件，发送前可预览删除，随会话一起保存在本地。',
        tags: ['vision', 'attachments', 'pdf'],
      },
      {
        icon: '💾',
        title: '长期记忆',
        desc: '仅在你明确要求时保存，按 user / workspace / conversation 隔离，存于 .weci/memory.json。',
        tags: ['memory', 'scoped'],
      },
      {
        icon: '🔀',
        title: '多 Provider',
        desc: '任何 OpenAI-compatible 端点：OpenAI、DeepSeek、Qwen、Ollama、LM Studio 都能直接用。',
        tags: ['openai-compatible', 'ollama'],
      },
    ],
    modes: [
      {
        name: 'Chat',
        tagline: '对话就是对话',
        points: ['模型回复直接以流式 SSE 返回', '不会调用任何工具', '适合问答、写作、解释代码'],
      },
      {
        name: 'Agent',
        tagline: '让 AI 动手完成',
        points: [
          '按需调用已注册的工具',
          'Agent Loop 最多 10 步，防止无限运行',
          '只展示执行事实，不展示隐藏推理',
        ],
      },
    ],
    skills: [
      { name: 'Calculator', tools: 'calculator', desc: '安全计算器（AST 解析，禁用 eval）' },
      { name: 'Current Time', tools: 'current_time', desc: '当前日期、时间与时区' },
      {
        name: 'Web Search',
        tools: 'web_search, fetch_url',
        desc: '联网搜索（DuckDuckGo，免 Key）并抓取页面',
      },
      {
        name: 'Computer',
        tools: 'run_command, read_file, write_file …',
        desc: '执行命令、读写文件、剪贴板',
      },
      {
        name: 'Memory',
        tools: 'save_memory, delete_memory',
        desc: '仅在用户明确要求时保存 / 删除记忆',
      },
    ],
    stats: [
      { value: '2', label: '种工作模式' },
      { value: '5', label: '个内置技能' },
      { value: '0', label: '个账号 / 数据库' },
      { value: '100%', label: '本地存储' },
    ],
    docLinks: [
      { to: '/docs/weci-readme.zh-CN', title: '使用手册', desc: '功能、安装、配置与项目结构' },
      { to: '/plugins', title: '插件开发', desc: 'SDK、manifest、工具与权限' },
      { to: '/docs/weci-readme.en', title: 'Handbook (EN)', desc: 'English documentation' },
    ],
    quickStart: [
      { k: 'API Endpoint', v: 'https://api.openai.com/v1' },
      { k: 'API Key', v: 'sk-… （只保存在浏览器）' },
      { k: 'Model', v: 'gpt-4o-mini / deepseek-chat / llama3.1' },
      { k: '本地服务', v: 'Ollama · http://127.0.0.1:11434/v1' },
    ],
    installNotePre: 'Key 也可以放在服务端：',
    installNoteMid: '后填写',
    installNotePost: '，前端留空即可。',
    copyLabel: '复制',
    copiedLabel: '已复制',
    ctaTitlePre: '本地优先，从一次',
    ctaTitlePost: '开始',
  },

  en: {
    features: [
      {
        icon: '💬',
        title: 'Chat, quietly',
        desc: 'Streaming SSE token by token, with Markdown, syntax highlighting and LaTeX. Regenerate, edit-and-resend, copy messages.',
        tags: ['streaming', 'markdown', 'katex'],
      },
      {
        icon: '🛠️',
        title: 'Agent mode',
        desc: 'Switch to Agent and the AI calls tools on its own. Every step is shown as a card: arguments, result, duration.',
        tags: ['agent-loop', 'tools', 'max 10 steps'],
      },
      {
        icon: '🔒',
        title: 'Local-first',
        desc: 'No accounts, no database. History lives in browser localStorage and you bring your own model endpoint.',
        tags: ['no-account', 'localStorage'],
      },
      {
        icon: '🧩',
        title: 'Plugin system',
        desc: 'Plugin SDK v0.1 + the weci-maker toolchain: declare a manifest, implement tools, package as .wcp, install.',
        tags: ['sdk', 'weci-maker', '.wcp'],
      },
      {
        icon: '🔌',
        title: 'MCP support',
        desc: 'Connect Model Context Protocol servers and expose their capabilities as tools through the same ToolRegistry.',
        tags: ['mcp', 'tools'],
      },
      {
        icon: '🧠',
        title: 'Context management',
        desc: 'Chat and Agent share one context builder. Tokens are estimated against the model window and older content is compacted.',
        tags: ['context-manager', 'token'],
      },
      {
        icon: '🖼️',
        title: 'Images & files',
        desc: 'Drag in images or text files, preview and remove before sending — stored locally with the conversation.',
        tags: ['vision', 'attachments', 'pdf'],
      },
      {
        icon: '💾',
        title: 'Long-term memory',
        desc: 'Saved only when you explicitly ask, scoped by user / workspace / conversation in .weci/memory.json.',
        tags: ['memory', 'scoped'],
      },
      {
        icon: '🔀',
        title: 'Any provider',
        desc: 'Any OpenAI-compatible endpoint works: OpenAI, DeepSeek, Qwen, Ollama, LM Studio.',
        tags: ['openai-compatible', 'ollama'],
      },
    ],
    modes: [
      {
        name: 'Chat',
        tagline: 'Chat is chat',
        points: [
          'Replies stream straight back over SSE',
          'No tools are ever called',
          'Great for Q&A, writing, explaining code',
        ],
      },
      {
        name: 'Agent',
        tagline: 'Let the AI do the work',
        points: [
          'Calls registered tools as needed',
          'Agent loop capped at 10 steps',
          'Shows execution facts, never hidden reasoning',
        ],
      },
    ],
    skills: [
      { name: 'Calculator', tools: 'calculator', desc: 'Safe evaluator (AST parsing, no eval)' },
      { name: 'Current Time', tools: 'current_time', desc: 'Current date, time and timezone' },
      {
        name: 'Web Search',
        tools: 'web_search, fetch_url',
        desc: 'Web search (DuckDuckGo, no key) plus page fetching',
      },
      {
        name: 'Computer',
        tools: 'run_command, read_file, write_file …',
        desc: 'Run commands, read/write files, clipboard',
      },
      {
        name: 'Memory',
        tools: 'save_memory, delete_memory',
        desc: 'Saves or deletes memories only on explicit request',
      },
    ],
    stats: [
      { value: '2', label: 'work modes' },
      { value: '5', label: 'built-in skills' },
      { value: '0', label: 'accounts / databases' },
      { value: '100%', label: 'local storage' },
    ],
    docLinks: [
      { to: '/docs/weci-readme.en', title: 'Handbook', desc: 'Features, install, config, structure' },
      { to: '/plugins', title: 'Plugin development', desc: 'SDK, manifest, tools, permissions' },
      { to: '/docs/weci-readme.zh-CN', title: '使用手册 (中文)', desc: 'Chinese documentation' },
    ],
    quickStart: [
      { k: 'API Endpoint', v: 'https://api.openai.com/v1' },
      { k: 'API Key', v: 'sk-… (kept in the browser only)' },
      { k: 'Model', v: 'gpt-4o-mini / deepseek-chat / llama3.1' },
      { k: 'Local server', v: 'Ollama · http://127.0.0.1:11434/v1' },
    ],
    installNotePre: 'The key can also live server-side: copy',
    installNoteMid: 'to',
    installNotePost: 'and set WECI_API_KEY, leaving the frontend empty.',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    ctaTitlePre: 'Local-first, starting with one',
    ctaTitlePost: '',
  },
}

const c = computed(() => CONTENT[locale.value] || CONTENT['zh-CN'])
const features = computed(() => c.value.features)
const modes = computed(() => c.value.modes)
const skills = computed(() => c.value.skills)
const stats = computed(() => c.value.stats)
const docLinks = computed(() => c.value.docLinks)
const quickStart = computed(() => c.value.quickStart)
</script>

<template>
  <div class="home">
    <!-- ============================ Hero ============================ -->
    <section class="hero">
      <div class="container hero__inner">
        <span class="hero__badge">{{ t('home.hero.badge') }}</span>

        <h1 class="hero__title">
          {{ t('home.hero.title1') }}<br />
          {{ t('home.hero.title2') }}<span class="hero__accent">{{ t('home.hero.accent') }}</span
          >{{ t('home.hero.title3') }}
        </h1>

        <p class="hero__lead">{{ t('home.hero.lead') }}</p>

        <div class="hero__actions">
          <a :href="GITHUB" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
            {{ t('home.hero.github') }}
          </a>
          <RouterLink :to="docLinks[0].to" class="btn btn--ghost">
            {{ t('home.hero.docs') }}
          </RouterLink>
        </div>

        <div class="hero__stats">
          <div v-for="s in stats" :key="s.label" class="hero__stat">
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================ 功能 ============================ -->
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ t('home.features.eyebrow') }}</span>
          <h2>{{ t('home.features.title') }}</h2>
          <p>{{ t('home.features.desc') }}</p>
        </div>

        <div class="grid grid--3">
          <FeatureCard
            v-for="f in features"
            :key="f.title"
            :icon="f.icon"
            :title="f.title"
            :desc="f.desc"
            :tags="f.tags"
          />
        </div>
      </div>
    </section>

    <!-- ============================ Chat vs Agent ============================ -->
    <section class="section section--alt">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ t('home.modes.eyebrow') }}</span>
          <h2>{{ t('home.modes.title') }}</h2>
          <p>{{ t('home.modes.desc') }}</p>
        </div>

        <div class="grid grid--2">
          <article v-for="m in modes" :key="m.name" class="mode card">
            <header class="mode__head">
              <h3>{{ m.name }}</h3>
              <span class="mode__tagline">{{ m.tagline }}</span>
            </header>
            <ul class="mode__list">
              <li v-for="p in m.points" :key="p">{{ p }}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================ 安装 ============================ -->
    <section class="section">
      <div class="container install">
        <div class="install__text">
          <span class="eyebrow">{{ t('home.install.eyebrow') }}</span>
          <h2>{{ t('home.install.title') }}</h2>
          <p>{{ t('home.install.desc') }}</p>

          <ul class="install__tips">
            <li v-for="item in quickStart" :key="item.k">
              <span class="install__k">{{ item.k }}</span>
              <span class="install__v">{{ item.v }}</span>
            </li>
          </ul>
        </div>

        <div class="install__code">
          <div class="code-block">
            <div class="code-block__bar">
              <span class="code-block__lang">bash</span>
              <button class="code-block__copy" type="button" @click="copyInstall">
                {{ copied ? c.copiedLabel : c.copyLabel }}
              </button>
            </div>
            <pre class="code-block__pre"><code>{{ installCmd }}</code></pre>
          </div>
          <p class="install__note">
            {{ c.installNotePre }} <code>.env.example</code> {{ c.installNoteMid }}
            <code>.env</code> {{ c.installNotePost }}
          </p>
        </div>
      </div>
    </section>

    <!-- ============================ 内置技能 ============================ -->
    <section class="section section--alt">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ t('home.skills.eyebrow') }}</span>
          <h2>{{ t('home.skills.title') }}</h2>
          <p>{{ t('home.skills.desc') }}</p>
        </div>

        <div class="table-wrap">
          <table class="skills">
            <thead>
              <tr>
                <th>{{ t('home.skills.col.name') }}</th>
                <th>{{ t('home.skills.col.tools') }}</th>
                <th>{{ t('home.skills.col.desc') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in skills" :key="s.name">
                <td class="skills__name">{{ s.name }}</td>
                <td><code>{{ s.tools }}</code></td>
                <td class="skills__desc">{{ s.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="skills__warn">{{ t('home.skills.warn') }}</p>
      </div>
    </section>

    <!-- ============================ 文档入口 ============================ -->
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ t('home.docs.eyebrow') }}</span>
          <h2>{{ t('home.docs.title') }}</h2>
          <p>{{ t('home.docs.desc') }}</p>
        </div>

        <div class="grid grid--3">
          <RouterLink v-for="d in docLinks" :key="d.to" :to="d.to" class="doc-card card">
            <h3>{{ d.title }}</h3>
            <p>{{ d.desc }}</p>
            <span class="doc-card__arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ============================ CTA ============================ -->
    <section class="cta">
      <div class="container cta__inner">
        <h2>
          {{ c.ctaTitlePre }} <code>weci serve</code> {{ c.ctaTitlePost }}
        </h2>
        <p>{{ t('home.cta.desc') }}</p>
        <div class="cta__actions">
          <a :href="GITHUB" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
            {{ t('home.cta.github') }}
          </a>
          <RouterLink to="/plugins" class="btn btn--ghost">{{ t('home.cta.plugins') }}</RouterLink>
          <a :href="PLUGHUB" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
            {{ t('home.cta.community') }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------------------------- Hero ---------------------------- */
.hero {
  position: relative;
  padding: 96px 0 72px;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--hero-glow);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  max-width: 860px;
  text-align: center;
}

.hero__badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--bg-elev);
  color: var(--text-dim);
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  margin-bottom: 26px;
}

.hero__title {
  margin: 0 0 22px;
  font-size: clamp(2.1rem, 5.2vw, 3.5rem);
  line-height: 1.18;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.hero__accent {
  background: linear-gradient(120deg, var(--accent), #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__lead {
  margin: 0 auto 34px;
  max-width: 660px;
  color: var(--text-dim);
  font-size: 1.06rem;
  line-height: 1.8;
}

.hero__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero__stat strong {
  font-size: 1.6rem;
  font-family: var(--font-mono);
  letter-spacing: -0.02em;
}

.hero__stat span {
  color: var(--text-faint);
  font-size: 0.82rem;
}

/* ---------------------------- 模式卡片 ---------------------------- */
.mode {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mode__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.mode__head h3 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 1.15rem;
}

.mode__tagline {
  color: var(--text-faint);
  font-size: 0.84rem;
}

.mode__list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.9;
}

/* ---------------------------- 安装 ---------------------------- */
.install {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 48px;
  align-items: center;
}

.install__text h2 {
  margin: 0 0 14px;
  font-size: clamp(1.5rem, 2.6vw, 1.9rem);
  letter-spacing: -0.02em;
}

.install__text p {
  margin: 0 0 20px;
  color: var(--text-dim);
  font-size: 0.95rem;
  line-height: 1.8;
}

.install__tips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.install__tips li {
  display: flex;
  gap: 12px;
  align-items: baseline;
  font-size: 0.87rem;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-elev);
}

.install__k {
  flex: 0 0 108px;
  color: var(--text-faint);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.install__v {
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  word-break: break-all;
}

.install__code .code-block {
  margin: 0;
}

.install__note {
  margin: 14px 0 0;
  color: var(--text-faint);
  font-size: 0.82rem;
  line-height: 1.7;
}

/* ---------------------------- 技能表 ---------------------------- */
.skills {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.skills th {
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-faint);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.skills td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.skills__name {
  font-weight: 600;
  white-space: nowrap;
}

.skills__desc {
  color: var(--text-dim);
}

.skills__warn {
  margin: 18px 0 0;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--amber) 35%, var(--border));
  background: color-mix(in srgb, var(--amber) 8%, transparent);
  color: var(--text-dim);
  font-size: 0.86rem;
  line-height: 1.7;
}

/* ---------------------------- 文档卡片 ---------------------------- */
.doc-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text);
}

.doc-card:hover {
  text-decoration: none;
}

.doc-card h3 {
  margin: 0;
  font-size: 1rem;
}

.doc-card p {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.87rem;
}

.doc-card__arrow {
  margin-top: auto;
  padding-top: 8px;
  color: var(--accent);
  font-size: 0.9rem;
}

/* ---------------------------- CTA ---------------------------- */
.cta {
  padding: 72px 0 88px;
  border-top: 1px solid var(--border);
  background: var(--hero-glow), var(--bg-elev);
}

.cta__inner {
  text-align: center;
}

.cta__inner h2 {
  margin: 0 0 12px;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  letter-spacing: -0.02em;
}

.cta__inner p {
  margin: 0 0 28px;
  color: var(--text-dim);
}

.cta__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .install {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }

  .hero__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
}

@media (max-width: 640px) {
  .install__tips li {
    flex-direction: column;
    gap: 4px;
  }

  .install__k {
    flex: none;
  }
}
</style>
