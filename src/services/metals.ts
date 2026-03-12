import { createClient } from '@/lib/supabase/server';

const API_KEY = process.env.METALS_DEV_API_KEY;
const BASE_URL = 'https://api.metals.dev/v1/latest';
const CURRENCIES = 'USD'; // Default currency
// Common metals mapping: API Symbol -> Display Name
const METAL_MAP: Record<string, string> = {
    'gold': 'Gold',
    'silver': 'Silver',
    'platinum': 'Platinum',
    'palladium': 'Palladium',
    'copper': 'Copper',
    'aluminum': 'Aluminum',
    'lead': 'Lead',
    'nickel': 'Nickel',
    'zinc': 'Zinc',
    'tin': 'Tin',
    'lithium': 'Lithium', // Check API support
    'cobalt': 'Cobalt'
};

interface MetalPriceResponse {
    status: string;
    currency: string;
    unit: string;
    metals: Record<string, number>;
    currencies: Record<string, number>;
    timestamps: Record<string, string>;
}

export async function fetchAndCacheMetalPrices() {
    if (!API_KEY) {
        console.warn('METALS_DEV_API_KEY is missing. Skipping live price fetch.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}?api_key=${API_KEY}&currency=${CURRENCIES}&unit=kg`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Metals API Error: ${response.statusText}`);
        }

        const data: MetalPriceResponse = await response.json();
        const supabase = await createClient();

        if (data.status === 'success') {
            const updates = Object.entries(data.metals).map(([key, pricePerKg]) => {
                // Determine standard unit based on metal type
                let standardUnit = 'kg';
                let price = pricePerKg;

                // Precious metals usually traded in troy ounces
                const isPrecious = /gold|silver|platinum|palladium|rhodium|iridium|ruthenium|osmium/i.test(key);

                if (isPrecious) {
                    standardUnit = 'toz';
                    // Convert kg price to toz price
                    // 1 kg = 32.1507465686 toz
                    // Price/toz = Price/kg / 32.1507465686
                    price = pricePerKg / 32.1507465686;
                }

                // Format Name: Use map or capitalize key
                const name = METAL_MAP[key] || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                // Simple mock change calculation
                const change = (Math.random() * 5 - 2.5).toFixed(2);

                return {
                    symbol: key.toUpperCase(),
                    name,
                    price: Number(price.toFixed(2)), // Ensure 2 decimal places
                    currency: data.currency,
                    unit: standardUnit,
                    change: Number(change),
                    last_updated: new Date().toISOString()
                };
            });

            const { error } = await supabase.rpc('cache_market_prices', { updates });

            if (error) console.error('Error caching metal prices:', error);
        }
    } catch (error) {
        console.error('Failed to fetch metal prices:', error);
    }
}

export async function getCurrentMarketPricesContext() {
    const supabase = await createClient();
    const { data: prices, error } = await supabase
        .from('market_prices')
        .select('*');

    if (error || !prices || prices.length === 0) {
        // Fallback to minimal hardcoded if DB empty
        return "Current market context unavailable. Use conservative estimates: Gold $60/g, Silver $0.80/g, Copper $8/kg.";
    }

    const priceStrings = prices.map(p => `${p.name} (${p.symbol}): $${p.price}/${p.unit}`).join(', ');
    return `CURRENT LIVE MARKET PRICES (USD): ${priceStrings}. Use these rates to calculate the estimatedValue of the item based on identified metal concentrations.`;
}
