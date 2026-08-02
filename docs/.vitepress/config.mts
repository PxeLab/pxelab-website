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
  collapsed?: boolean
}

// 全局侧边栏:所有页面显示同一套完整导航(一级二级平铺,无下拉)
const sidebarDef: Record<string, SidebarGroupDef[]> = {
  '/': [
    {
      zh: '产品',
      en: 'Product',
      items: [
        { zh: '产品定位', en: 'Product Overview', link: '/product' },
        { zh: '功能特性', en: 'Features', link: '/features' },
        { zh: '常见问题', en: 'FAQ', link: '/faq' },
      ],
    },
    {
      zh: '快速开始',
      en: 'Getting Started',
      items: [
        { zh: '快速开始', en: 'Getting Started', link: '/getting-started' },
      ],
    },
    {
      zh: '教程',
      en: 'Tutorials',
      items: [
        { zh: '教程 1：给裸机装 Ubuntu', en: 'Tutorial 1: Install Ubuntu on a Bare Metal Machine', link: '/tutorials/install-ubuntu' },
        { zh: '教程 2：在现有 DHCP 网络上叠加 PXE', en: 'Tutorial 2: Layer PXE onto an Existing DHCP Network', link: '/tutorials/add-pxe-to-existing-dhcp' },
        { zh: '教程 3：搭建无盘工作站', en: 'Tutorial 3: Build a Diskless Workstation', link: '/tutorials/diskless-workstation' },
      ],
    },
    {
      zh: '使用指南',
      en: 'Guides',
      items: [
        { zh: '界面速览', en: 'UI Overview', link: '/guides/web-ui' },
        { zh: '仪表盘', en: 'Dashboard', link: '/guides/dashboard' },
        { zh: '服务配置', en: 'Service Config', link: '/guides/services' },
        { zh: '文件管理', en: 'Files', link: '/guides/files' },
        { zh: '引导配置', en: 'Profiles', link: '/guides/profiles' },
        { zh: '应答文件模板', en: 'Answer Templates', link: '/guides/answer-templates' },
        { zh: 'DHCP 配置', en: 'DHCP Config', link: '/guides/dhcp' },
        { zh: '引导菜单配置', en: 'Boot Config', link: '/guides/boot-config' },
        { zh: '网络启动目录', en: 'Netboot Catalog', link: '/guides/netboot' },
        { zh: 'OS 镜像管理', en: 'OS Images', link: '/guides/os-images' },
        { zh: '主机管理', en: 'Host Management', link: '/guides/host-management' },
        { zh: '访问控制', en: 'Access Control', link: '/guides/access-control' },
        { zh: '安装任务', en: 'Install Tasks', link: '/guides/install-tasks' },
        { zh: 'BMC 带外管理', en: 'BMC / IPMI', link: '/guides/bmc' },
        { zh: 'WOL 网络唤醒', en: 'Wake-on-LAN', link: '/guides/wol' },
        { zh: '网络诊断', en: 'Network Diagnostics', link: '/guides/network-diagnostics' },
        { zh: '监控', en: 'Monitoring', link: '/guides/monitoring' },
        { zh: '设置', en: 'Settings', link: '/guides/settings' },
        { zh: '部署模式', en: 'Deployment', link: '/guides/deployment' },
      ],
    },
    {
      zh: '进阶主题',
      en: 'Advanced Topics',
      items: [
        { zh: '架构概述', en: 'Architecture', link: '/guides/architecture' },
        { zh: '引导架构与无盘启动', en: 'Boot Architecture & Diskless', link: '/guides/boot-architecture' },
        { zh: 'DHCP 模式详解', en: 'DHCP Modes', link: '/guides/dhcp-modes' },
        { zh: 'iPXE 设置指南', en: 'iPXE Settings Guide', link: '/guides/ipxe-settings-guide' },
        { zh: 'PXELinux 兼容与迁移', en: 'PXELinux Compatibility & Migration', link: '/guides/pxelinux-migration' },
        { zh: '性能与大规模部署', en: 'Performance & Large-Scale Deployment', link: '/guides/scale-and-performance' },
      ],
    },
    {
      zh: '开发指南',
      en: 'Development',
      items: [
        { zh: 'REST API 快速上手', en: 'REST API Quick Start', link: '/development/api-quickstart' },
        { zh: '自动化与 CI 集成', en: 'Automation & CI Integration', link: '/development/automation' },
        { zh: '自定义 iPXE 编译', en: 'Custom iPXE Build', link: '/development/ipxe-build' },
        { zh: '参与开发', en: 'Contributing', link: '/development/contributing' },
      ],
    },
    {
      zh: '参考文档',
      en: 'Reference',
      items: [
        { zh: 'TFTP 服务', en: 'TFTP Service', link: '/reference/tftp' },
        { zh: 'DNS 服务', en: 'DNS Service', link: '/reference/dns' },
        { zh: 'NFS 服务', en: 'NFS Service', link: '/reference/nfs' },
        { zh: '架构映射与 Secure Boot', en: 'Architecture Mapping & Secure Boot', link: '/reference/boot-settings' },
        { zh: '配置文件', en: 'Config File', link: '/reference/config-file' },
        { zh: 'REST API', en: 'REST API', link: '/reference/api-reference' },
        { zh: '环境变量与 CLI', en: 'Environment Variables & CLI', link: '/reference/environment-variables' },
        { zh: '日志配置', en: 'Logging', link: '/reference/logging' },
      ],
    },
    {
      zh: '其他',
      en: 'Others',
      items: [
        { zh: '术语表', en: 'Glossary', link: '/glossary' },
        { zh: '版本历史', en: 'Release Notes', link: '/release-notes' },
        { zh: '故障排查', en: 'Troubleshooting', link: '/troubleshooting' },
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
      collapsed: g.collapsed ?? false,
    }))
  }
  return result
}

const zhSidebar = buildSidebar('', 'zh')
const enSidebar = buildSidebar('/en', 'en')

export default defineConfig({
  base,
  title: 'PxeLab',
  description: '一个二进制，多种架构，下载即用 — 一体化 PXE 网络引导服务器',
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
          { text: '开始使用', link: '/getting-started', activeMatch: '/product|/features|/faq|/getting-started|/tutorials/|/reference/' },
          { text: '使用指南', link: '/guides/dashboard', activeMatch: '/guides/' },
          { text: '开发指南', link: '/development/contributing', activeMatch: '/development/' },
          { text: '网站首页', link: 'https://www.pxelab.com/' },
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
      description: 'PXE in minutes, all-in-one binary — all-in-one PXE network boot server',
      themeConfig: {
        nav: [
          { text: 'Getting Started', link: '/en/getting-started', activeMatch: '/en/product|/en/features|/en/faq|/en/getting-started|/en/tutorials/|/en/reference/' },
          { text: 'Guides', link: '/en/guides/dashboard', activeMatch: '/en/guides/' },
          { text: 'Development', link: '/en/development/contributing', activeMatch: '/en/development/' },
          { text: 'Website', link: 'https://www.pxelab.com/' },
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
