# Doctoory — Shopify Custom Liquid Sections

Two ready-to-paste sections styled to match doctoory.com (blue `#2563eb`, soft-blue cards, rounded corners).

**How to add:** In the Shopify theme editor → **Add section** → **Custom Liquid** → paste the code below → Save.

---

## Section 1 — "Why Doctoory" Services (3 cards + button)

```liquid
<style>
  .dct-services { padding: 60px 20px; background: #f8faff; font-family: inherit; }
  .dct-services__inner { max-width: 1200px; margin: 0 auto; text-align: center; }
  .dct-services__badge { display: inline-block; background: #e8effe; color: #2563eb; font-weight: 600; font-size: 14px; padding: 8px 20px; border-radius: 999px; margin-bottom: 16px; }
  .dct-services__title { font-size: 36px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
  .dct-services__title span { color: #2563eb; }
  .dct-services__subtitle { font-size: 17px; color: #64748b; max-width: 640px; margin: 0 auto 48px; line-height: 1.6; }
  .dct-services__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
  .dct-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px 28px; text-align: center; transition: transform .25s ease, box-shadow .25s ease; }
  .dct-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(37, 99, 235, 0.12); }
  .dct-card__icon { width: 64px; height: 64px; margin: 0 auto 20px; background: #e8effe; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
  .dct-card__title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 10px; }
  .dct-card__text { font-size: 15px; color: #64748b; line-height: 1.6; margin: 0; }
  .dct-btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 16px 40px; border-radius: 999px; font-weight: 600; font-size: 16px; text-decoration: none; transition: background .2s ease, transform .2s ease; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3); }
  .dct-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
  @media (max-width: 900px) { .dct-services__grid { grid-template-columns: 1fr; } .dct-services__title { font-size: 28px; } }
</style>

<section class="dct-services">
  <div class="dct-services__inner">
    <span class="dct-services__badge">Smarter Homecare</span>
    <h2 class="dct-services__title">More Than a Store — <span>A Complete Health Companion</span></h2>
    <p class="dct-services__subtitle">
      Doctoory brings clinical care, recovery programs, and medical equipment together —
      making healthcare more accessible and effective, right from your home.
    </p>

    <div class="dct-services__grid">
      <div class="dct-card">
        <div class="dct-card__icon">🏠</div>
        <h3 class="dct-card__title">Home Clinical Services</h3>
        <p class="dct-card__text">Physical therapy, specialist doctors, nursing, imaging, and lab work — delivered to your doorstep.</p>
      </div>
      <div class="dct-card">
        <div class="dct-card__icon">💪</div>
        <h3 class="dct-card__title">Home-Exercise Programs</h3>
        <p class="dct-card__text">Technology-driven orthopedic recovery programs designed by experts, guided step by step.</p>
      </div>
      <div class="dct-card">
        <div class="dct-card__icon">🩺</div>
        <h3 class="dct-card__title">Medical Equipment</h3>
        <p class="dct-card__text">Monitoring devices, braces, and walking aids — available to buy or rent with fast delivery.</p>
      </div>
    </div>

    <a href="https://www.doctoory.com/" class="dct-btn" target="_blank" rel="noopener">
      Explore Doctoory.com →
    </a>
  </div>
</section>
```

---

## Section 2 — CTA Banner (blue gradient + white button)

```liquid
<style>
  .dct-cta { padding: 40px 20px; font-family: inherit; }
  .dct-cta__box { max-width: 1200px; margin: 0 auto; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 24px; padding: 64px 40px; text-align: center; position: relative; overflow: hidden; }
  .dct-cta__box::before { content: ""; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); top: -120px; right: -80px; }
  .dct-cta__box::after { content: ""; position: absolute; width: 220px; height: 220px; border-radius: 50%; background: rgba(255, 255, 255, 0.06); bottom: -100px; left: -60px; }
  .dct-cta__badge { display: inline-block; background: rgba(255, 255, 255, 0.15); color: #ffffff; font-weight: 600; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 20px; border-radius: 999px; margin-bottom: 20px; position: relative; z-index: 1; }
  .dct-cta__title { font-size: 34px; font-weight: 700; color: #ffffff; margin: 0 0 14px; position: relative; z-index: 1; }
  .dct-cta__text { font-size: 17px; color: rgba(255, 255, 255, 0.85); max-width: 560px; margin: 0 auto 36px; line-height: 1.6; position: relative; z-index: 1; }
  .dct-cta__btn { display: inline-block; background: #ffffff; color: #2563eb !important; padding: 16px 44px; border-radius: 999px; font-weight: 700; font-size: 16px; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); position: relative; z-index: 1; }
  .dct-cta__btn:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0, 0, 0, 0.2); }
  .dct-cta__note { display: block; margin-top: 18px; font-size: 14px; color: rgba(255, 255, 255, 0.7); position: relative; z-index: 1; }
  @media (max-width: 900px) { .dct-cta__title { font-size: 26px; } .dct-cta__box { padding: 48px 24px; } }
</style>

<section class="dct-cta">
  <div class="dct-cta__box">
    <span class="dct-cta__badge">Doctoory · Smarter Homecare</span>
    <h2 class="dct-cta__title">Unlock The Potential Of Home Care</h2>
    <p class="dct-cta__text">
      All the medical supplies, home services, and recovery programs you need in one place
      &mdash; at the click of a button.
    </p>
    <a href="https://www.doctoory.com/" class="dct-cta__btn" target="_blank" rel="noopener">
      Visit Our Main Website
    </a>
    <span class="dct-cta__note">Online consultations &amp; home visits — coming soon</span>
  </div>
</section>
```

