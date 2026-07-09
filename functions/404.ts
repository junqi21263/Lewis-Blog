const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>404 | Lewis Photograph Blog</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #111111;
      color: #f3f1ee;
      font-family: Inter, system-ui, sans-serif;
    }
    main { max-width: 40rem; padding: 3rem 1.5rem; }
    h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: clamp(3rem, 8vw, 5rem); margin: 0 0 1rem; }
    p { color: #c5c1bb; line-height: 1.7; margin: 0 0 1.5rem; }
    a { color: #f3f1ee; text-transform: uppercase; letter-spacing: .2em; font-size: .75rem; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <h1>404</h1>
    <p>The requested page is not available in the journal archive.</p>
    <a href="/zh/">Return Home</a>
  </main>
</body>
</html>`;

export const onRequestGet: PagesFunction<Env> = () =>
  new Response(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
