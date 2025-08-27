const PRODUCTS = [
    { id: 'p1', title: 'Classic Watch', desc: 'Elegant analog watch with leather strap', price: 59.99, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=60' },
    { id: 'p2', title: 'Noise-cancelling Headphones', desc: 'Comfortable over-ear headphones with deep bass', price: 129.50, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bm9pc2UlMjBjYW5jZWxsaW5nJTIwaGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D' },
    { id: 'p3', title: 'Minimal Backpack', desc: 'Lightweight backpack for everyday carry', price: 39.00, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=60' },
    { id: 'p4', title: 'Stylish Sunglasses', desc: 'UV400 protection with modern frame', price: 24.99, img: 'https://images.unsplash.com/photo-1655849676216-bf75dcde64e0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U3R5bGlzaCUyMFN1bmdsYXNzZXN8ZW58MHx8MHx8fDA%3D' },
    { id: 'p5', title: 'Portable Speaker', desc: 'Small bluetooth speaker, big sound', price: 49.99, img: 'https://plus.unsplash.com/premium_photo-1689620815896-b61fdab3d733?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UG9ydGFibGUlMjBTcGVha2VyfGVufDB8fDB8fHww' },
    { id: 'p6', title: 'Running Shoes', desc: 'Breathable shoes for daily runs', price: 74.00, img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8UnVubmluZyUyMFNob2VzfGVufDB8fDB8fHww' }
];

const STORAGE = 'product_cart_v1';
let cart = {}; // {productId: {id, qty}}

function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE); cart = raw ? JSON.parse(raw) : {};
    } catch (e) {
        cart = {}; } 
}

function saveCart() { localStorage.setItem(STORAGE, JSON.stringify(cart)); }

/* ---------- Rendering ---------- */
const grid = document.getElementById('productGrid');
const cartList = document.getElementById('cartList');
const cartCount = document.getElementById('cartCount');
const subtotalEl = document.getElementById('subtotal');
const cartEmpty = document.getElementById('cartEmpty');
const toast = document.getElementById('toast');

function money(n) { return '$' + n.toFixed(2); }

function renderProducts(items) {
    grid.innerHTML = '';
    for (const p of items) {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = `
          <div class="img" style="background-image:url('${p.img}')" role="img" aria-label="${p.title}"></div>
          <div class="title">${p.title}</div>
          <div class="desc">${p.desc}</div>
          <div class="price-row">
            <div class="price">${money(p.price)}</div>
            <button class="add-btn" data-id="${p.id}">Add</button>
          </div>
        `;
        grid.appendChild(card);
    }
}

function renderCart() {
    cartList.innerHTML = '';
    const ids = Object.keys(cart);
    if (ids.length === 0) { cartEmpty.style.display = 'block'; } else { cartEmpty.style.display = 'none'; }

    let total = 0;
    for (const id of ids) {
        const item = cart[id];
        const p = PRODUCTS.find(x => x.id === id);
        if (!p) continue;
        total += p.price * item.qty;
        const el = document.createElement('div'); el.className = 'cart-item';
        el.innerHTML = `
          <div class="ci-thumb" style="background-image:url('${p.img}')" aria-hidden></div>
          <div style="flex:1">
            <div class="ci-title">${p.title}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
              <div class="qty">
                <button data-act="dec" data-id="${id}">-</button>
                <div style="min-width:24px;text-align:center">${item.qty}</div>
                <button data-act="inc" data-id="${id}">+</button>
              </div>
              <div style="font-weight:800">${money(p.price * item.qty)}</div>
            </div>
          </div>
          <button title="Remove" data-act="rem" data-id="${id}" style="background:transparent;border:0;color:var(--muted);font-size:16px;cursor:pointer">✖</button>
        `;
        cartList.appendChild(el);
    }
    subtotalEl.innerText = money(total);
    cartCount.innerText = ids.reduce((s, i) => s + cart[i].qty, 0);
    // ARIA: update cart button aria-expanded handled separately
    saveCart();
}

/* ---------- Actions ---------- */
function addToCart(id, qty = 1) {
    if (!cart[id]) cart[id] = { id, qty: 0 };
    cart[id].qty += qty;
    renderCart();
    showToast('Added to cart');
}

function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    renderCart();
}

function removeItem(id) { delete cart[id]; renderCart(); }

/* ---------- Events binding ---------- */
document.addEventListener('click', (ev) => {
    const add = ev.target.closest('.add-btn');
    if (add) { const id = add.dataset.id; addToCart(id); return; }

    const act = ev.target.closest('[data-act]');
    if (act) { const a = act.dataset.act; const id = act.dataset.id; if (a === 'inc') changeQty(id, 1); if (a === 'dec') changeQty(id, -1); if (a === 'rem') removeItem(id); }
});

document.getElementById('toggleCart').addEventListener('click', (ev) => {
    const panel = document.getElementById('cartPanel');
    const expanded = ev.currentTarget.getAttribute('aria-expanded') === 'true';
    ev.currentTarget.setAttribute('aria-expanded', String(!expanded));
    // simple visual cue: toggle shadow / border
    panel.style.display = panel.style.display === 'none' ? 'block' : 'block';
    // On small screens, scroll to cart
    if (window.innerWidth < 1000) panel.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('checkout').addEventListener('click', () => {
    if (Object.keys(cart).length === 0) { showToast('Cart is empty'); return; }
    // simple demo checkout
    showToast('Checkout — demo (cart cleared)'); cart = {}; renderCart();
});

// Search
document.getElementById('search').addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();
    if (!q) renderProducts(PRODUCTS);
    else renderProducts(PRODUCTS.filter(p => (p.title + p.desc).toLowerCase().includes(q)));
});

/* ---------- Small utilities ---------- */
let toastTimer;
function showToast(msg) { clearTimeout(toastTimer); toast.style.display = 'block'; toast.innerText = msg; toastTimer = setTimeout(() => { toast.style.display = 'none' }, 1800); }

/* ---------- Init ---------- */
loadCart(); renderProducts(PRODUCTS); renderCart();

// Keep cart panel visible on large screens, hidden on small screens by default
(function adjustCart() { if (window.innerWidth < 1000) { document.getElementById('cartPanel').style.display = 'block'; } else { document.getElementById('cartPanel').style.display = 'block'; } })();
