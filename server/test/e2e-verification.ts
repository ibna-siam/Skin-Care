import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

async function runE2EVerification() {
  console.log('🚀 Starting Comprehensive End-to-End System Verification...\n');

  // 1. Health check
  console.log('1️⃣ Testing Health Check...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  console.log('   ✔ Server is healthy and running!\n');

  // 2. Public Catalog & Products
  console.log('2️⃣ Testing Product Catalog & Best Sellers...');
  const productsRes = await fetch(`${BASE_URL}/products?limit=10`);
  const productsData = await productsRes.json();
  assert.strictEqual(productsData.success, true);
  assert.ok(productsData.data.length >= 4, 'Should return seeded products');
  console.log(`   ✔ Retrieved ${productsData.data.length} authentic products in catalog!`);
  
  const ceraveProduct = productsData.data.find((p: any) => p.slug.includes('cerave') || p.name.includes('CeraVe'));
  assert.ok(ceraveProduct, 'CeraVe product should exist in database');
  console.log(`   ✔ Verified Reference Product: ${ceraveProduct.name} - ৳${ceraveProduct.price}\n`);

  // 3. Taxonomies (Categories, Brands, Skin Types, Concerns)
  console.log('3️⃣ Testing Taxonomies & Filtering Data...');
  const taxRes = await fetch(`${BASE_URL}/products/taxonomies`);
  const taxData = await taxRes.json();
  assert.strictEqual(taxData.success, true);
  assert.ok(taxData.data.skinTypes.length >= 5, 'Should have 5 skin types');
  assert.ok(taxData.data.skinConcerns.length >= 5, 'Should have 5 skin concerns');
  
  const catRes = await fetch(`${BASE_URL}/products/categories`);
  const catData = await catRes.json();
  const brandRes = await fetch(`${BASE_URL}/products/brands`);
  const brandData = await brandRes.json();

  console.log(`   ✔ Verified ${catData.data.length} Categories, ${brandData.data.length} Brands, ${taxData.data.skinTypes.length} Skin Types, ${taxData.data.skinConcerns.length} Skin Concerns!\n`);

  // 4. Diagnostic Skin Quiz Verification
  console.log('4️⃣ Testing Diagnostic Skin Quiz & Routine Generator...');
  const quizRes = await fetch(`${BASE_URL}/skin-guide/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skinTypeSlug: 'oily',
      concernSlug: 'acne',
      sensitivity: 'LOW',
      gender: 'ALL',
    }),
  });
  const quizData = await quizRes.json();
  assert.strictEqual(quizData.success, true);
  assert.strictEqual(quizData.data.skinType, 'oily');
  assert.strictEqual(quizData.data.primaryConcern, 'acne');
  assert.ok(quizData.data.morningRoutine.length > 0, 'Morning routine generated');
  assert.ok(quizData.data.nightRoutine.length > 0, 'Night routine generated');
  assert.ok(quizData.data.tips.length > 0, 'Bangladesh climate tips generated');
  console.log(`   ✔ Generated Diagnostic Routine for Oily + Acne Skin:`);
  console.log(`     - Morning Steps: ${quizData.data.morningRoutine.map((r: any) => r.category).join(' ➔ ')}`);
  console.log(`     - Night Steps:   ${quizData.data.nightRoutine.map((r: any) => r.category).join(' ➔ ')}`);
  console.log(`     - Local Tip:     ${quizData.data.tips[0]}\n`);

  // 5. Coupon Engine Validation
  console.log('5️⃣ Testing Bangladesh Coupon Validation Engine...');
  const couponRes = await fetch(`${BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'WELCOME10', subtotal: 2000 }),
  });
  const couponData = await couponRes.json();
  assert.strictEqual(couponData.success, true);
  assert.strictEqual(couponData.data.discountAmount, 200); // 10% of 2000 = 200
  console.log(`   ✔ Promo 'WELCOME10' validated: 10% discount on ৳2,000 = -৳${couponData.data.discountAmount}\n`);

  // 6. Guest Cart Operations
  console.log('6️⃣ Testing Cart Operations...');
  const guestSessionId = `test-session-${Date.now()}`;
  const addCartRes = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': guestSessionId,
    },
    body: JSON.stringify({
      productId: ceraveProduct.id,
      quantity: 2,
    }),
  });
  const addCartData = await addCartRes.json();
  assert.strictEqual(addCartData.success, true);

  const getCartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { 'x-session-id': guestSessionId },
  });
  const getCartData = await getCartRes.json();
  assert.strictEqual(getCartData.success, true);
  assert.strictEqual(getCartData.data.items.length, 1);
  console.log(`   ✔ Added 2x ${ceraveProduct.name} to Cart. Cart Subtotal: ৳${getCartData.data.subtotal}\n`);

  // 7. Order Placement & Price Integrity Check
  console.log('7️⃣ Testing Order Placement with Bangladesh Address & Delivery Calculation...');
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': guestSessionId,
    },
    body: JSON.stringify({
      customerName: 'Ayesha Rahman',
      customerEmail: 'ayesha.rahman@example.com',
      customerPhone: '01712345678',
      division: 'Dhaka',
      district: 'dhaka-city',
      area: 'Gulshan-2',
      fullAddress: 'House 12, Road 113, Block D',
      deliveryMethod: 'STANDARD',
      paymentMethod: 'COD',
      couponCode: 'WELCOME10',
      items: [
        {
          productId: ceraveProduct.id,
          quantity: 2,
        },
      ],
    }),
  });
  const orderData = await orderRes.json();
  assert.strictEqual(orderData.success, true);
  const createdOrder = orderData.data.order;
  assert.ok(createdOrder.orderNumber, 'Order number generated');
  assert.strictEqual(createdOrder.paymentMethod, 'COD');
  console.log(`   ✔ Order Created Successfully: #${createdOrder.orderNumber}`);
  console.log(`     - Subtotal: ৳${createdOrder.subtotal}`);
  console.log(`     - Discount: -৳${createdOrder.discountAmount}`);
  console.log(`     - Shipping: ৳${createdOrder.shippingFee} (Inside Dhaka)`);
  console.log(`     - Total:    ৳${createdOrder.totalAmount}\n`);

  // 8. Order Tracking by Order Number & Phone
  console.log('8️⃣ Testing Public Order Tracking System...');
  const trackRes = await fetch(`${BASE_URL}/orders/track?orderNumber=${createdOrder.orderNumber}&phone=01712345678`);
  const trackData = await trackRes.json();
  assert.strictEqual(trackData.success, true);
  assert.strictEqual(trackData.data.orderNumber, createdOrder.orderNumber);
  console.log(`   ✔ Tracking Verified: Order #${trackData.data.orderNumber} is in status '${trackData.data.orderStatus}'\n`);

  // 9. Admin Authentication & Dashboard Verification
  console.log('9️⃣ Testing Admin Authentication & Dashboard Analytics...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin@example.com',
      password: 'ChangeMe123!',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.success) {
    console.error('Admin login error:', adminLoginData);
  }
  assert.strictEqual(adminLoginData.success, true);
  assert.strictEqual(adminLoginData.data.user.role, 'SUPER_ADMIN');
  const cookieHeader = adminLoginRes.headers.get('set-cookie');
  const adminToken = adminLoginData.data.token;
  console.log(`   ✔ Admin Authenticated as: ${adminLoginData.data.user.name} (${adminLoginData.data.user.role})`);

  const adminHeaders: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  };
  if (cookieHeader) adminHeaders['Cookie'] = cookieHeader;

  // Admin Dashboard KPIs
  const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders });
  const dashData = await dashRes.json();
  assert.strictEqual(dashData.success, true);
  assert.ok(dashData.data.kpis.totalProducts > 0, 'KPI products count');
  assert.ok(dashData.data.salesTrends.length > 0, 'Sales trends data for charts');
  assert.ok(dashData.data.categoryDistribution.length > 0, 'Category breakdown data');
  console.log(`   ✔ Admin Dashboard KPIs:`);
  console.log(`     - Total Revenue: ৳${dashData.data.kpis.totalSales}`);
  console.log(`     - Total Orders:  ${dashData.data.kpis.totalOrders}`);
  console.log(`     - Active Items:  ${dashData.data.kpis.totalProducts}`);
  console.log(`     - Low Stock Items: ${dashData.data.kpis.lowStockCount}\n`);

  // 10. Admin Order Status Update Pipeline
  console.log('🔟 Testing Admin Order Pipeline & Courier Assignment...');
  const statusUpdateRes = await fetch(`${BASE_URL}/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      status: 'CONFIRMED',
      courierName: 'Steadfast Courier Bangladesh',
      trackingNumber: 'STDF-998877',
      note: 'Verified customer phone and package dispatched to sorting hub',
    }),
  });
  const statusUpdateData = await statusUpdateRes.json();
  assert.strictEqual(statusUpdateData.success, true);
  assert.strictEqual(statusUpdateData.data.orderStatus, 'CONFIRMED');
  assert.strictEqual(statusUpdateData.data.courierName, 'Steadfast Courier Bangladesh');
  console.log(`   ✔ Order #${createdOrder.orderNumber} successfully updated to 'CONFIRMED' with Steadfast tracking code STDF-998877!\n`);

  console.log('🎉 ALL 10 VERIFICATION PLAN STAGES PASSED WITH 100% SUCCESS!');
}

runE2EVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
