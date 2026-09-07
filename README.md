# Nida ❤️ — Birthday Surprise Journey

A cinematic, multi-day birthday microsite made for **Nida** by **Kabir**.

Static HTML / CSS / Vanilla JS + GSAP. No frameworks. No backend.

---

## Quick start

1. Open the `nida-birthday` folder.
2. Add your photos (see below).
3. Optionally add music: `assets/audio/romantic.mp3`.
4. Open `index.html` in a browser, **or** deploy the folder to any static host.

For best results (audio + local file security), serve the folder locally:

```bash
# Python
python -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:8080`.

---

## Add your photos

Replace these files (keep the exact names):

| File | Suggested content |
|------|-------------------|
| `assets/images/nida-1.jpg` | Photo of Nida |
| `assets/images/nida-2.jpg` | Another photo of Nida |
| `assets/images/couple-1.jpg` | Kabir + Nida |
| `assets/images/couple-2.jpg` | Kabir + Nida |

Until you add them, elegant placeholders appear automatically. The site still works fully.

---

## Add music (optional)

Place a romantic track at:

```
assets/audio/romantic.mp3
```

Use the **♫ Play our song** button on any page. Music never autoplays (browser policy). If the file is missing, the site still works.

---

## Configuration (one place)

Edit `js/main.js`:

```js
const birthdayConfig = {
  birthdayYear: 2026,
  birthdayMonth: 9, // September
  birthdayDay: 15,
  birthdayHour: 12, // 12:00 PM noon
  birthdayMinute: 0,
  password: "01052025",
  name: "Nida",
  from: "Kabir",
};
```

Countdown targets **September 15 at 12:00 PM** in your local timezone. Change `birthdayYear` when you reuse the site next year.

**Final unlock password:** `01052025`  
(Do not put the password in social captions or Open Graph text.)

---

## Daily Link Schedule

Send **one link at a time**. Pages no longer link to each other — each day is its own surprise.

| Day | Page | Suggested send time | Message idea |
|-----|------|---------------------|--------------|
| Day 0 / Intro | `index.html` | When you start the journey | “Open this when you’re free ❤️” |
| Day 1 | `day-1.html` | Night 1 | “A little secret…” |
| Day 2 | `day-2.html` | Night 2 | “Things I love about you” |
| Day 3 | `day-3.html` | Night 3 | “Some memories…” |
| Day 4 | `day-4.html` | Night 4 | “I wrote you something” |
| Day 5 | `day-5.html` | Night 5 | “Quick quiz ❤️” |
| Day 6 | `day-6.html` | Night before birthday | “Almost…” |
| **Sept 15** | `birthday.html` | Midnight / morning | “For you. You’ll need the password.” |

### Suggested calendar (2026)

Assuming birthday = **September 15, 2026**:

- **Sept 9** → `index.html` or `day-1.html`
- **Sept 10** → `day-2.html`
- **Sept 11** → `day-3.html`
- **Sept 12** → `day-4.html`
- **Sept 13** → `day-5.html`
- **Sept 14** → `day-6.html`
- **Sept 15** → `birthday.html`

Adjust the start day if you want a longer or shorter journey.

---

## How to deploy

### Option A — Netlify Drop
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `nida-birthday` folder
3. Copy the generated URL

### Option B — Vercel
1. Install Vercel CLI or use the dashboard
2. Import / deploy the folder as a static project

### Option C — GitHub Pages
1. Push this folder to a GitHub repo
2. Settings → Pages → Deploy from branch / `/` root
3. Use the `*.github.io` URL

### Option D — Cloudflare Pages
1. Create a project → upload assets
2. Share the project URL

After deploy, your links look like:

```
https://YOUR-SITE.netlify.app/index.html
https://YOUR-SITE.netlify.app/day-1.html
https://YOUR-SITE.netlify.app/day-2.html
https://YOUR-SITE.netlify.app/day-3.html
https://YOUR-SITE.netlify.app/day-4.html
https://YOUR-SITE.netlify.app/day-5.html
https://YOUR-SITE.netlify.app/day-6.html
https://YOUR-SITE.netlify.app/birthday.html
```

---

## How to send links manually (WhatsApp / iMessage)

Browsers **cannot** automatically send WhatsApp messages at midnight from a static website. That would require a server, WhatsApp Business API, or a phone automation tool.

**Do this instead:**

1. Deploy the site and copy each page URL.
2. Save them in your Notes app as a checklist.
3. At ~12:00 AM each night, paste that day’s link into WhatsApp and send it.
4. On September 15, send `birthday.html` and tell her the password separately (or in person).

### Optional: scheduled automation later

If you want automation later (not built into this site):

- **iPhone Shortcuts** + Personal Automations (time of day → send message)
- **Android** Tasker / similar
- **Google Calendar** reminders that ping you to send the link
- A future small backend + WhatsApp Cloud API (paid / more complex)

This project intentionally does **not** fake automatic WhatsApp sending.

---

## Password & date behavior

- `birthday.html` always requires password `01052025`.
- Before September 15, the page may show “The final surprise isn't ready yet” + a countdown — she can still unlock with the password.
- Wrong password shows: *Almost... but that's not the secret ❤️*
- This is romantic UX, not security. Anyone with the password can open it.

---

## Project structure

```
nida-birthday/
├── index.html
├── day-1.html … day-6.html
├── birthday.html
├── css/style.css
├── js/
│   ├── main.js          # config, cursor, particles, music, transitions
│   ├── animations.js    # GSAP helpers
│   ├── countdown.js     # reusable countdown
│   └── birthday.js      # lock + final experience
├── assets/images/
└── assets/audio/
```

---

## Tips for the best moment

1. Test every page on your phone before sending.
2. Add real photos — they make Day 3 and the final gallery feel personal.
3. Pick a song that means something to both of you.
4. Send Day 6 the night before; send the final link at midnight or when she wakes up.
5. Tell her the password in a cute way (note, call, or separately).

Made with love for Nida.
