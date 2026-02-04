# winded.vertigo Static Site

A modern, minimal static site mirror of windedvertigo.com.

## Structure

```
windedvertigo-mirror/
├── public/
│   ├── images/           # Add your images here
│   │   ├── logo.png      # Main logo
│   │   ├── favicon.png   # Browser favicon
│   │   └── ...           # Project images, etc.
│   └── styles/
│       └── main.css      # All styles
├── pages/
│   ├── index.html        # Homepage
│   ├── what/
│   │   └── index.html    # What page
│   ├── we/
│   │   └── index.html    # Team page
│   ├── do/
│   │   └── index.html    # Services page
│   └── projects/
│       ├── impactful-five/
│       │   └── index.html
│       └── play-for-all-accelerator/
│           └── index.html
└── README.md
```

## Quick Start (Local Development)

The simplest way to preview locally:

```bash
# Using Python (built into most systems)
cd windedvertigo-mirror/public
python3 -m http.server 8000

# Then visit http://localhost:8000
```

Or with Node.js:
```bash
npx serve public
```

## Deploying to GitHub Pages (Free)

### Option 1: Direct Deploy (Easiest)

1. Create a new GitHub repository (e.g., `windedvertigo-site`)
2. Upload the contents of the `public/` folder to the repo
3. Go to Settings → Pages
4. Set Source to "Deploy from a branch" and select `main` branch
5. Your site will be live at `https://yourusername.github.io/windedvertigo-site`

### Option 2: Custom Domain

1. Follow Option 1 steps
2. In Settings → Pages, add your custom domain (e.g., `windedvertigo.com`)
3. Update your domain's DNS:
   - Add a CNAME record pointing to `yourusername.github.io`
   - Or add A records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
4. Create a file `public/CNAME` containing just: `windedvertigo.com`

## Alternative Hosting Options

### Netlify (Recommended for ease)
1. Connect your GitHub repo at netlify.com
2. Set publish directory to `public/`
3. Custom domain setup is straightforward in their dashboard

### Cloudflare Pages
1. Connect repo at pages.cloudflare.com
2. Build command: (none needed)
3. Output directory: `public/`

### Vercel
1. Import repo at vercel.com
2. Framework: Other
3. Output directory: `public/`

## Making Edits

### Content Changes
Edit the HTML files directly in the `pages/` folder. The content is straightforward HTML.

### Style Changes
Edit `public/styles/main.css`. Key variables are at the top:

```css
:root {
  --bg-dark: #0a0a0a;        /* Background color */
  --text-primary: #ffffff;    /* Main text */
  --text-secondary: #a0a0a0;  /* Secondary text */
  /* ... etc */
}
```

### Adding Images
1. Add images to `public/images/`
2. Reference them in HTML as `/images/yourimage.png`

### Adding New Pages
1. Create a new folder in `pages/` (e.g., `pages/newpage/`)
2. Add an `index.html` file inside
3. Add navigation links in all pages' `<nav>` sections

## TODO: Before Launch

- [ ] Add actual logo image (`public/images/logo.png`)
- [ ] Add favicon (`public/images/favicon.png`)
- [ ] Add project images
- [ ] Download team headshots if desired
- [ ] Test all links
- [ ] Set up custom domain

## Benefits Over WordPress

- **Speed**: Static files load instantly
- **Security**: No database, no vulnerabilities
- **Cost**: Free hosting on GitHub/Netlify/Cloudflare
- **Version Control**: Track all changes in Git
- **Simplicity**: Edit HTML directly, no CMS login needed
- **Claude-friendly**: I can help you edit content directly!

## Need Help?

Just share the files with me and I can help you:
- Update content
- Add new pages
- Adjust styling
- Add interactive features
- Debug issues

