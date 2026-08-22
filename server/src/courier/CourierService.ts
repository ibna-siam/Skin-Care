import { prisma } from '../config/db.js';
import { ICourierProvider } from './ICourierProvider.js';
import { SteadfastCourierProvider } from './SteadfastCourierProvider.js';
import { PathaoCourierProvider } from './PathaoCourierProvider.js';

export class CourierService {
  static async getProvider(providerName: string = 'Steadfast'): Promise<ICourierProvider> {
    const norm = providerName.toLowerCase().trim();

    // Fetch dynamic store settings from database
    const settings = await prisma.storeSetting.findMany({
      where: { group: 'COURIER' },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    if (norm === 'pathao') {
      return new PathaoCourierProvider({
        clientId: map['PATHAO_CLIENT_ID'] || process.env.PATHAO_CLIENT_ID,
        clientSecret: map['PATHAO_CLIENT_SECRET'] || process.env.PATHAO_CLIENT_SECRET,
        username: map['PATHAO_USERNAME'] || process.env.PATHAO_USERNAME,
        password: map['PATHAO_PASSWORD'] || process.env.PATHAO_PASSWORD,
        storeId: map['PATHAO_STORE_ID'] || process.env.PATHAO_STORE_ID,
      });
    }

    // Default to Steadfast
    return new SteadfastCourierProvider(
      map['STEADFAST_API_KEY'] || process.env.STEADFAST_API_KEY,
      map['STEADFAST_SECRET_KEY'] || process.env.STEADFAST_SECRET_KEY,
      map['STEADFAST_BASE_URL'] || process.env.STEADFAST_BASE_URL
    );
  }
}
