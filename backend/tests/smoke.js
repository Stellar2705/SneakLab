/**
 * SNEAKLAB API smoke test — mirrors the real user journey:
 * browse → register → login admin → cart → order (COD/UPI-mock) → admin status/refund
 * Run with backend already listening:  node tests/smoke.js
 */
const BASE = 'http://localhost:5000';

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name} ${detail}`);
  }
};

async function call(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

(async () => {
  const stamp = Date.now();
  const email = `customer${stamp}@test.com`;

  console.log('\n— Browse —');
  const cat = await call('/api/products');
  ok('GET /api/products', cat.status === 200 && cat.data.products?.length > 0, `(${cat.data.products?.length})`);
  const flagship = cat.data.products?.[0];
  const productId = flagship?._id;

  const one = await call(`/api/products/${productId}`);
  ok('GET /api/products/:id', one.status === 200 && one.data.product?.name === flagship.name);

  const filtered = await call('/api/products?category=Streetwear');
  ok(
    'Filter ?category=Streetwear',
    filtered.status === 200 && filtered.data.products?.every((p) => p.category === 'Streetwear')
  );

  console.log('\n— Auth —');
  const reg = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Test Customer', email, password: 'test123' },
  });
  ok('POST /api/auth/register', reg.status === 201 && !!reg.data.token);
  const userToken = reg.data.token;

  const badLogin = await call('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'wrongpass' },
  });
  ok('Login rejects wrong password', badLogin.status === 401);

  console.log('\n— Coupon —');
  const coupon = await call('/api/coupons/validate', {
    method: 'POST',
    body: { code: 'WELCOME10', itemsTotal: 10000 },
  });
  ok('Coupon WELCOME10 → 10%', coupon.status === 200 && coupon.data.discount === 1000, JSON.stringify(coupon.data));

  console.log('\n— Order (COD) —');
  const stockBefore = one.data.product.stock;
  const cod = await call('/api/orders', {
    method: 'POST',
    token: userToken,
    body: {
      items: [{ productId, qty: 2 }],
      address: { name: 'Test Customer', phone: '9999999999', city: 'Bengaluru', pincode: '560001' },
      method: 'COD',
      couponCode: 'WELCOME10',
    },
  });
  const codOrder = cod.data.order;
  ok(
    'POST /api/orders (COD + coupon)',
    cod.status === 201 &&
      codOrder.status === 'Placed' &&
      codOrder.payment.method === 'COD' &&
      codOrder.discount === Math.round(flagship.price * 2 * 0.1),
    JSON.stringify(cod.data).slice(0, 140)
  );

  const after = await call(`/api/products/${productId}`);
  ok('Stock decremented by 2', after.data.product.stock === stockBefore - 2, `${stockBefore} → ${after.data.product.stock}`);

  const mine = await call('/api/orders/mine', { token: userToken });
  ok('GET /api/orders/mine', mine.status === 200 && mine.data.orders?.length === 1);

  console.log('\n— Order (UPI, mock gateway) —');
  const upi = await call('/api/orders', {
    method: 'POST',
    token: userToken,
    body: {
      items: [{ productId, qty: 1 }],
      address: { name: 'Test Customer', phone: '9999999999', city: 'Bengaluru', pincode: '560001' },
      method: 'UPI',
    },
  });
  ok('POST /api/orders (UPI → mock mode)', upi.status === 201 && upi.data.paymentMode === 'mock', JSON.stringify(upi.data.paymentMode));
  const upiOrder = upi.data.order;

  const mockPay = await call(`/api/payments/mock/success/${upiOrder._id}`, { method: 'POST', token: userToken });
  ok('Mock UPI payment → Paid', mockPay.status === 200 && mockPay.data.order.payment.status === 'Paid');

  console.log('\n— Admin —');
  const adminLogin = await call('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@sneaklab.com', password: 'Admin@123' },
  });
  ok('Admin login', adminLogin.status === 200 && adminLogin.data.user?.role === 'admin');
  const adminToken = adminLogin.data.token;

  const forbidden = await call('/api/admin/stats', { token: userToken });
  ok('Admin routes reject non-admin', forbidden.status === 403);

  const stats = await call('/api/admin/stats', { token: adminToken });
  ok('GET /api/admin/stats', stats.status === 200 && stats.data.stats.orders >= 2);

  const adminOrders = await call('/api/admin/orders', { token: adminToken });
  ok('GET /api/admin/orders', adminOrders.status === 200 && adminOrders.data.orders?.length >= 2);

  const shipped = await call(`/api/admin/orders/${codOrder._id}/status`, {
    method: 'PUT',
    token: adminToken,
    body: { status: 'Shipped' },
  });
  ok('PUT status → Shipped', shipped.status === 200 && shipped.data.order.status === 'Shipped');

  const refund = await call(`/api/admin/orders/${upiOrder._id}/refund`, { method: 'PUT', token: adminToken });
  ok(
    'PUT refund → Refunded + restocked',
    refund.status === 200 &&
      refund.data.order.status === 'Refunded' &&
      refund.data.order.payment.status === 'Refunded'
  );

  const restocked = await call(`/api/products/${productId}`);
  ok(
    'Refund restocked product',
    restocked.data.product.stock === stockBefore - 2,
    `expected ${stockBefore - 2}, got ${restocked.data.product.stock}`
  );

  console.log(`\nResult: ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});