---

## Section 3 — Home-Exercise Programs (split layout + button to programs page)

Links to: **https://www.doctoory.com/services/exercise-programs/**

```liquid
<style>
  .dct-programs { padding: 60px 20px; background: #ffffff; font-family: inherit; }
  .dct-programs__inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .dct-programs__badge { display: inline-block; background: #e8effe; color: #2563eb; font-weight: 600; font-size: 14px; padding: 8px 20px; border-radius: 999px; margin-bottom: 16px; }
  .dct-programs__title { font-size: 34px; font-weight: 700; color: #0f172a; margin: 0 0 14px; line-height: 1.25; }
  .dct-programs__title span { color: #2563eb; }
  .dct-programs__text { font-size: 16px; color: #64748b; line-height: 1.7; margin: 0 0 24px; }
  .dct-programs__list { list-style: none; padding: 0; margin: 0 0 32px; }
  .dct-programs__list li { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: #334155; margin-bottom: 14px; line-height: 1.5; }
  .dct-programs__check { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #2563eb; color: #ffffff; font-size: 13px; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
  .dct-programs__btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 15px 36px; border-radius: 999px; font-weight: 600; font-size: 16px; text-decoration: none; transition: background .2s ease, transform .2s ease; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3); }
  .dct-programs__btn:hover { background: #1d4ed8; transform: translateY(-2px); }
  .dct-programs__visual { background: linear-gradient(160deg, #e8effe 0%, #f8faff 100%); border-radius: 24px; padding: 40px 32px; }
  .dct-step { display: flex; align-items: center; gap: 16px; background: #ffffff; border-radius: 14px; padding: 18px 20px; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); }
  .dct-step:last-child { margin-bottom: 0; }
  .dct-step__num { flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center; }
  .dct-step__title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
  .dct-step__text { font-size: 13px; color: #64748b; margin: 0; }
  @media (max-width: 900px) { .dct-programs__inner { grid-template-columns: 1fr; gap: 32px; } .dct-programs__title { font-size: 27px; } }
</style>

<section class="dct-programs">
  <div class="dct-programs__inner">
    <div>
      <span class="dct-programs__badge">Home-Exercise Programs</span>
      <h2 class="dct-programs__title">Recover Faster With <span>Expert-Designed Programs</span></h2>
      <p class="dct-programs__text">
        Technology-driven orthopedic recovery programs you can follow from home —
        built by specialists and tailored to your condition, step by step.
      </p>
      <ul class="dct-programs__list">
        <li><span class="dct-programs__check">✓</span> Personalized plans designed by orthopedic experts</li>
        <li><span class="dct-programs__check">✓</span> Guided video exercises you can do anywhere</li>
        <li><span class="dct-programs__check">✓</span> Track your progress and stay motivated</li>
      </ul>
      <a href="https://www.doctoory.com/services/exercise-programs/" class="dct-programs__btn" target="_blank" rel="noopener">
        See Exercise Programs →
      </a>
    </div>

    <div class="dct-programs__visual">
      <div class="dct-step">
        <div class="dct-step__num">1</div>
        <div>
          <p class="dct-step__title">Tell Us About Your Condition</p>
          <p class="dct-step__text">Answer a few quick questions about your recovery goals.</p>
        </div>
      </div>
      <div class="dct-step">
        <div class="dct-step__num">2</div>
        <div>
          <p class="dct-step__title">Get Your Personalized Program</p>
          <p class="dct-step__text">Receive a plan built by specialists just for you.</p>
        </div>
      </div>
      <div class="dct-step">
        <div class="dct-step__num">3</div>
        <div>
          <p class="dct-step__title">Exercise &amp; Recover At Home</p>
          <p class="dct-step__text">Follow guided sessions and track your improvement.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## Section 4 — Health Blog (my pick: topic cards + button to blog page)

Links to: **https://www.doctoory.com/blog/**

```liquid
<style>
  .dct-blog { padding: 60px 20px; background: #f8faff; font-family: inherit; }
  .dct-blog__inner { max-width: 1200px; margin: 0 auto; text-align: center; }
  .dct-blog__badge { display: inline-block; background: #e8effe; color: #2563eb; font-weight: 600; font-size: 14px; padding: 8px 20px; border-radius: 999px; margin-bottom: 16px; }
  .dct-blog__title { font-size: 34px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
  .dct-blog__title span { color: #2563eb; }
  .dct-blog__subtitle { font-size: 16px; color: #64748b; max-width: 600px; margin: 0 auto 44px; line-height: 1.6; }
  .dct-blog__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 44px; }
  .dct-blog-card { display: block; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; text-decoration: none; text-align: start; transition: transform .25s ease, box-shadow .25s ease; }
  .dct-blog-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(37, 99, 235, 0.12); }
  .dct-blog-card__top { height: 110px; display: flex; align-items: center; justify-content: center; font-size: 44px; background: linear-gradient(135deg, #e8effe 0%, #dbeafe 100%); }
  .dct-blog-card__body { padding: 22px 24px 26px; }
  .dct-blog-card__tag { display: inline-block; font-size: 12px; font-weight: 700; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
  .dct-blog-card__title { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 8px; line-height: 1.4; }
  .dct-blog-card__text { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 14px; }
  .dct-blog-card__link { font-size: 14px; font-weight: 600; color: #2563eb; }
  .dct-blog__btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 16px 40px; border-radius: 999px; font-weight: 600; font-size: 16px; text-decoration: none; transition: background .2s ease, transform .2s ease; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3); }
  .dct-blog__btn:hover { background: #1d4ed8; transform: translateY(-2px); }
  @media (max-width: 900px) { .dct-blog__grid { grid-template-columns: 1fr; } .dct-blog__title { font-size: 27px; } }
</style>

<section class="dct-blog">
  <div class="dct-blog__inner">
    <span class="dct-blog__badge">Health Tips &amp; Advice</span>
    <h2 class="dct-blog__title">Learn From Our <span>Health Blog</span></h2>
    <p class="dct-blog__subtitle">
      Expert articles on recovery, home care, and using your medical equipment the right way —
      written by the Doctoory team.
    </p>

    <div class="dct-blog__grid">
      <a href="https://www.doctoory.com/blog/" class="dct-blog-card" target="_blank" rel="noopener">
        <div class="dct-blog-card__top">🦴</div>
        <div class="dct-blog-card__body">
          <span class="dct-blog-card__tag">Recovery</span>
          <p class="dct-blog-card__title">Orthopedic Recovery Tips You Can Start Today</p>
          <p class="dct-blog-card__text">Simple, expert-backed habits that speed up healing at home.</p>
          <span class="dct-blog-card__link">Read more →</span>
        </div>
      </a>
      <a href="https://www.doctoory.com/blog/" class="dct-blog-card" target="_blank" rel="noopener">
        <div class="dct-blog-card__top">🩹</div>
        <div class="dct-blog-card__body">
          <span class="dct-blog-card__tag">Equipment Guides</span>
          <p class="dct-blog-card__title">How To Choose The Right Brace Or Walking Aid</p>
          <p class="dct-blog-card__text">A practical guide to picking the support that fits your needs.</p>
          <span class="dct-blog-card__link">Read more →</span>
        </div>
      </a>
      <a href="https://www.doctoory.com/blog/" class="dct-blog-card" target="_blank" rel="noopener">
        <div class="dct-blog-card__top">❤️</div>
        <div class="dct-blog-card__body">
          <span class="dct-blog-card__tag">Home Care</span>
          <p class="dct-blog-card__title">Monitoring Your Health At Home The Right Way</p>
          <p class="dct-blog-card__text">Get accurate readings from blood pressure and glucose devices.</p>
          <span class="dct-blog-card__link">Read more →</span>
        </div>
      </a>
    </div>

    <a href="https://www.doctoory.com/blog/" class="dct-blog__btn" target="_blank" rel="noopener">
      Read Our Blog →
    </a>
  </div>
</section>
```

---

## Notes

- All class names are prefixed with `dct-` so they won't conflict with your theme's CSS.
- All links open in a new tab (`target="_blank"`). Destinations: Sections 1 & 2 → **doctoory.com** home, Section 3 → **/services/exercise-programs/**, Section 4 → **/blog/**. Swap any `href` to point elsewhere (e.g. `/download/ios/`, `/download/android/`).
- Colors used: primary blue `#2563eb`, dark blue `#1e40af`, soft blue `#e8effe`, dark text `#0f172a`, gray text `#64748b` — matching the store branding.
- To change any text (Arabic version, different headlines), just edit the text between the HTML tags — the styling stays the same.
- Fully responsive: cards stack into one column and font sizes shrink below 900px width.
