# Manual Cloudflare Console Actions

Most production setup has been automated. These items require the Cloudflare dashboard because the current Wrangler OAuth token does not expose Access Apps/Policies Write permission, and no custom domain has been provided.

## 1. Protect Admin With Cloudflare Access

Location:

- Cloudflare Dashboard: `https://dash.cloudflare.com`
- Click `Zero Trust`
- Click `Access`
- Click `Applications`
- Click `Add an application`
- Choose `Self-hosted`

Input:

- Application name: `Nordic Editorial Journal Admin`
- Session duration: `24 hours`
- Application domain:
  - Subdomain: `lewis-blog`
  - Domain: `pages.dev`
- Path:
  - `/admin/*`

Then add a second protected path in the same application if the UI supports multiple paths:

- Path:
  - `/api/admin/*`

If the UI does not support multiple paths in one application, create a second Self-hosted application:

- Application name: `Nordic Editorial Journal Admin API`
- Application domain:
  - Subdomain: `lewis-blog`
  - Domain: `pages.dev`
- Path:
  - `/api/admin/*`

Policy:

- Policy name: `Owner only`
- Action: `Allow`
- Include selector: `Emails`
- Email value: `junqi21263@gmail.com`

Expected screen:

- `Applications` list shows `Nordic Editorial Journal Admin`.
- The application domain/path shows `journal.lewislee.online/admin/*`.
- Policy shows `Allow` and `Emails: junqi21263@gmail.com`.

Verification:

```bash
curl -I https://journal.lewislee.online/admin/
curl -i -X POST https://journal.lewislee.online/api/admin/posts
```

Expected:

- Browser visit to `/admin/` redirects to Cloudflare Access login.
- Unauthenticated API write returns `401` or Cloudflare Access login/deny response.

## 2. Bind Custom Domain

Only do this after you decide the domain, for example `example.com` or `journal.example.com`.

Location:

- Cloudflare Dashboard
- Click `Workers & Pages`
- Click `lewis-blog`
- Click `Custom domains`
- Click `Set up a custom domain`

Input:

- Domain: `<your-domain>`

Expected screen:

- Custom domain status becomes `Active`.
- SSL/TLS status is `Active`.
- The domain opens the same site as `https://journal.lewislee.online`.

After binding, update these files:

- `src/data/site.ts`
- `functions/rss.xml.ts`
- `functions/sitemap.xml.ts`

Replace:

```txt
https://journal.lewislee.online
```

With:

```txt
https://<your-domain>
```

Then redeploy:

```bash
npm run build
npx wrangler pages deploy ./out --project-name lewis-blog --branch production --commit-hash 0000000000000000000000000000000000000000 --commit-message "Production deployment with custom domain" --commit-dirty=true
```

## 3. Optional Analytics Tokens

Location in code:

- `src/data/creator.ts`

Inputs:

- Cloudflare Web Analytics token
- Umami website id
- Umami script URL
- Giscus repository config
- Buttondown action URL

Expected screen:

- View source includes analytics scripts only after tokens are configured.
- Article pages show Giscus comments instead of the quiet placeholder.
