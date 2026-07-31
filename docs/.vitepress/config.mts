import { defineConfig } from 'vitepress'

const rawBase = process.env.VITEPRESS_BASE
const base = rawBase
  ? rawBase.startsWith('/')
    ? rawBase.endsWith('/') ? rawBase : `${rawBase}/`
    : `/${rawBase}/`
  : '/'

interface SidebarItemDef {
  zh: string
  en: string
  link: string
}

interface SidebarGroupDef {
  zh: string
  en: string
  items: SidebarItemDef[]
}

const sidebarDef: Record<string, SidebarGroupDef[]> = {
  '/': [
    {
      zh: '产品',
      en: 'Product',
      items: [
        { zh: '产品定位', en: 'Product Overview', link: '/product' },
        { zh: '功能特性', en: 'Features', link: '/features' },
        { zh: '优势能力', en: 'Advantages', link: '/advantages' },
        { zh: '架构优势', en: 'Architecture Advantages', link: '/architecture-advantages' },
        { zh: '常见问题', en: 'FAQ', link: '/faq' },
      ],
    },
    {
      zh: '进阶',
      en: 'Advanced',
      items: [
        { zh: '引导架构', en: 'Boot Architecture', link: '/boot-architecture' },
        { zh: 'iPXE 设置指南', en: 'iPXE Settings Guide', link: '/ipxe-settings-guide' },
      ],
    },
  ],
  '/guides/': [
    {
      zh: '概览',
      en: 'Overview',
      items: [
        { zh: '仪表盘', en: 'Dashboard', link: '/guides/dashboard' },
      ],
    },
    {
      zh: '基础配置',
      en: 'Basic Configuration',
      items: [
        { zh: '服务配置', en: 'Service Config', link: '/guides/services' },
        { zh: '文件管理', en: 'Files', link: '/guides/files' },
        { zh: '引导配置', en: 'Profiles', link: '/guides/profiles' },
        { zh: '应答文件模板', en: 'Answer Templates', link: '/guides/answer-templates' },
        { zh: 'DHCP 配置', en: 'DHCP Config', link: '/guides/dhcp' },
        { zh: '引导菜单配置', en: 'Boot Config', link: '/guides/boot-config' },
        { zh: '网络启动目录', en: 'Netboot Catalog', link: '/guides/netboot' },
        { zh: 'OS 镜像管理', en: 'OS Images', link: '/guides/os-images' },
      ],
    },
    {
      zh: '管理',
      en: 'Management',
      items: [
        { zh: '主机管理', en: 'Host Management', link: '/guides/host-management' },
        { zh: '访问控制', en: 'Access Control', link: '/guides/access-control' },
        { zh: '安装任务', en: 'Install Tasks', link: '/guides/install-tasks' },
        { zh: 'BMC 带外管理', en: 'BMC / IPMI', link: '/guides/bmc' },
        { zh: 'WOL 网络唤醒', en: 'Wake-on-LAN', link: '/guides/wol' },
        { zh: '网络诊断', en: 'Network Diagnostics', link: '/guides/network-diagnostics' },
      ],
    },
    {
      zh: '监控',
      en: 'Monitoring',
      items: [
        { zh: '监控', en: 'Monitoring', link: '/guides/monitoring' },
      ],
    },
    {
      zh: '其他',
      en: 'Others',
      items: [
        { zh: '设置', en: 'Settings', link: '/guides/settings' },
        { zh: 'Web UI 总览', en: 'Web UI Guide', link: '/guides/web-ui' },
        { zh: '部署模式', en: 'Deployment', link: '/guides/deployment' },
      ],
    },
  ],
  '/reference/': [
    {
      zh: '服务参考',
      en: 'Service Reference',
      items: [
        { zh: 'TFTP 服务', en: 'TFTP Service', link: '/reference/tftp' },
        { zh: 'DNS 服务', en: 'DNS Service', link: '/reference/dns' },
        { zh: 'NFS 服务', en: 'NFS Service', link: '/reference/nfs' },
        { zh: '架构映射与 Secure Boot', en: 'Architecture Mapping & Secure Boot', link: '/reference/boot-settings' },
        { zh: 'iPXE 编译', en: 'iPXE Custom Build', link: '/reference/ipxe-build' },
      ],
    },
    {
      zh: '配置参考',
      en: 'Configuration Reference',
      items: [
        { zh: '配置文件', en: 'Config File', link: '/reference/config-file' },
        { zh: 'REST API', en: 'REST API', link: '/reference/api-reference' },
        { zh: '环境变量与 CLI', en: 'Environment Variables & CLI', link: '/reference/environment-variables' },
        { zh: '日志配置', en: 'Logging', link: '/reference/logging' },
      ],
    },
  ],
}

function buildSidebar(localePrefix: '' | '/en', lang: 'zh' | 'en') {
  const result: Record<string, any[]> = {}
  for (const [key, groups] of Object.entries(sidebarDef)) {
    result[`${localePrefix}${key}`] = groups.map(g => ({
      text: g[lang],
      items: g.items.map(item => ({
        text: item[lang],
        link: `${localePrefix}${item.link}`,
      })),
    }))
  }
  return result
}

const zhSidebar = buildSidebar('', 'zh')
const enSidebar = buildSidebar('/en', 'en')

export default defineConfig({
  base,
  title: 'PxeLab',
  description: '一体化 PXE 网络引导服务器',
  ignoreDeadLinks: false,
  srcExclude: [
    'IMPLEMENTATION_PLAN.md',
    'VERIFICATION-GUIDE.md',
    'dev-plan.md',
    'README.md',
  ],

  appearance: 'dark',

  head: [
    ['meta', { name: 'theme-color', content: '#060709' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
  ],

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '产品', link: '/product', activeMatch: '/product|features|advantages|architecture-advantages|faq' },
          { text: '快速开始', link: '/getting-started', activeMatch: '/getting-started' },
          { text: '使用指南', link: '/guides/dashboard', activeMatch: '/guides/' },
          { text: '参考文档', link: '/reference/api-reference', activeMatch: '/reference/' },
        ],
        sidebar: zhSidebar,
        outline: [2, 3],
        search: { provider: 'local' },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/PxeLab/pxelab' },
        ],
        footer: {
          message: 'PxeLab - 一体化 PXE 网络引导服务器',
          copyright: `Copyright © ${new Date().getFullYear()} PxeLab`,
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'PxeLab',
      description: 'All-in-one PXE network boot server',
      themeConfig: {
        nav: [
          { text: 'Product', link: '/en/product', activeMatch: '/en/product|features|advantages|architecture-advantages|faq' },
          { text: 'Getting Started', link: '/en/getting-started', activeMatch: '/en/getting-started' },
          { text: 'Guides', link: '/en/guides/dashboard', activeMatch: '/en/guides/' },
          { text: 'Reference', link: '/en/reference/api-reference', activeMatch: '/en/reference/' },
        ],
        sidebar: enSidebar,
        outline: [2, 3],
        search: { provider: 'local' },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/PxeLab/pxelab' },
        ],
        footer: {
          message: 'PxeLab - All-in-one PXE Network Boot Server',
          copyright: `Copyright © ${new Date().getFullYear()} PxeLab`,
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    outline: [2, 3],
    search: { provider: 'local' },
  },
})
