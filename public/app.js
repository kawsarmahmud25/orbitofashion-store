/* ORBITO FASHION storefront — API থেকে ডেটা, ব্যর্থ হলে বিল্ট-ইন seed ডেটা */
(function () {
  'use strict';

  /* ---------- Utilities ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function tk(n) { return '৳ ' + Number(n || 0).toLocaleString('bn-BD'); }
  function toast(msg, isErr) {
    var w = $('toastWrap');
    var t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : '');
    t.innerHTML = '<i class="fa-solid ' + (isErr ? 'fa-circle-exclamation' : 'fa-circle-check') + '"></i><span></span>';
    t.querySelector('span').textContent = msg;
    w.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2200);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); var a = arguments, s = this; t = setTimeout(function () { fn.apply(s, a); }, ms); }; }

  /* ---------- Fallback seed (API না পৌঁছালে) ---------- */
  var IMG = function (id) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=600&q=80'; };
  var FALLBACK = {
    settings: { brand_name: 'ORBITO FASHION', whatsapp_number: '8801700000000', helpline: '০১৭০০-০০০০০০', address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ', delivery_inside: '60', delivery_outside: '120' },
    categories: [
      { id: 1, name: 'পাঞ্জাবি', image: IMG('photo-1610030469983-98e550d6193c') },
      { id: 2, name: 'জামদানি ও শাড়ি', image: IMG('photo-1583391733956-3750e0ff4e8b') },
      { id: 3, name: 'সালোয়ার কামিজ', image: IMG('photo-1515886657613-9f3515b0c78f') },
      { id: 4, name: 'কুর্তি ও টপস', image: IMG('photo-1551163943-3f6a855d1153') },
      { id: 5, name: 'টি-শার্ট ও পোলো', image: IMG('photo-1521572267360-ee0c2909d518') },
      { id: 6, name: 'ক্যাজুয়াল শার্ট', image: IMG('photo-1596755094514-f87e34085b2c') },
      { id: 7, name: 'বোরকা ও হিজাব', image: IMG('photo-1566454544259-f4b94c3d758c') },
      { id: 8, name: 'জিন্স ও গ্যাবার্ডিন', image: IMG('photo-1541099649105-f69ad21f3246') }
    ],
    sliders: [
      { id: 1, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80', badge: 'উৎসব কালেকশন', title: 'দেশীয় সুতায় বোনা আভিজাত্যের ছোঁয়া', subtitle: 'ঢাকাই জামদানি ও হাতে বোনা ঐতিহ্যবাহী পোশাক', button_text: 'এখনই কিনুন' },
      { id: 2, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80', badge: 'মেগা ফ্ল্যাশ সেল', title: 'সকল পোশাকে সর্বোচ্চ ৪০% পর্যন্ত মূল্যছাড়', subtitle: 'সীমিত সময়ের অফার — স্টক শেষ হওয়ার আগেই নিন', button_text: 'অফার দেখুন' },
      { id: 3, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', badge: 'গরমের আরাম', title: '১০০% পিওর কটন সামার কালেকশন', subtitle: 'নরম, আরামদায়ক ও টেকসই গ্রীষ্মের পোশাক', button_text: 'কালেকশন দেখুন' }
    ],
    products: [
      { id: 1, name: 'ঢাকাইয়া হাফ সিল্ক জামদানি', category_id: 2, category_name: 'জামদানি ও শাড়ি', price: 2450, old_price: 3000, image: IMG('photo-1583391733956-3750e0ff4e8b'), badge: 'হট ডিল', sizes: '["M","L","XL"]', stock: 25, description: 'ঢাকার ঐতিহ্যবাহী হাতে বোনা হাফ সিল্ক জামদানি।', is_trending: 1, is_new: 0 },
      { id: 2, name: 'প্রিমিয়াম কটন এমব্রয়ডারি পাঞ্জাবি', category_id: 1, category_name: 'পাঞ্জাবি', price: 1650, old_price: 2100, image: IMG('photo-1617137984095-74e4e5e3613f'), badge: '-২০%', sizes: '["M","L","XL","XXL"]', stock: 40, description: 'প্রিমিয়াম কটন কাপড়ে নিখুঁত এমব্রয়ডারি কাজ।', is_trending: 1, is_new: 0 },
      { id: 3, name: 'মসলিন কারচুপি থ্রি-পিস', category_id: 3, category_name: 'সালোয়ার কামিজ', price: 2200, old_price: 0, image: IMG('photo-1515886657613-9f3515b0c78f'), badge: '', sizes: '["S","M","L","XL"]', stock: 30, description: 'মসলিন কাপড়ে হাতের কারচুপি কাজের থ্রি-পিস সেট।', is_trending: 1, is_new: 0 },
      { id: 4, name: 'ড্রপ শোল্ডার ওভারসাইজ টি-শার্ট', category_id: 5, category_name: 'টি-শার্ট ও পোলো', price: 550, old_price: 750, image: IMG('photo-1521572267360-ee0c2909d518'), badge: 'বেস্ট সেলার', sizes: '["M","L","XL"]', stock: 100, description: 'ট্রেন্ডি ড্রপ শোল্ডার ফিটের ওভারসাইজ টি-শার্ট।', is_trending: 1, is_new: 0 },
      { id: 5, name: 'লং ফ্লোরাল প্রিন্টেড কুর্তি', category_id: 4, category_name: 'কুর্তি ও টপস', price: 1150, old_price: 0, image: IMG('photo-1551163943-3f6a855d1153'), badge: '', sizes: '["S","M","L","XL"]', stock: 35, description: 'লং ফ্লোরাল প্রিন্টের কুর্তি।', is_trending: 1, is_new: 0 },
      { id: 6, name: 'মেনজ ক্যাজুয়াল লিনেন শার্ট', category_id: 6, category_name: 'ক্যাজুয়াল শার্ট', price: 1350, old_price: 0, image: IMG('photo-1596755094514-f87e34085b2c'), badge: 'নতুন', sizes: '["M","L","XL","XXL"]', stock: 45, description: 'আরামদায়ক লিনেন কাপড়ের ক্যাজুয়াল শার্ট।', is_trending: 0, is_new: 1 },
      { id: 7, name: 'দুবাই চেরি মডেস্ট বোরকা', category_id: 7, category_name: 'বোরকা ও হিজাব', price: 2800, old_price: 0, image: IMG('photo-1539008835657-9e8e9680c956'), badge: 'নতুন', sizes: '["M","L","XL"]', stock: 20, description: 'দুবাই চেরি ফ্যাব্রিকের প্রিমিয়াম মডেস্ট বোরকা।', is_trending: 0, is_new: 1 },
      { id: 8, name: 'চেক ফরমাল অফিস শার্ট', category_id: 6, category_name: 'ক্যাজুয়াল শার্ট', price: 1490, old_price: 0, image: IMG('photo-1602810318383-e386cc2a3ccf'), badge: 'নতুন', sizes: '["M","L","XL","XXL"]', stock: 50, description: 'এলিগ্যান্ট চেক প্যাটার্নের ফরমাল শার্ট।', is_trending: 0, is_new: 1 },
      { id: 9, name: 'রাজশাহী বলাকা সিল্ক পাঞ্জাবি', category_id: 1, category_name: 'পাঞ্জাবি', price: 2450, old_price: 0, image: IMG('photo-1610030469983-98e550d6193c'), badge: 'নতুন', sizes: '["M","L","XL","XXL"]', stock: 25, description: 'রাজশাহীর বিখ্যাত বলাকা সিল্কে তৈরি প্রিমিয়াম পাঞ্জাবি।', is_trending: 0, is_new: 1 },
      { id: 10, name: 'ব্লক প্রিন্ট সুতি টু-পিস', category_id: 3, category_name: 'সালোয়ার কামিজ', price: 1590, old_price: 0, image: IMG('photo-1572804013309-59a88b7e92f1'), badge: 'নতুন', sizes: '["S","M","L","XL"]', stock: 30, description: 'হাতে করা ব্লক প্রিন্টের সুতি টু-পিস।', is_trending: 0, is_new: 1 },
      { id: 11, name: 'পিকে কটন পোলো টি-শার্ট', category_id: 5, category_name: 'টি-শার্ট ও পোলো', price: 790, old_price: 0, image: IMG('photo-1586363104862-3a5e2ab60d99'), badge: '', sizes: '["M","L","XL","XXL"]', stock: 80, description: 'পিকে কটন ফ্যাব্রিকের ক্লাসিক পোলো টি-শার্ট।', is_trending: 0, is_new: 0 },
      { id: 12, name: 'স্লিম ফিট স্ট্রেচ ডেনিম জিন্স', category_id: 8, category_name: 'জিন্স ও গ্যাবার্ডিন', price: 1550, old_price: 1800, image: IMG('photo-1541099649105-f69ad21f3246'), badge: '', sizes: '["30","32","34","36"]', stock: 60, description: 'স্ট্রেচ ডেনিমের স্লিম ফিট জিন্স।', is_trending: 0, is_new: 0 }
    ]
  };

  var DISTRICTS = ['ঢাকা','গাজীপুর','নারায়ণগঞ্জ','নরসিংদী','মানিকগঞ্জ','টাঙ্গাইল','ফরিদপুর','মাদারীপুর','চট্টগ্রাম','কক্সবাজার','কুমিল্লা','ফেনী','নোয়াখালী','সিলেট','রাজশাহী','বগুড়া','পাবনা','রংপুর','দিনাজপুর','খুলনা','যশোর','কুষ্টিয়া','বরিশাল','ময়মনসিংহ'];
  var PAY_LABEL = { cod: 'ক্যাশ অন ডেলিভারি', bkash: 'বিকাশ', nagad: 'নগদ' };

  /* ---------- State ---------- */
  var state = {
    products: [], categories: [], sliders: [], settings: FALLBACK.settings,
    filter: { cat: 'all', q: '', sort: 'default' },
    shown: 10,
    cart: []
  };

  function getSettings() { return Object.assign({}, FALLBACK.settings, state.settings); }

  /* ---------- Data loading ---------- */
  function fetchJson(path) {
    return fetch(path, { headers: { 'Accept': 'application/json' } }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    });
  }
  function loadData() {
    var done = function () { applySettings(); renderAll(); deepLink(); };
    Promise.allSettled([
      fetchJson('/api/products'), fetchJson('/api/categories'),
      fetchJson('/api/sliders'), fetchJson('/api/settings')
    ]).then(function (rs) {
      state.products = rs[0].status === 'fulfilled' && rs[0].value.products ? rs[0].value.products : FALLBACK.products;
      state.categories = rs[1].status === 'fulfilled' && rs[1].value.categories ? rs[1].value.categories : FALLBACK.categories;
      state.sliders = rs[2].status === 'fulfilled' && rs[2].value.sliders ? rs[2].value.sliders : FALLBACK.sliders;
      if (rs[3].status === 'fulfilled' && rs[3].value.settings) state.settings = rs[3].value.settings;
      done();
    });
  }

  function applySettings() {
    var s = getSettings();
    var wa = 'https://wa.me/' + (s.whatsapp_number || '8801700000000');
    ['drawerWa', 'footWa', 'bnWa'].forEach(function (id) { var el = $(id); if (el) el.href = wa; });
    if ($('helplineText')) $('helplineText').textContent = s.helpline || '';
    if ($('footHelpline')) $('footHelpline').textContent = '+৮৮০ ' + (s.helpline || '');
    if ($('footAddress')) $('footAddress').textContent = s.address || '';
    if ($('delIn')) $('delIn').textContent = tk(parseInt(s.delivery_inside, 10) || 60);
    if ($('delOut')) $('delOut').textContent = tk(parseInt(s.delivery_outside, 10) || 120);
    document.title = 'ORBITO FASHION — বাংলাদেশের ফ্যাশন ব্র্যান্ড | পাঞ্জাবি, শাড়ি, কুর্তি অনলাইন';
  }

  /* ---------- Renderers ---------- */
  function productById(id) {
    for (var i = 0; i < state.products.length; i++) if (state.products[i].id == id) return state.products[i];
    return null;
  }
  function sizesOf(p) {
    try { var a = JSON.parse(p.sizes || '[]'); return Array.isArray(a) && a.length ? a : ['M', 'L', 'XL']; }
    catch (e) { return ['M', 'L', 'XL']; }
  }
  function badgeClass(b) {
    if (/নতুন/.test(b)) return 'green';
    if (/^(বেস্ট সেলার)$/.test(b)) return 'amber';
    return '';
  }
  function cardHtml(p) {
    var badge = p.badge ? '<span class="card-badge ' + badgeClass(p.badge) + '">' + esc(p.badge) + '</span>' : '';
    var old = p.old_price > p.price ? '<span class="old-price">' + tk(p.old_price) + '</span>' : '';
    var out = p.stock <= 0 ? '<span class="stock-out">স্টক শেষ</span>' : '<button class="card-add" data-add="' + p.id + '" aria-label="' + esc(p.name) + ' কার্টে যোগ করুন"><i class="fa-solid fa-cart-plus"></i></button>';
    return '<article class="card" data-open="' + p.id + '" tabindex="0" role="button" aria-label="' + esc(p.name) + '">' +
      '<div class="card-img">' + badge +
      '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.src=\'' + IMG('photo-1441984904996-e0b6ba687e04') + '\'">' + out + '</div>' +
      '<div class="card-body"><h3 class="card-name">' + esc(p.name) + '</h3>' +
      '<div class="card-cat">' + esc(p.category_name || '') + '</div>' +
      '<div class="card-price"><span class="price">' + tk(p.price) + '</span>' + old + '</div></div></article>';
  }
  function filteredProducts() {
    var f = state.filter;
    var list = state.products.filter(function (p) {
      if (f.cat !== 'all' && String(p.category_id) !== String(f.cat)) return false;
      if (f.q && p.name.toLowerCase().indexOf(f.q.toLowerCase()) < 0) return false;
      return true;
    });
    if (f.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    else if (f.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });
    return list;
  }
  function renderGrid(elId, list) {
    var el = $(elId);
    if (!list.length) { el.innerHTML = '<p class="cart-empty" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i>কোনো পণ্য পাওয়া যায়নি।</p>'; return; }
    el.innerHTML = list.map(cardHtml).join('');
  }
  function renderAll() {
    renderSlider(); renderCats();
    renderGrid('trendingGrid', state.products.filter(function (p) { return p.is_trending; }));
    renderGrid('newGrid', state.products.filter(function (p) { return p.is_new; }));
    renderFiltered();
    renderDrawerCats(); renderFootCats();
  }
  function renderFiltered() {
    var list = filteredProducts();
    var info = $('resultInfo');
    var parts = [];
    if (state.filter.q) parts.push('“' + state.filter.q + '”');
    if (state.filter.cat !== 'all') {
      var c = state.categories.filter(function (x) { return String(x.id) === String(state.filter.cat); })[0];
      if (c) parts.push(c.name);
    }
    info.textContent = list.length ? (parts.length ? parts.join(' • ') + ' — ' : '') + list.length + 'টি পণ্য পাওয়া গেছে' : 'দুঃখিত, কোনো পণ্য মেলেনি। অন্য কিছু খুঁজে দেখুন।';
    var shown = list.slice(0, state.shown);
    renderGrid('allGrid', shown);
    var more = $('loadMoreWrap');
    if (list.length > state.shown) { more.hidden = false; } else { more.hidden = true; }
  }

  /* ---------- Slider ---------- */
  var slideIdx = 0, slideTimer = null;
  function renderSlider() {
    var track = $('heroTrack'), dots = $('heroDots');
    var slides = state.sliders.length ? state.sliders : FALLBACK.sliders;
    track.innerHTML = slides.map(function (s, i) {
      return '<div class="hero-slide' + (i === 0 ? ' active' : '') + '" role="tabpanel" aria-label="স্লাইড ' + (i + 1) + '">' +
        '<img src="' + esc(s.image) + '" alt="' + esc(s.title) + '"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + '>' +
        '<div class="hero-cap">' +
        (s.badge ? '<span class="hero-badge">' + esc(s.badge) + '</span>' : '') +
        '<h2>' + esc(s.title) + '</h2>' +
        (s.subtitle ? '<p>' + esc(s.subtitle) + '</p>' : '') +
        '<a class="hero-cta" href="#all">' + esc(s.button_text || 'এখনই কিনুন') + ' <i class="fa-solid fa-arrow-left"></i></a>' +
        '</div></div>';
    }).join('');
    dots.innerHTML = slides.map(function (_, i) {
      return '<button role="tab" aria-label="স্লাইড ' + (i + 1) + '" data-dot="' + i + '"' + (i === 0 ? ' class="active"' : '') + '></button>';
    }).join('');
    slideIdx = 0;
    restartAuto();
  }
  function goSlide(i) {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('#heroDots button');
    if (!slides.length) return;
    slideIdx = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === slideIdx); });
    dots.forEach(function (d, k) { d.classList.toggle('active', k === slideIdx); });
  }
  function restartAuto() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(function () { goSlide(slideIdx + 1); }, 4500);
  }

  /* ---------- Categories ---------- */
  function renderCats() {
    var wrap = $('catScroll');
    var html = '<button class="cat-pill' + (state.filter.cat === 'all' ? ' active' : '') + '" data-cat="all" role="listitem"><i class="fa-solid fa-border-all"></i><span>সবগুলো</span></button>';
    html += state.categories.map(function (c) {
      return '<button class="cat-pill' + (String(state.filter.cat) === String(c.id) ? ' active' : '') + '" data-cat="' + c.id + '" role="listitem">' +
        (c.image ? '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy">' : '') +
        '<span>' + esc(c.name) + '</span></button>';
    }).join('');
    wrap.innerHTML = html;
  }
  function renderDrawerCats() {
    var el = $('drawerCats');
    el.innerHTML = state.categories.map(function (c) {
      return '<a href="#all" class="drawer-link" data-dcat="' + c.id + '"><span>' + esc(c.name) + '</span><i class="fa-solid fa-chevron-left"></i></a>';
    }).join('');
  }
  function renderFootCats() {
    var el = $('footCats');
    el.innerHTML = state.categories.slice(0, 5).map(function (c) {
      return '<li><a href="#all" data-dcat="' + c.id + '">' + esc(c.name) + '</a></li>';
    }).join('');
  }

  /* ---------- Cart ---------- */
  function saveCart() { try { localStorage.setItem('orbito_cart', JSON.stringify(state.cart)); } catch (e) {} }
  function loadCart() {
    try {
      var c = JSON.parse(localStorage.getItem('orbito_cart') || '[]');
      if (Array.isArray(c)) state.cart = c.filter(function (i) { return i && i.id && i.qty > 0; });
    } catch (e) { state.cart = []; }
  }
  function cartCount() { return state.cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartSubtotal() {
    return state.cart.reduce(function (s, i) {
      var p = productById(i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }
  function addToCart(id, size, qty) {
    var p = productById(id);
    if (!p) return;
    if (p.stock <= 0) { toast('দুঃখিত, পণ্যটি স্টকে নেই', true); return; }
    size = size || sizesOf(p)[0];
    qty = Math.max(1, Math.min(10, qty || 1));
    var found = null;
    state.cart.forEach(function (i) { if (i.id === p.id && i.size === size) found = i; });
    if (found) found.qty = Math.min(10, found.qty + qty);
    else state.cart.push({ id: p.id, size: size, qty: qty });
    saveCart(); updateBadges(); renderCart();
    toast('কার্টে যোগ হয়েছে: ' + p.name);
  }
  function updateBadges() {
    var n = cartCount(), bn = String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; });
    [['cartBadge'], ['bnBadge']].forEach(function (pair) {
      var el = $(pair[0]);
      if (el) { el.textContent = bn; el.hidden = n === 0; }
    });
  }
  function renderCart() {
    var box = $('cartItems'), foot = $('cartFoot');
    if (!state.cart.length) {
      box.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i>আপনার কার্ট খালি।<br>পছন্দের পোশাক বেছে নিন!</div>';
      foot.hidden = true; return;
    }
    box.innerHTML = state.cart.map(function (i, idx) {
      var p = productById(i.id);
      if (!p) return '';
      return '<div class="ci"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        '<div class="ci-info"><div class="ci-name">' + esc(p.name) + '</div>' +
        '<div class="ci-meta">সাইজ: ' + esc(i.size) + '</div>' +
        '<div class="ci-row"><span class="qty">' +
        '<button data-dec="' + idx + '" aria-label="কমান">−</button><b>' + i.qty + '</b>' +
        '<button data-inc="' + idx + '" aria-label="বাড়ান">+</button></span>' +
        '<span class="ci-price">' + tk(p.price * i.qty) + '</span></div></div>' +
        '<button class="ci-remove" data-rem="' + idx + '" aria-label="মুছুন"><i class="fa-solid fa-trash-can"></i></button></div>';
    }).join('');
    $('cartSubtotal').textContent = tk(cartSubtotal());
    foot.hidden = false;
  }
  function openCart() { $('cartDrawerWrap').hidden = false; renderCart(); document.body.style.overflow = 'hidden'; }
  function closeCart() { $('cartDrawerWrap').hidden = true; document.body.style.overflow = ''; }

  /* ---------- Product modal ---------- */
  var pmState = { id: null, size: null, qty: 1 };
  function openProduct(id) {
    var p = productById(id);
    if (!p) return;
    var sizes = sizesOf(p);
    pmState = { id: p.id, size: sizes[0], qty: 1 };
    var old = p.old_price > p.price ? '<span class="old-price">' + tk(p.old_price) + '</span>' : '';
    var badge = p.badge ? '<span class="card-badge ' + badgeClass(p.badge) + '">' + esc(p.badge) + '</span>' : '';
    $('pmBody').innerHTML =
      '<div class="pm-img">' + badge + '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div>' +
      '<div class="pm-info"><h2 id="pmName">' + esc(p.name) + '</h2>' +
      '<div class="pm-cat">' + esc(p.category_name || '') + '</div>' +
      '<div class="pm-price"><span class="price">' + tk(p.price) + '</span>' + old + '</div>' +
      (p.description ? '<p class="pm-desc">' + esc(p.description) + '</p>' : '') +
      (p.stock <= 0 ? '<p class="stock-out">দুঃখিত, এই পণ্যটি এখন স্টকে নেই।</p>' :
        '<span class="opt-label">সাইজ নির্বাচন করুন</span><div class="size-row">' +
        sizes.map(function (s, i) { return '<button class="size-btn' + (i === 0 ? ' sel' : '') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') +
        '</div><div class="qty-row"><span class="opt-label" style="margin:0">পরিমাণ</span>' +
        '<span class="qty"><button id="pmDec" aria-label="কমান">−</button><b id="pmQty">১</b><button id="pmInc" aria-label="বাড়ান">+</button></span></div>' +
        '<div class="pm-actions">' +
        '<button class="btn-cart" id="pmAdd"><i class="fa-solid fa-cart-plus"></i> কার্টে যোগ করুন</button>' +
        '<button class="btn-primary" id="pmBuy"><i class="fa-solid fa-bolt"></i> এখনই কিনুন</button></div>') +
      '</div>';
    $('productModal').hidden = false;
    document.body.style.overflow = 'hidden';
    if (history.replaceState) history.replaceState(null, '', '/?p=' + p.id);
  }
  function closeProduct() { $('productModal').hidden = true; document.body.style.overflow = ''; if (history.replaceState) history.replaceState(null, '', '/'); }
  function bnNum(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }

  /* ---------- Checkout ---------- */
  function openCheckout() {
    if (!state.cart.length) { toast('কার্ট খালি আছে', true); return; }
    closeCart();
    var s = getSettings();
    var dist = $('coDistrict');
    dist.innerHTML = '<option value="">— জেলা নির্বাচন করুন —</option>' + DISTRICTS.map(function (d) { return '<option value="' + d + '">' + d + '</option>'; }).join('');
    updateSummary();
    $('coError').hidden = true;
    $('checkoutModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeCheckout() { $('checkoutModal').hidden = true; document.body.style.overflow = ''; }
  function currentDelivery() {
    var s = getSettings();
    var d = $('coDistrict').value;
    if (!d) return parseInt(s.delivery_outside, 10) || 120;
    return d === 'ঢাকা' ? (parseInt(s.delivery_inside, 10) || 60) : (parseInt(s.delivery_outside, 10) || 120);
  }
  function updateSummary() {
    var sub = cartSubtotal(), del = currentDelivery();
    $('coSummary').innerHTML =
      '<div class="cart-row"><span>সাবটোটাল (' + bnNum(cartCount()) + 'টি পণ্য)</span><span>' + tk(sub) + '</span></div>' +
      '<div class="cart-row"><span>ডেলিভারি চার্জ</span><span>' + tk(del) + '</span></div>' +
      '<div class="cart-row"><strong>সর্বমোট</strong><strong>' + tk(sub + del) + '</strong></div>';
  }
  function submitOrder(ev) {
    ev.preventDefault();
    var err = $('coError');
    var name = $('coName').value.trim();
    var phone = $('coPhone').value.trim().replace(/[\s-]/g, '');
    var address = $('coAddress').value.trim();
    var district = $('coDistrict').value;
    var pay = (document.querySelector('input[name="pay"]:checked') || {}).value || 'cod';
    function fail(m) { err.textContent = m; err.hidden = false; err.scrollIntoView({ block: 'nearest' }); }
    if (name.length < 3) return fail('আপনার নাম লিখুন (কমপক্ষে ৩ অক্ষর)।');
    if (!/^01[3-9]\d{8}$/.test(phone)) return fail('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01 দিয়ে শুরু)।');
    if (address.length < 10) return fail('ডেলিভারির জন্য সম্পূর্ণ ঠিকানা লিখুন।');
    if (!district) return fail('জেলা নির্বাচন করুন।');
    err.hidden = true;
    var btn = $('coSubmit');
    btn.disabled = true; btn.textContent = 'অর্ডার হচ্ছে...';
    var payload = {
      customer_name: name, phone: phone, address: address, district: district, payment: pay,
      items: state.cart.map(function (i) { return { id: i.id, size: i.size, qty: i.qty }; })
    };
    fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        btn.disabled = false; btn.textContent = 'অর্ডার কনফার্ম করুন';
        if (!res.ok || !res.j.ok) { fail((res.j && res.j.error) || 'অর্ডার করা যায়নি, আবার চেষ্টা করুন।'); return; }
        closeCheckout();
        showSuccess(res.j.id, res.j.total, name, phone, district, pay);
        state.cart = []; saveCart(); updateBadges();
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'অর্ডার কনফার্ম করুন';
        fail('ইন্টারনেট সমস্যা। আবার চেষ্টা করুন।');
      });
  }
  function showSuccess(id, total, name, phone, district, pay) {
    $('okOrderId').textContent = id;
    $('okTotal').textContent = tk(total);
    var s = getSettings();
    var msg = 'আসসালামু আলাইকুম! আমি ORBITO FASHION থেকে অর্ডার করেছি।\nঅর্ডার আইডি: ' + id + '\nনাম: ' + name + '\nমোবাইল: ' + phone + '\nজেলা: ' + district + '\nপেমেন্ট: ' + (PAY_LABEL[pay] || pay) + '\nসর্বমোট: ' + tk(total);
    $('okWa').href = 'https://wa.me/' + (s.whatsapp_number || '8801700000000') + '?text=' + encodeURIComponent(msg);
    $('successModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  /* ---------- Deep link ?p=ID / ?q= ---------- */
  function deepLink() {
    var q = new URLSearchParams(location.search);
    var pid = q.get('p');
    if (pid && productById(pid)) { openProduct(Number(pid)); return; }
    var term = q.get('q');
    if (term) {
      state.filter.q = term;
      var inp = $('searchInput');
      if (inp) { inp.value = term; toggleSearch(true); }
      renderFiltered();
      document.getElementById('all').scrollIntoView();
    }
  }

  /* ---------- Search ---------- */
  function toggleSearch(force) {
    var bar = $('searchBar');
    var open = typeof force === 'boolean' ? force : bar.hidden;
    bar.hidden = !open;
    $('searchToggle').setAttribute('aria-expanded', String(open));
    if (open) $('searchInput').focus();
  }
  var onSearch = debounce(function () {
    state.filter.q = $('searchInput').value.trim();
    state.shown = 10;
    renderFiltered();
  }, 250);

  /* ---------- Events ---------- */
  function bind() {
    // Drawer
    var drawer = $('sideDrawer'), menuBtn = $('menuBtn');
    function openDrawer() { drawer.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
    function closeDrawer() { drawer.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    menuBtn.addEventListener('click', openDrawer);
    $('drawerClose').addEventListener('click', closeDrawer);
    $('drawerOverlay').addEventListener('click', closeDrawer);

    // Search
    $('searchToggle').addEventListener('click', function () { toggleSearch(); });
    $('searchClose').addEventListener('click', function () { toggleSearch(false); $('searchInput').value = ''; state.filter.q = ''; renderFiltered(); });
    $('searchInput').addEventListener('input', onSearch);

    // Slider
    $('heroPrev').addEventListener('click', function () { goSlide(slideIdx - 1); restartAuto(); });
    $('heroNext').addEventListener('click', function () { goSlide(slideIdx + 1); restartAuto(); });
    $('heroDots').addEventListener('click', function (e) {
      var b = e.target.closest('[data-dot]');
      if (b) { goSlide(Number(b.getAttribute('data-dot'))); restartAuto(); }
    });
    var tx = 0;
    var track = $('heroTrack');
    track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) { goSlide(slideIdx + (dx < 0 ? 1 : -1)); restartAuto(); }
    }, { passive: true });

    // Categories
    $('catLeft').addEventListener('click', function () { $('catScroll').scrollBy({ left: 250, behavior: 'smooth' }); });
    $('catRight').addEventListener('click', function () { $('catScroll').scrollBy({ left: -250, behavior: 'smooth' }); });
    document.addEventListener('click', function (e) {
      var pill = e.target.closest('[data-cat]');
      if (pill) {
        state.filter.cat = pill.getAttribute('data-cat');
        state.shown = 10;
        renderCats(); renderFiltered();
        document.getElementById('all').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      var dcat = e.target.closest('[data-dcat]');
      if (dcat) {
        state.filter.cat = dcat.getAttribute('data-dcat');
        state.shown = 10;
        renderCats(); renderFiltered();
        closeDrawer();
        return;
      }
      var add = e.target.closest('[data-add]');
      if (add) { e.stopPropagation(); addToCart(Number(add.getAttribute('data-add'))); return; }
      var card = e.target.closest('[data-open]');
      if (card) { openProduct(Number(card.getAttribute('data-open'))); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-open]')) {
        openProduct(Number(e.target.getAttribute('data-open')));
      }
      if (e.key === 'Escape') {
        ['productModal', 'checkoutModal', 'successModal'].forEach(function (id) { $(id).hidden = true; });
        closeCart(); closeDrawer(); document.body.style.overflow = '';
      }
    });

    // Sort + load more
    $('sortSelect').addEventListener('change', function () {
      state.filter.sort = this.value; state.shown = 10; renderFiltered();
    });
    $('loadMoreBtn').addEventListener('click', function () { state.shown += 10; renderFiltered(); });

    // Cart
    $('cartOpenBtn').addEventListener('click', openCart);
    $('bnCart').addEventListener('click', openCart);
    $('cartClose').addEventListener('click', closeCart);
    $('cartOverlay').addEventListener('click', closeCart);
    $('cartItems').addEventListener('click', function (e) {
      var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rem = e.target.closest('[data-rem]');
      if (inc) { var a = state.cart[Number(inc.getAttribute('data-inc'))]; if (a) a.qty = Math.min(10, a.qty + 1); }
      else if (dec) { var b = state.cart[Number(dec.getAttribute('data-dec'))]; if (b) b.qty = Math.max(1, b.qty - 1); }
      else if (rem) { state.cart.splice(Number(rem.getAttribute('data-rem')), 1); }
      else return;
      saveCart(); updateBadges(); renderCart();
    });
    $('checkoutBtn').addEventListener('click', openCheckout);

    // Product modal internals
    $('pmBody').addEventListener('click', function (e) {
      var sz = e.target.closest('[data-size]');
      if (sz) {
        pmState.size = sz.getAttribute('data-size');
        this.querySelectorAll('.size-btn').forEach(function (b) { b.classList.toggle('sel', b === sz); });
        return;
      }
      if (e.target.closest('#pmDec')) { pmState.qty = Math.max(1, pmState.qty - 1); $('pmQty').textContent = bnNum(pmState.qty); }
      else if (e.target.closest('#pmInc')) { pmState.qty = Math.min(10, pmState.qty + 1); $('pmQty').textContent = bnNum(pmState.qty); }
      else if (e.target.closest('#pmAdd')) { addToCart(pmState.id, pmState.size, pmState.qty); closeProduct(); openCart(); }
      else if (e.target.closest('#pmBuy')) { addToCart(pmState.id, pmState.size, pmState.qty); closeProduct(); openCheckout(); }
    });

    // Modal close buttons
    document.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-close');
        if (id === 'productModal') closeProduct();
        else if (id === 'checkoutModal') closeCheckout();
        else { $(id).hidden = true; document.body.style.overflow = ''; }
      });
    });

    // Checkout
    $('coDistrict').addEventListener('change', updateSummary);
    document.querySelectorAll('input[name="pay"]').forEach(function (r) {
      r.addEventListener('change', function () {
        $('payHint').textContent = this.value === 'cod'
          ? 'পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন।'
          : 'অর্ডারের পর আমাদের প্রতিনিধি ' + (this.value === 'bkash' ? 'বিকাশ' : 'নগদ') + ' নম্বর পাঠিয়ে দেবে।';
      });
    });
    $('checkoutForm').addEventListener('submit', submitOrder);
    $('coPhone').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 11); });

    // Success close
    $('okClose').addEventListener('click', function () { $('successModal').hidden = true; document.body.style.overflow = ''; });

    // Order tracking (simple prompt → WhatsApp)
    var trackFn = function (e) {
      if (e) e.preventDefault();
      var id = prompt('আপনার অর্ডার আইডি লিখুন (যেমন: OF-A1B2C3):');
      if (!id) return;
      var s = getSettings();
      window.open('https://wa.me/' + (s.whatsapp_number || '8801700000000') + '?text=' + encodeURIComponent('আসসালামু আলাইকুম! আমার অর্ডারের অবস্থা জানতে চাই। অর্ডার আইডি: ' + id.trim().toUpperCase()), '_blank');
    };
    $('footTrack').addEventListener('click', trackFn);
    $('bnOrders').addEventListener('click', trackFn);

    // Footer year in Bangla digits
    $('yearNow').textContent = bnNum(new Date().getFullYear());
  }

  /* ---------- Init ---------- */
  loadCart(); updateBadges(); bind(); loadData();
})();
