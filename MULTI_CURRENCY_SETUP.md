# Multi-Currency System Setup Guide

## Overview
This system implements a production-ready multi-currency solution where:
- **Base Currency**: USD (all prices stored in database)
- **Exchange Rates**: Fetched from ExchangeRate-API every 6 hours
- **Caching**: Redis for fast access
- **Frontend**: Real-time conversion using cached rates

## Prerequisites

1. **Redis Server**
   - Install Redis: https://redis.io/download
   - Or use Docker: `docker run -d -p 6379:6379 redis:alpine`

2. **ExchangeRate-API Account**
   - Sign up at: https://www.exchangerate-api.com/
   - Get your free API key (1000 requests/month free tier)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install redis node-cron
```

### 2. Environment Variables

Add to `backend/.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, leave empty if no password

# ExchangeRate-API Configuration
EXCHANGE_RATE_API_KEY=your_api_key_here
EXCHANGE_RATE_API_URL=https://v6.exchangerate-api.com/v6

# Base Currency (should be USD)
BASE_CURRENCY=USD
```

### 3. Start Redis

**Local:**
```bash
redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 4. Start Backend Server

The server will automatically:
- Connect to Redis on startup
- Fetch initial exchange rates
- Start cron job (runs every 6 hours)

```bash
npm run dev
```

## Frontend Setup

### 1. Usage Example

```tsx
import { useCurrency } from './hooks/useCurrency';
import CurrencySelector from './components/common/CurrencySelector';

function MyComponent() {
  const { currency, convertAndFormatPrice, isLoading } = useCurrency();
  const [displayPrice, setDisplayPrice] = useState('');

  useEffect(() => {
    // Convert USD price to selected currency
    convertAndFormatPrice(99.99).then(setDisplayPrice);
  }, [currency, convertAndFormatPrice]);

  return (
    <div>
      <CurrencySelector />
      <p>Price: {displayPrice}</p>
    </div>
  );
}
```

### 2. Display Price in Component

```tsx
import { formatPrice, convertPrice } from '../services/currencyService';

// Simple formatting
const formatted = formatPrice(99.99, 'USD'); // "$99.99"

// Convert and format
const converted = await convertAndFormatPrice(99.99, 'INR'); // "₹8,299.17"
```

## API Endpoints

### GET /api/currency/exchange-rates

Returns cached exchange rates from Redis.

**Response:**
```json
{
  "success": true,
  "baseCurrency": "USD",
  "rates": {
    "USD": 1,
    "INR": 83.0,
    "EUR": 0.92,
    ...
  },
  "timestamp": 1234567890,
  "cacheAge": 3600000,
  "isStale": false
}
```

### POST /api/currency/convert

Convert amount between currencies.

**Request:**
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "originalAmount": 100,
  "convertedAmount": 8300,
  "fromCurrency": "USD",
  "toCurrency": "INR"
}
```

## Checkout Integration

### Frontend (Send currency)

```tsx
const handleCheckout = async (courseId: string) => {
  const selectedCurrency = getSelectedCurrency();
  
  const response = await fetch('/api/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId,
      currency: selectedCurrency, // Send selected currency
      // ... other booking data
    }),
  });
};
```

### Backend (Recalculate price)

```javascript
import { convertPriceForCheckout } from '../middlewares/currencyMiddleware.js';

export const createBooking = async (req, res, next) => {
  try {
    const { courseId, currency } = req.body;
    
    // Get course price in USD (from database)
    const course = await Course.findById(courseId);
    const usdPrice = course.price; // Stored in USD
    
    // Convert to requested currency
    const convertedPrice = await convertPriceForCheckout(usdPrice, currency);
    
    // Send converted price to payment gateway
    const paymentData = {
      amount: convertedPrice,
      currency: currency,
      // ...
    };
    
    // Process payment...
  } catch (error) {
    next(error);
  }
};
```

## Database Schema

**Important**: All prices in database must be stored in USD.

```javascript
// Course Model
{
  price: 99.99, // USD
  currency: "USD" // Always USD
}

// TeacherCourse Model
{
  price: 50.00, // USD per hour
  currency: "USD" // Always USD
}
```

## Cron Job

The exchange rate cron job:
- Runs every 6 hours
- Fetches latest rates from ExchangeRate-API
- Stores in Redis with 7-day expiry
- Falls back to cached rates if API fails

**Manual trigger:**
```javascript
import { fetchAndStoreExchangeRates } from './services/exchangeRateService.js';
await fetchAndStoreExchangeRates();
```

## Error Handling

The system includes multiple fallback mechanisms:

1. **API Failure**: Uses cached rates from Redis
2. **Redis Failure**: Uses hardcoded fallback rates
3. **Stale Cache**: Still uses cache but marks as stale

## Testing

### Test Exchange Rate Fetching

```bash
curl http://localhost:5000/api/currency/exchange-rates
```

### Test Currency Conversion

```bash
curl -X POST http://localhost:5000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "fromCurrency": "USD", "toCurrency": "INR"}'
```

## Troubleshooting

### Redis Connection Failed
- Check Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT in .env

### Exchange Rates Not Updating
- Check EXCHANGE_RATE_API_KEY is set
- Verify API key is valid
- Check cron job logs in server console

### Prices Not Converting
- Ensure prices in DB are in USD
- Check currency parameter is being sent
- Verify exchange rates are cached in Redis

## Production Considerations

1. **Rate Limiting**: ExchangeRate-API free tier has limits
2. **Redis Persistence**: Configure Redis persistence for production
3. **Monitoring**: Monitor cron job execution and API failures
4. **Fallback**: Always have fallback rates for critical operations
5. **Caching**: Adjust cache duration based on your needs

## Support

For issues or questions, check:
- ExchangeRate-API docs: https://www.exchangerate-api.com/docs
- Redis docs: https://redis.io/documentation

