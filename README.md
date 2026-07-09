# Lewis Photograph Blog

> A multilingual photography journal and personal image archive, built on Cloudflare Pages, D1, R2, and a custom editorial CMS.
>
> 一个运行在 Cloudflare Pages、D1 与 R2 上的多语言摄影博客与个人影像归档系统。

[中文](#中文) · [English](#english)

<!-- Add screenshots here -->

## 中文

Lewis Photograph Blog 不是通用博客模板，而是一套为长期摄影记录设计的个人出版系统。它将文章、影像、器材、影片与日常碎片放进同一套克制的编辑语言中，并通过自研 CMS 管理多语言内容、媒体资产与发布状态。

### Features

- Nordic editorial style photography blog
- 自研 Editorial CMS
- 简体中文、繁体中文与英文内容
- Journal / Gallery / Gear / Films / About / Fragments
- Markdown 编辑器、封面上传与正文图片上传
- 分类、标签、草稿、发布与归档工作流
- Cloudflare Access 保护的后台与上传接口
- SEO、Sitemap、RSS、Canonical 与 Hreflang
- Giscus 评论
- Umami / Cloudflare Analytics 支持
- 响应式桌面、平板与移动端设计

### Tech Stack

`Next.js` · `React` · `TypeScript` · `Cloudflare Pages` · `Pages Functions` · `D1` · `R2` · `Wrangler` · `OpenCC` · `DeepSeek API` · `Giscus` · `Umami`

### Project Structure

```text
src/app/         Next.js 页面、路由与后台 CMS
src/components/  前台、编辑器与通用媒体组件
functions/       Cloudflare Pages Functions 与 API
migrations/      D1 数据库迁移
scripts/         构建、数据恢复与运维脚本
public/          静态资源与站点图标
```

### Environment Variables

以下变量应通过 Cloudflare Pages、Wrangler secrets 或本地 `.dev.vars` 配置，不要提交真实值：

```bash
DEEPSEEK_API_KEY=
ADMIN_EMAILS=
UMAMI_WEBSITE_ID=
UMAMI_SCRIPT_URL=
GISCUS_REPO=
GISCUS_REPO_ID=
GISCUS_CATEGORY=
GISCUS_CATEGORY_ID=
```

CMS 英文翻译与 Fragments 设备、心情建议统一使用 `DEEPSEEK_API_KEY`。未配置时会保留源语言或使用本地建议，不阻塞保存与发布。

### Local Development

```bash
npm install
npm run dev
```

提交前验证：

```bash
npm run lint
npm run typecheck
npm run build
```

### Cloudflare Deployment

部署前需要准备：

- Cloudflare Pages project
- 名为 `DB` 的 D1 binding
- 名为 `ASSETS_BUCKET` 的 R2 binding
- 保护 `/admin/*` 与 `/api/admin/*` 的 Cloudflare Access application
- 可选的自定义域名、Workers AI 与 Vectorize bindings

构建后可通过 Wrangler 发布：

```bash
npm run build
npx wrangler pages deploy ./out --project-name <your-pages-project> --branch production
```

### Security Notice

- `/admin/*` 与 `/api/admin/*` 必须由 Cloudflare Access 保护。
- 不要把生产密钥、Access 凭据或真实 `.dev.vars` 提交到仓库。
- R2 上传与删除接口必须要求 Access 身份验证。
- 发布开源副本前，请检查 D1 seed、导出文件和图片 metadata 中是否包含私人信息。

### Roadmap

- Better mobile CMS editing
- Image detail pages
- City / camera / lens archive
- Photography map
- Newsletter integration

## English

Lewis Photograph Blog is a personal publishing system for long-form photographic practice rather than a general-purpose blog template. It brings journals, photographs, equipment notes, films, and daily fragments into one restrained editorial archive, managed through a custom multilingual CMS.

### Features

- Editorial-style photography blog
- Custom CMS
- Multilingual content: `zh-CN` / `zh-TW` / `en-US`
- Cloudflare Pages deployment
- D1 database and R2 image storage
- Cloudflare Access-protected admin
- Journal / Gallery / Gear / Films / About / Fragments
- Markdown editor, cover upload, and inline image upload
- Categories, tags, drafts, publishing, and archiving
- SEO, sitemap, RSS, canonical URLs, and hreflang
- Giscus comments
- Umami / Cloudflare Analytics support
- Responsive design

### Local Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

### Cloudflare Deployment

Create a Pages project, bind a D1 database as `DB`, bind an R2 bucket as `ASSETS_BUCKET`, protect the admin routes with Cloudflare Access, and attach a custom domain if required. Keep production secrets in Cloudflare or Wrangler secrets rather than source control.

### License

License TBD.
