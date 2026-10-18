/* ORBITO FASHION — Admin panel logic */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function tk(n) { return '৳ ' + Number(n || 0).toLocaleString('bn-BD'); }
  function bnNum(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }
  function toast(msg, isErr) {
    var t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : '');
    t.innerHTML = '<i class="fa-solid ' + (isErr ? 'fa-circle-exclamation' : 'fa-circle-check') + '"></i><span></span>';
    t.querySelector('span').textContent = msg;
    $('toastWrap').appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  var ST_LABEL = { pending: 'পেন্ডিং', confirmed: 'কনফার্মড', shipped: 'শিপড', delivered: 'ডেলিভার্ড', cancelled: 'বাতিল' };
  var PAY_LABEL = { cod: 'COD', bkash: 'বিকাশ', nagad: 'নগদ' };
  var SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', 'ফ্রি সাইজ'];

  var DB = { products: [], categories: [], sliders: [], orders: [], settings: {} };

  function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'same-origin';
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(path, opts).then(function (r) {
      if (r.status === 401) { showLogin(); throw new Error('unauth'); }
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error) || 'সার্ভার সমস্যা');
        return j;
      });
    });
  }

  /* ---------- Auth ---------- */
  function showLogin() { $('loginView').style.display = 'flex'; $('adminApp').hidden = true; }
  function showApp() { $('loginView').style.display = 'none'; $('adminApp').hidden = false; loadAll(); }
  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('loginBtn'), err = $('loginErr');
    err.hidden = true; btn.disabled = true; btn.textContent = 'যাচাই হচ্ছে...';
    api('/api/auth/login', { method: 'POST', body: JSON.stringify({ password: $('loginPass').value }) })
      .then(function () { $('loginPass').value = ''; showApp(); })
      .catch(function (ex) {
        if (ex.message !== 'unauth') { err.textContent = ex.message; err.hidden = false; }
      })
      .finally(function () { btn.disabled = false; btn.textContent = 'লগইন করুন'; });
  });
  $('logoutBtn').addEventListener('click', function () {
    api('/api/auth/logout', { method: 'POST' }).finally(function () { showLogin(); });
  });

  /* ---------- Tabs ---------- */
  document.querySelectorAll('.tab-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (x) { x.classList.remove('active'); });
      document.querySelectorAll('.tab-pane').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      $('tab-' + b.getAttribute('data-tab')).classList.add('active');
      $('sidebar').classList.remove('open'); $('sidebarOverlay').classList.remove('show');
      window.scrollTo(0, 0);
    });
  });
  $('adminMenuBtn').addEventListener('click', function () {
    $('sidebar').classList.add('open'); $('sidebarOverlay').classList.add('show');
  });
  $('sidebarOverlay').addEventListener('click', function () {
    $('sidebar').classList.remove('open'); this.classList.remove('show');
  });

  /* ---------- Load all ---------- */
  function loadAll() {
    Promise.allSettled([
      api('/api/products'), api('/api/categories'), api('/api/sliders'), api('/api/orders'), api('/api/settings')
    ]).then(function (rs) {
      if (rs[0].status === 'fulfilled') DB.products = rs[0].value.products || [];
      if (rs[1].status === 'fulfilled') DB.categories = rs[1].value.categories || [];
      if (rs[2].status === 'fulfilled') DB.sliders = rs[2].value.sliders || [];
      if (rs[3].status === 'fulfilled') DB.orders = rs[3].value.orders || [];
      if (rs[4].status === 'fulfilled') DB.settings = rs[4].value.settings || {};
      renderDashboard(); renderProducts(); renderCats(); renderSliders(); renderOrders(); fillSettings();
    });
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    var pending = DB.orders.filter(function (o) { return o.status === 'pending'; }).length;
    var revenue = DB.orders.filter(function (o) { return o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered'; })
      .reduce(function (s, o) { return s + (o.total || 0); }, 0);
    var cards = [
      { l: 'মোট পণ্য', v: bnNum(DB.products.length), c: '#e11d48', bg: '#fff1f2', i: 'fa-shirt' },
      { l: 'মোট অর্ডার', v: bnNum(DB.orders.length), c: '#2563eb', bg: '#eff6ff', i: 'fa-box-open' },
      { l: 'পেন্ডিং অর্ডার', v: bnNum(pending), c: '#d97706', bg: '#fffbeb', i: 'fa-hourglass-half' },
      { l: 'মোট রেভিনিউ', v: tk(revenue), c: '#059669', bg: '#ecfdf5', i: 'fa-sack-dollar' }
    ];
    $('statGrid').innerHTML = cards.map(function (c) {
      return '<div class="stat"><div class="ico" style="background:' + c.bg + ';color:' + c.c + '"><i class="fa-solid ' + c.i + '"></i></div>' +
        '<div class="lbl">' + c.l + '</div><div class="val">' + c.v + '</div></div>';
    }).join('');
    var pill = $('pendingPill');
    pill.textContent = bnNum(pending); pill.hidden = pending === 0;
    var recent = DB.orders.slice(0, 8);
    $('recentOrdersTbl').innerHTML = '<thead><tr><th>আইডি</th><th>গ্রাহক</th><th>মোট</th><th>স্ট্যাটাস</th></tr></thead><tbody>' +
      (recent.length ? recent.map(function (o) {
        return '<tr><td><b>' + esc(o.id) + '</b></td><td>' + esc(o.customer_name) + '<div class="muted">' + esc(o.phone) + '</div></td>' +
          '<td>' + tk(o.total) + '</td><td><span class="st st-' + o.status + '">' + (ST_LABEL[o.status] || o.status) + '</span></td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:#9ca3af">এখনো কোনো অর্ডার নেই</td></tr>') + '</tbody>';
  }

  /* ---------- Products ---------- */
  function catName(id) {
    var c = DB.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : '—';
  }
  function renderProducts() {
    $('productsTbl').innerHTML = '<thead><tr><th>ছবি</th><th>নাম</th><th>দাম</th><th>স্টক</th><th>ফ্ল্যাগ</th><th></th></tr></thead><tbody>' +
      (DB.products.length ? DB.products.map(function (p) {
        var flags = [];
        if (p.is_trending) flags.push('ট্রেন্ডিং');
        if (p.is_new) flags.push('নতুন');
        return '<tr><td>' + (p.image ? '<img class="thumb" src="' + esc(p.image) + '" alt="" loading="lazy">' : '') + '</td>' +
          '<td><b>' + esc(p.name) + '</b><div class="muted">' + esc(catName(p.category_id)) + (p.badge ? ' • ' + esc(p.badge) : '') + '</div></td>' +
          '<td>' + tk(p.price) + (p.old_price > p.price ? '<div class="muted"><s>' + tk(p.old_price) + '</s></div>' : '') + '</td>' +
          '<td>' + bnNum(p.stock) + '</td><td>' + esc(flags.join(', ') || '—') + '</td>' +
          '<td><div class="row-actions"><button class="mini-btn" data-pedit="' + p.id + '">এডিট</button>' +
          '<button class="mini-btn del" data-pdel="' + p.id + '">মুছুন</button></div></td></tr>';
      }).join('') : '<tr><td colspan="6" style="text-align:center;color:#9ca3af">কোনো পণ্য নেই</td></tr>') + '</tbody>';
  }
  $('addProductBtn').addEventListener('click', function () { openProductForm(null); });
  document.addEventListener('click', function (e) {
    var pe = e.target.closest('[data-pedit]');
    if (pe) { var p = DB.products.filter(function (x) { return x.id == pe.getAttribute('data-pedit'); })[0]; openProductForm(p || null); return; }
    var pd = e.target.closest('[data-pdel]');
    if (pd) {
      if (!confirm('এই পণ্যটি মুছে ফেলবেন?')) return;
      api('/api/products?id=' + pd.getAttribute('data-pdel'), { method: 'DELETE' })
        .then(function () { toast('পণ্য মোছা হয়েছে'); loadAll(); })
        .catch(function (ex) { if (ex.message !== 'unauth') toast(ex.message, true); });
      return;
    }
    var ce = e.target.closest('[data-cedit]');
    if (ce) { var c = DB.categories.filter(function (x) { return x.id == ce.getAttribute('data-cedit'); })[0]; openCatForm(c || null); return; }
    var cd = e.target.closest('[data-cdel]');
    if (cd) {
      if (!confirm('এই ক্যাটাগরি মুছবেন?')) return;
      api('/api/categories?id=' + cd.getAttribute('data-cdel'), { method: 'DELETE' })
        .then(function () { toast('ক্যাটাগরি মোছা হয়েছে'); loadAll(); })
        .catch(function (ex) { if (ex.message !== 'unauth') toast(ex.message, true); });
      return;
    }
    var se = e.target.closest('[data-sedit]');
    if (se) { var s = DB.sliders.filter(function (x) { return x.id == se.getAttribute('data-sedit'); })[0]; openSliderForm(s || null); return; }
    var sd = e.target.closest('[data-sdel]');
    if (sd) {
      if (!confirm('এই স্লাইড মুছবেন?')) return;
      api('/api/sliders?id=' + sd.getAttribute('data-sdel'), { method: 'DELETE' })
        .then(function () { toast('স্লাইড মোছা হয়েছে'); loadAll(); })
        .catch(function (ex) { if (ex.message !== 'unauth') toast(ex.message, true); });
    }
  });

  function openProductForm(p) {
    var sizes = [];
    try { sizes = JSON.parse((p && p.sizes) || '[]'); } catch (e) { sizes = []; }
    $('editTitle').textContent = p ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যোগ করুন';
    $('editFields').innerHTML =
      fld('text', 'f_name', 'পণ্যের নাম *', (p && p.name) || '', 120) +
      '<label class="field">ক্যাটাগরি<select class="input" id="f_cat">' +
      DB.categories.map(function (c) { return '<option value="' + c.id + '"' + (p && p.category_id === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
      '</select></label>' +
      '<div class="form-row">' + fld('number', 'f_price', 'দাম (৳) *', (p && p.price) || '', null) + fld('number', 'f_old', 'আগের দাম (৳)', (p && p.old_price) || '', null) + '</div>' +
      fld('url', 'f_img', 'ছবির লিংক', (p && p.image) || '', 2000) +
      '<div class="form-row">' + fld('text', 'f_badge', 'ব্যাজ (যেমন: নতুন, -২০%)', (p && p.badge) || '', 40) + fld('number', 'f_stock', 'স্টক', (p && p.stock != null ? p.stock : 100), null) + '</div>' +
      '<label class="field">বিবরণ<textarea class="input" id="f_desc" rows="3" maxlength="5000">' + esc((p && p.description) || '') + '</textarea></label>' +
      '<div class="field">সাইজ<div class="size-checks">' + SIZES.map(function (s) {
        return '<label class="' + (sizes.indexOf(s) >= 0 ? 'on' : '') + '"><input type="checkbox" value="' + esc(s) + '"' + (sizes.indexOf(s) >= 0 ? ' checked' : '') + '> ' + esc(s) + '</label>';
      }).join('') + '</div></div>' +
      '<div class="check-row"><label><input type="checkbox" id="f_tr" ' + (p && p.is_trending ? 'checked' : '') + '> ট্রেন্ডি পোশাক</label>' +
      '<label><input type="checkbox" id="f_new" ' + (p && p.is_new ? 'checked' : '') + '> নতুন কালেকশন</label></div>';
    bindSizeChecks();
    openEdit(function () {
      var checkedSizes = Array.prototype.map.call(document.querySelectorAll('#editFields .size-checks input:checked'), function (i) { return i.value; });
      var body = {
        name: $('f_name').value, category_id: Number($('f_cat').value),
        price: Number($('f_price').value), old_price: Number($('f_old').value) || 0,
        image: $('f_img').value, badge: $('f_badge').value, sizes: checkedSizes,
        stock: Number($('f_stock').value), description: $('f_desc').value,
        is_trending: $('f_tr').checked ? 1 : 0, is_new: $('f_new').checked ? 1 : 0
      };
      return { url: '/api/products' + (p ? '?id=' + p.id : ''), method: p ? 'PUT' : 'POST', body: body };
    });
  }
  function fld(type, id, label, val, max) {
    return '<label class="field">' + label + '<input class="input" type="' + type + '" id="' + id + '" value="' + esc(val) + '"' +
      (max ? ' maxlength="' + max + '"' : '') + (type === 'number' ? ' min="0"' : '') + '></label>';
  }
  function bindSizeChecks() {
    document.querySelectorAll('#editFields .size-checks label').forEach(function (l) {
      l.addEventListener('click', function (e) {
        e.preventDefault();
        var cb = l.querySelector('input');
        cb.checked = !cb.checked;
        l.classList.toggle('on', cb.checked);
      });
    });
  }

  /* ---------- Categories ---------- */
  function renderCats() {
    $('catsTbl').innerHTML = '<thead><tr><th>ছবি</th><th>নাম</th><th>ক্রম</th><th></th></tr></thead><tbody>' +
      (DB.categories.length ? DB.categories.map(function (c) {
        return '<tr><td>' + (c.image ? '<img class="thumb" src="' + esc(c.image) + '" alt="" loading="lazy" style="width:46px;height:46px;border-radius:50%">' : '') + '</td>' +
          '<td><b>' + esc(c.name) + '</b></td><td>' + bnNum(c.sort) + '</td>' +
          '<td><div class="row-actions"><button class="mini-btn" data-cedit="' + c.id + '">এডিট</button>' +
          '<button class="mini-btn del" data-cdel="' + c.id + '">মুছুন</button></div></td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:#9ca3af">কোনো ক্যাটাগরি নেই</td></tr>') + '</tbody>';
  }
  $('addCatBtn').addEventListener('click', function () { openCatForm(null); });
  function openCatForm(c) {
    $('editTitle').textContent = c ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি';
    $('editFields').innerHTML =
      fld('text', 'f_name', 'ক্যাটাগরির নাম *', (c && c.name) || '', 60) +
      fld('url', 'f_img', 'ছবির লিংক', (c && c.image) || '', 2000) +
      fld('number', 'f_sort', 'ক্রম (ছোট সংখ্যা আগে)', (c && c.sort) || 0, null);
    openEdit(function () {
      return { url: '/api/categories' + (c ? '?id=' + c.id : ''), method: c ? 'PUT' : 'POST', body: { name: $('f_name').value, image: $('f_img').value, sort: Number($('f_sort').value) } };
    });
  }

  /* ---------- Sliders ---------- */
  function renderSliders() {
    $('slidersTbl').innerHTML = '<thead><tr><th>ছবি</th><th>শিরোনাম</th><th>ক্রম</th><th></th></tr></thead><tbody>' +
      (DB.sliders.length ? DB.sliders.map(function (s) {
        return '<tr><td>' + (s.image ? '<img class="thumb" src="' + esc(s.image) + '" alt="" loading="lazy" style="width:80px;height:46px">' : '') + '</td>' +
          '<td><b>' + esc(s.title) + '</b><div class="muted">' + esc(s.badge || '') + '</div></td><td>' + bnNum(s.sort) + '</td>' +
          '<td><div class="row-actions"><button class="mini-btn" data-sedit="' + s.id + '">এডিট</button>' +
          '<button class="mini-btn del" data-sdel="' + s.id + '">মুছুন</button></div></td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:#9ca3af">কোনো স্লাইড নেই</td></tr>') + '</tbody>';
  }
  $('addSliderBtn').addEventListener('click', function () { openSliderForm(null); });
  function openSliderForm(s) {
    $('editTitle').textContent = s ? 'স্লাইড এডিট করুন' : 'নতুন স্লাইড';
    $('editFields').innerHTML =
      fld('url', 'f_img', 'ছবির লিংক *', (s && s.image) || '', 2000) +
      fld('text', 'f_badge', 'ব্যাজ (যেমন: মেগা ফ্ল্যাশ সেল)', (s && s.badge) || '', 40) +
      fld('text', 'f_title', 'শিরোনাম *', (s && s.title) || '', 140) +
      fld('text', 'f_sub', 'সাবটাইটেল', (s && s.subtitle) || '', 220) +
      '<div class="form-row">' + fld('text', 'f_btn', 'বাটন লেখা', (s && s.button_text) || 'এখনই কিনুন', 40) + fld('number', 'f_sort', 'ক্রম', (s && s.sort) || 0, null) + '</div>';
    openEdit(function () {
      return { url: '/api/sliders' + (s ? '?id=' + s.id : ''), method: s ? 'PUT' : 'POST', body: { image: $('f_img').value, badge: $('f_badge').value, title: $('f_title').value, subtitle: $('f_sub').value, button_text: $('f_btn').value, sort: Number($('f_sort').value) } };
    });
  }

  /* ---------- Edit modal ---------- */
  var editSubmit = null;
  function openEdit(buildFn) {
    editSubmit = buildFn;
    $('editErr').hidden = true;
    $('editModal').hidden = false;
  }
  function closeEdit() { $('editModal').hidden = true; editSubmit = null; }
  document.querySelectorAll('[data-close-edit]').forEach(function (el) { el.addEventListener('click', closeEdit); });
  $('editForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!editSubmit) return;
    var req = editSubmit(), err = $('editErr'), btn = $('editSaveBtn');
    err.hidden = true; btn.disabled = true; btn.textContent = 'সংরক্ষণ হচ্ছে...';
    api(req.url, { method: req.method, body: JSON.stringify(req.body) })
      .then(function () { toast('সংরক্ষণ হয়েছে'); closeEdit(); loadAll(); })
      .catch(function (ex) { if (ex.message !== 'unauth') { err.textContent = ex.message; err.hidden = false; } })
      .finally(function () { btn.disabled = false; btn.textContent = 'সংরক্ষণ করুন'; });
  });

  /* ---------- Orders ---------- */
  function renderOrders() {
    var f = $('orderStatusFilter').value;
    var list = f ? DB.orders.filter(function (o) { return o.status === f; }) : DB.orders;
    $('ordersTbl').innerHTML = '<thead><tr><th>আইডি / তারিখ</th><th>গ্রাহক</th><th>পণ্য</th><th>মোট</th><th>পেমেন্ট</th><th>স্ট্যাটাস</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (o) {
        var items = [];
        try { items = JSON.parse(o.items_json || '[]'); } catch (e) {}
        var d = new Date(o.created_at * 1000);
        return '<tr><td><b>' + esc(o.id) + '</b><div class="muted">' + d.toLocaleDateString('bn-BD') + ' ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + '</div></td>' +
          '<td>' + esc(o.customer_name) + '<div class="muted">' + esc(o.phone) + '</div></td>' +
          '<td class="muted">' + items.map(function (i) { return esc(i.name) + ' (' + esc(i.size) + ') ×' + bnNum(i.qty); }).join('<br>') + '</td>' +
          '<td><b>' + tk(o.total) + '</b></td><td>' + (PAY_LABEL[o.payment] || esc(o.payment)) + '</td>' +
          '<td><select class="status-sel" data-ostatus="' + esc(o.id) + '">' +
          Object.keys(ST_LABEL).map(function (k) { return '<option value="' + k + '"' + (o.status === k ? ' selected' : '') + '>' + ST_LABEL[k] + '</option>'; }).join('') +
          '</select></td>' +
          '<td><button class="mini-btn" data-odetail="' + esc(o.id) + '">বিবরণ</button></td></tr>';
      }).join('') : '<tr><td colspan="7" style="text-align:center;color:#9ca3af">কোনো অর্ডার নেই</td></tr>') + '</tbody>';
  }
  $('orderStatusFilter').addEventListener('change', renderOrders);
  document.addEventListener('change', function (e) {
    var sel = e.target.closest('[data-ostatus]');
    if (!sel) return;
    var id = sel.getAttribute('data-ostatus'), st = sel.value;
    api('/api/orders?id=' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify({ status: st }) })
      .then(function () {
        var o = DB.orders.filter(function (x) { return x.id === id; })[0];
        if (o) o.status = st;
        toast('স্ট্যাটাস আপডেট হয়েছে'); renderDashboard(); renderOrders();
      })
      .catch(function (ex) { if (ex.message !== 'unauth') toast(ex.message, true); loadAll(); });
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-odetail]');
    if (!b) return;
    var o = DB.orders.filter(function (x) { return x.id === b.getAttribute('data-odetail'); })[0];
    if (!o) return;
    var items = [];
    try { items = JSON.parse(o.items_json || '[]'); } catch (e2) {}
    var d = new Date(o.created_at * 1000);
    $('orderDetail').innerHTML =
      '<div class="od-row"><span class="k">অর্ডার আইডি</span><b>' + esc(o.id) + '</b></div>' +
      '<div class="od-row"><span class="k">তারিখ</span><span>' + d.toLocaleString('bn-BD') + '</span></div>' +
      '<div class="od-row"><span class="k">নাম</span><span>' + esc(o.customer_name) + '</span></div>' +
      '<div class="od-row"><span class="k">মোবাইল</span><span dir="ltr">' + esc(o.phone) + '</span></div>' +
      '<div class="od-row"><span class="k">ঠিকানা</span><span>' + esc(o.address) + ', ' + esc(o.district) + '</span></div>' +
      '<div class="od-row"><span class="k">পেমেন্ট</span><span>' + (PAY_LABEL[o.payment] || esc(o.payment)) + '</span></div>' +
      '<div class="od-row"><span class="k">স্ট্যাটাস</span><span class="st st-' + o.status + '">' + (ST_LABEL[o.status] || o.status) + '</span></div>' +
      '<ul class="od-items">' + items.map(function (i) {
        return '<li>' + esc(i.name) + ' — সাইজ ' + esc(i.size) + ' × ' + bnNum(i.qty) + ' = <b>' + tk(i.price * i.qty) + '</b></li>';
      }).join('') + '</ul>' +
      '<div class="od-row"><span class="k">সাবটোটাল</span><span>' + tk(o.subtotal) + '</span></div>' +
      '<div class="od-row"><span class="k">ডেলিভারি</span><span>' + tk(o.delivery) + '</span></div>' +
      '<div class="od-row"><span class="k"><b>সর্বমোট</b></span><b>' + tk(o.total) + '</b></div>';
    $('orderModal').hidden = false;
  });
  document.querySelectorAll('[data-close-order]').forEach(function (el) {
    el.addEventListener('click', function () { $('orderModal').hidden = true; });
  });

  /* ---------- Settings ---------- */
  function fillSettings() {
    ['brand_name', 'whatsapp_number', 'helpline', 'address', 'delivery_inside', 'delivery_outside'].forEach(function (k) {
      var el = $('set_' + k);
      if (el) el.value = DB.settings[k] || '';
    });
  }
  $('settingsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('setErr'), ok = $('setOk'), btn = $('setSaveBtn');
    err.hidden = true; ok.hidden = true; btn.disabled = true; btn.textContent = 'সংরক্ষণ হচ্ছে...';
    var body = {};
    ['brand_name', 'whatsapp_number', 'helpline', 'address', 'delivery_inside', 'delivery_outside'].forEach(function (k) {
      body[k] = $('set_' + k).value;
    });
    api('/api/settings', { method: 'PUT', body: JSON.stringify(body) })
      .then(function () { ok.textContent = 'সেটিংস সংরক্ষণ হয়েছে।'; ok.hidden = false; loadAll(); })
      .catch(function (ex) { if (ex.message !== 'unauth') { err.textContent = ex.message; err.hidden = false; } })
      .finally(function () { btn.disabled = false; btn.textContent = 'সংরক্ষণ করুন'; });
  });

  /* ---------- Init ---------- */
  api('/api/auth/me')
    .then(function () { showApp(); })
    .catch(function () { showLogin(); });
})();
