// Advanced E-Commerce Analytics Engine: GA4, Facebook Pixel & GTM DataLayer

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbqInitialized?: boolean;
    _ga4Initialized?: boolean;
  }
}

export class AnalyticsService {
  private static fbPixelId: string | null = null;
  private static ga4Id: string | null = null;

  static init(settings?: Record<string, string>) {
    const fbId = settings?.FB_PIXEL_ID || import.meta.env.VITE_FB_PIXEL_ID;
    const gaId = settings?.GA4_MEASUREMENT_ID || import.meta.env.VITE_GA4_MEASUREMENT_ID;

    // 1. Initialize Google Tag Manager / GA4
    if (gaId && !window._ga4Initialized) {
      this.ga4Id = gaId;
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      gtag('js', new Date());
      gtag('config', gaId, { send_page_view: false });
      window._ga4Initialized = true;
    }

    // 2. Initialize Facebook Pixel
    if (fbId && !window._fbqInitialized) {
      this.fbPixelId = fbId;
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      if (window.fbq) {
        window.fbq('init', fbId);
        window._fbqInitialized = true;
      }
    }
  }

  static trackPageView(title: string, path: string) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_title: title,
      page_location: window.location.href,
      page_path: path,
    });

    if (window.gtag && this.ga4Id) {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_path: path,
      });
    }

    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }

  static trackViewItem(product: { id: string; name: string; price: number; category?: string; brand?: string }) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            item_brand: product.brand,
          },
        ],
      },
    });

    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BDT',
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, price: product.price }],
      });
    }

    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BDT',
      });
    }
  }

  static trackAddToCart(product: { id: string; name: string; price: number }, quantity: number = 1) {
    const value = product.price * quantity;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity,
          },
        ],
      },
    });

    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'BDT',
        value,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
      });
    }

    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value,
        currency: 'BDT',
      });
    }
  }

  static trackRemoveFromCart(product: { id: string; name: string; price: number }, quantity: number = 1) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'BDT',
        value: product.price * quantity,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
      },
    });
  }

  static trackBeginCheckout(items: any[], totalAmount: number) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: totalAmount,
        items: items.map((i) => ({
          item_id: i.productId || i.id,
          item_name: i.productName || i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    });

    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'BDT',
        value: totalAmount,
      });
    }

    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: totalAmount,
        currency: 'BDT',
        num_items: items.length,
      });
    }
  }

  static trackPurchase(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    shippingFee?: number;
    discount?: number;
    items?: any[];
  }) {
    // Prevent duplicate event firing on page reloads
    const storageKey = `analytics_purchase_tracked_${order.orderNumber || order.id}`;
    if (sessionStorage.getItem(storageKey)) {
      return;
    }
    sessionStorage.setItem(storageKey, 'true');

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: order.orderNumber || order.id,
        value: order.totalAmount,
        shipping: order.shippingFee || 0,
        currency: 'BDT',
        items: (order.items || []).map((i) => ({
          item_id: i.productId || i.id,
          item_name: i.productName || i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    });

    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.orderNumber || order.id,
        value: order.totalAmount,
        currency: 'BDT',
        shipping: order.shippingFee || 0,
      });
    }

    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: order.totalAmount,
        currency: 'BDT',
        content_type: 'product',
        order_id: order.orderNumber || order.id,
      });
    }
  }
}
