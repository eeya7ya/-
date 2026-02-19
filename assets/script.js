/* ========================================
   قهوة أبو حصان — Main Script
   ======================================== */

'use strict';

/* ── Cursor ── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  /* Hover state on interactive elements */
  const hoverEls = 'a, button, .product-card, .menu-item, .feature-card, .filter-tab, .add-btn, .nav__link';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });

  /* Hide cursor when leaving window */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ── Navbar scroll effect ── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Mobile toggle */
  const toggle = document.querySelector('.nav__toggle');
  const links  = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    /* Close on link click */
    links.querySelectorAll('.nav__link').forEach(l => {
      l.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }
})();

/* ── Scroll-reveal ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── Particle canvas ── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COLORS = ['#c9922a', '#e8b84b', '#ff9955', '#f5e6cf'];
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function () {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H + H;
    this.r    = Math.random() * 1.8 + 0.4;
    this.vx   = (Math.random() - 0.5) * 0.4;
    this.vy   = -(Math.random() * 0.5 + 0.3);
    this.life = 0;
    this.maxL = Math.random() * 250 + 150;
    this.clr  = COLORS[Math.floor(Math.random() * COLORS.length)];
  };

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.maxL) this.reset();
  };

  Particle.prototype.draw = function () {
    const alpha = Math.sin((this.life / this.maxL) * Math.PI) * 0.7;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.clr;
    ctx.globalAlpha = alpha;
    ctx.fill();
  };

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => {
      const p = new Particle();
      p.y = Math.random() * H;   /* scatter on load */
      p.life = Math.floor(Math.random() * p.maxL);
      return p;
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
  loop();
})();

/* ======================================
   MARKET PAGE — Cart & Filters
   ====================================== */

/* ── Filter tabs ── */
(function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.cat;
      document.querySelectorAll('.product-card').forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
        if (match) {
          card.style.animation = 'fadeUp 0.4s ease both';
        }
      });
    });
  });
})();

/* ── Search ── */
(function initSearch() {
  const input = document.querySelector('.search-box__input');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const name = (card.querySelector('.product-card__name')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.product-card__desc')?.textContent || '').toLowerCase();
      card.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  });
})();

/* ── Cart ── */
(function initCart() {
  const fab     = document.getElementById('cart-fab');
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('cart-close');
  const itemsEl  = document.getElementById('cart-items');
  const totalEl  = document.getElementById('cart-total-value');
  const countEl  = document.querySelector('.cart-fab__count');

  if (!fab || !drawer) return;

  let cart = [];

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }

  fab.addEventListener('click', openCart);
  overlay?.addEventListener('click', closeCart);
  closeBtn?.addEventListener('click', closeCart);

  function renderCart() {
    if (!itemsEl) return;
    itemsEl.innerHTML = '';

    if (!cart.length) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty__icon">☕</span>
          <p>سلة المشتريات فارغة</p>
        </div>`;
      if (totalEl) totalEl.textContent = '0 ريال';
      if (countEl) countEl.textContent = '0';
      renderRecommendations([]);
      return;
    }

    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <span class="cart-item__emoji">${item.emoji}</span>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${item.price} ريال</div>
        </div>
        <button class="cart-item__remove" data-idx="${idx}" title="إزالة">✕</button>`;
      itemsEl.appendChild(el);
    });

    itemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.splice(Number(btn.dataset.idx), 1);
        renderCart();
      });
    });

    if (totalEl) totalEl.textContent = total + ' ريال';
    if (countEl) countEl.textContent = cart.length;

    renderRecommendations(cart);
  }

  /* Add to cart buttons */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;
    const card = btn.closest('.product-card');
    if (!card) return;

    const name  = card.querySelector('.product-card__name')?.textContent || '';
    const price = parseInt(card.querySelector('.product-card__price')?.dataset.price || '0', 10);
    const emoji = card.querySelector('.product-card__placeholder-icon')?.textContent || '☕';
    const cat   = card.dataset.cat || '';

    cart.push({ name, price, emoji, cat });
    renderCart();

    /* Pulse animation on FAB */
    fab.classList.add('pulse');
    setTimeout(() => fab.classList.remove('pulse'), 400);

    /* Mini toast */
    showToast('تمت الإضافة إلى السلة ✓');
  });

  /* Add recommended items to cart */
  document.addEventListener('rec:add', e => {
    cart.push(e.detail);
    renderCart();
    fab.classList.add('pulse');
    setTimeout(() => fab.classList.remove('pulse'), 400);
    showToast('تمت الإضافة إلى السلة ✓');
  });

  renderCart();
})();

