import { PaymentMethod } from '@skincare/shared';
import { PaymentProvider } from './PaymentProvider.js';
import { CODProvider } from './CODProvider.js';
import { BKashProvider } from './BKashProvider.js';
import { NagadProvider } from './NagadProvider.js';
import { SSLCommerzProvider } from './SSLCommerzProvider.js';

export class PaymentService {
  private static providers: Map<PaymentMethod, PaymentProvider> = new Map<PaymentMethod, PaymentProvider>([
    ['COD', new CODProvider()],
    ['BKASH', new BKashProvider()],
    ['NAGAD', new NagadProvider()],
    ['SSLCOMMERZ', new SSLCommerzProvider()],
    ['CARD', new SSLCommerzProvider()],
  ]);

  static getProvider(method: PaymentMethod): PaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return provider;
  }
}