/* ── Toast notification ── */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:5rem; left:50%; transform:translateX(-50%);
      background:linear-gradient(135deg,#c9922a,#e8b84b);
      color:#0d0a08; font-family:'Tajawal',sans-serif; font-weight:700;
      padding:.6rem 1.6rem; border-radius:99px; z-index:9999;
      box-shadow:0 4px 20px rgba(201,146,42,.55);
      opacity:0; transition:opacity .3s; direction:rtl; font-size:.95rem;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

/* ── AI Product Recommender ── */
(function initRecommender() {
  /* Full product catalog with semantic tags for scoring */
  const CATALOG = [
    { name: 'قهوة عربية أصيلة',         price: 12, emoji: '☕', cat: 'arabic',  tags: ['hot','traditional','spiced','light'] },
    { name: 'قهوة بالزعفران',            price: 16, emoji: '🫖', cat: 'arabic',  tags: ['hot','traditional','spiced','premium','floral'] },
    { name: 'قهوة دارك روست',            price: 14, emoji: '🌰', cat: 'arabic',  tags: ['hot','strong','bold'] },
    { name: 'إسبريسو مضاعف',             price: 15, emoji: '🍵', cat: 'espresso',tags: ['hot','strong','bold','concentrate'] },
    { name: 'كافيه لاتيه',               price: 18, emoji: '🥛', cat: 'espresso',tags: ['hot','milky','smooth','creamy'] },
    { name: 'كابتشينو',                  price: 18, emoji: '☁️', cat: 'espresso',tags: ['hot','milky','foamy','balanced'] },
    { name: 'موكا',                      price: 20, emoji: '🍫', cat: 'espresso',tags: ['hot','sweet','chocolate','indulgent'] },
    { name: 'قهوة باردة مثلّجة',         price: 20, emoji: '🧊', cat: 'cold',    tags: ['cold','refreshing','iced','strong'] },
    { name: 'فرابيه كراميل',              price: 22, emoji: '🧋', cat: 'cold',    tags: ['cold','sweet','caramel','indulgent','creamy'] },
    { name: 'ماتشا لاتيه بارد',          price: 22, emoji: '💚', cat: 'cold',    tags: ['cold','healthy','floral','milky'] },
    { name: 'شاي مغربي بالنعنع',         price: 10, emoji: '🍃', cat: 'tea',     tags: ['hot','refreshing','minty','traditional'] },
    { name: 'تشاي هندي',                 price: 15, emoji: '🫚', cat: 'tea',     tags: ['hot','spiced','milky','warm','creamy'] },
    { name: 'كركديه بارد',                price: 12, emoji: '🌸', cat: 'tea',     tags: ['cold','refreshing','floral','healthy'] },
    { name: 'صوص الكراميل',               price:  3, emoji: '🍮', cat: 'extras',  tags: ['extra','sweet','caramel','topping'] },
    { name: 'مقياس إضافي من القهوة',      price:  4, emoji: '🫙', cat: 'extras',  tags: ['extra','strong','bold','concentrate'] },
    { name: 'حليب نباتي (لوز / شوفان)',   price:  5, emoji: '🥛', cat: 'extras',  tags: ['extra','vegan','healthy','milky'] },
  ];

  /* What each category naturally pairs with */
  const PAIRING_BOOSTS = {
    arabic:  ['spiced', 'traditional', 'floral', 'extra'],
    espresso:['milky', 'sweet', 'creamy', 'extra', 'chocolate'],
    cold:    ['cold', 'refreshing', 'sweet', 'extra'],
    tea:     ['healthy', 'floral', 'minty', 'extra'],
    extras:  [],
  };

  function score(product, cartNames, cartCats, cartTags, boostTags, avgPrice) {
    let s = 0;
    /* Exclude items already in cart */
    if (cartNames.has(product.name)) return -1;

    /* Semantic tag overlap with cart */
    product.tags.forEach(t => {
      if (cartTags.includes(t)) s += 1.5;
    });

    /* Pairing boost: tags recommended by cart categories */
    product.tags.forEach(t => {
      if (boostTags.includes(t)) s += 2.5;
    });

    /* Extras always complement drinks */
    if (product.cat === 'extras' && cartCats.some(c => c !== 'extras')) s += 1.5;

    /* Category diversity: suggest something different from the dominant category */
    const dominant = cartCats[0];
    if (dominant && product.cat !== dominant && product.cat !== 'extras') s += 1.5;

    /* Price proximity bonus */
    if (Math.abs(product.price - avgPrice) <= 6) s += 0.5;

    return s;
  }

  /* Exposed globally so renderCart can call it */
  window.getAIRecommendations = function (cart) {
    if (!cart.length) return [];

    const cartNames = new Set(cart.map(i => i.name));
    const cartCats  = [...new Set(cart.map(i => i.cat).filter(Boolean))];
    const cartTags  = cart.flatMap(i => {
      const entry = CATALOG.find(p => p.name === i.name);
      return entry ? entry.tags : [];
    });
    const boostTags = cartCats.flatMap(c => PAIRING_BOOSTS[c] || []);
    const avgPrice  = cart.reduce((s, i) => s + i.price, 0) / cart.length;

    return CATALOG
      .map(p => ({ ...p, _score: score(p, cartNames, cartCats, cartTags, boostTags, avgPrice) }))
      .filter(p => p._score >= 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);
  };
})();

/* Render AI recommendation panel inside the cart drawer */
function renderRecommendations(cart) {
  const panel = document.getElementById('cart-recommendations');
  if (!panel) return;

  const recs = (typeof getAIRecommendations === 'function') ? getAIRecommendations(cart) : [];

  if (!recs.length) {
    panel.innerHTML = '';
    return;
  }

  panel.innerHTML = `
    <div class="cart-rec__header">
      <span>✨</span>
      <span>يُقترح لك أيضاً</span>
      <span class="cart-rec__ai-badge">AI</span>
    </div>
    <div class="cart-rec__list">
      ${recs.map(p => `
        <div class="cart-rec__item"
             data-name="${p.name}"
             data-price="${p.price}"
             data-emoji="${p.emoji}"
             data-cat="${p.cat}">
          <span class="cart-rec__emoji">${p.emoji}</span>
          <div class="cart-rec__info">
            <div class="cart-rec__name">${p.name}</div>
            <div class="cart-rec__price">${p.price} ريال</div>
          </div>
          <button class="cart-rec__add" aria-label="أضف ${p.name} إلى السلة">＋</button>
        </div>
      `).join('')}
    </div>`;

  /* Bind add-to-cart for recommended items */
  panel.querySelectorAll('.cart-rec__add').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.cart-rec__item');
      /* Dispatch to the existing cart via a CustomEvent */
      document.dispatchEvent(new CustomEvent('rec:add', {
        detail: {
          name:  item.dataset.name,
          price: parseInt(item.dataset.price, 10),
          emoji: item.dataset.emoji,
          cat:   item.dataset.cat,
        }
      }));
    });
  });
}

/* ── Active nav link ── */
(function setActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (
      (href.includes('market') && path.includes('market')) ||
      (href === 'index.html' && (path === '/' || path.endsWith('index.html'))) ||
      (href === './' && (path === '/' || path.endsWith('/')))
    ) {
      link.classList.add('active');
    }
  });
})();
