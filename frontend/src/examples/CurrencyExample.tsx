/**
 * Example: How to use the multi-currency system in React components
 */

import React, { useState, useEffect } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import CurrencySelector from '../components/common/CurrencySelector';
import { convertAndFormatPrice, formatPrice } from '../services/currencyService';

// Example 1: Using the useCurrency hook
export const CourseCard: React.FC<{ courseId: string; usdPrice: number }> = ({ courseId, usdPrice }) => {
  const { currency, convertAndFormatPrice, isLoading } = useCurrency();
  const [displayPrice, setDisplayPrice] = useState<string>('');

  useEffect(() => {
    if (!isLoading) {
      convertAndFormatPrice(usdPrice).then(setDisplayPrice);
    }
  }, [currency, usdPrice, convertAndFormatPrice, isLoading]);

  return (
    <div className="course-card">
      <h3>Course Title</h3>
      <p className="price">{displayPrice || 'Loading...'}</p>
    </div>
  );
};

// Example 2: Simple price display
export const PriceDisplay: React.FC<{ usdPrice: number }> = ({ usdPrice }) => {
  const { currency, convertAndFormatPrice } = useCurrency();
  const [formattedPrice, setFormattedPrice] = useState<string>('');

  useEffect(() => {
    convertAndFormatPrice(usdPrice).then(setFormattedPrice);
  }, [currency, usdPrice, convertAndFormatPrice]);

  return <span>{formattedPrice}</span>;
};

// Example 3: Checkout with currency
export const CheckoutButton: React.FC<{ courseId: string; usdPrice: number }> = ({ courseId, usdPrice }) => {
  const { currency, convertPrice } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Convert price to selected currency
      const convertedPrice = await convertPrice(usdPrice);

      // Send to backend with currency
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          currency, // Send selected currency
          // ... other booking data
        }),
      });

      const data = await response.json();
      
      // Use payment price from response
      if (data.payment) {
        // Redirect to payment gateway with converted price
        console.log('Payment amount:', data.payment.amount);
        console.log('Payment currency:', data.payment.currency);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={isProcessing}>
      {isProcessing ? 'Processing...' : 'Checkout'}
    </button>
  );
};

// Example 4: Full page with currency selector
export const CoursePage: React.FC = () => {
  const { currency, formatPrice, isLoading } = useCurrency();
  const coursePriceUSD = 99.99;

  return (
    <div>
      <header>
        <CurrencySelector />
      </header>
      
      <main>
        <h1>Course Title</h1>
        {isLoading ? (
          <p>Loading prices...</p>
        ) : (
          <p>Price: {formatPrice(coursePriceUSD)}</p>
        )}
      </main>
    </div>
  );
};

// Example 5: Using service directly (without hook)
export const SimplePrice: React.FC<{ usdPrice: number }> = ({ usdPrice }) => {
  const [price, setPrice] = useState<string>('');

  useEffect(() => {
    convertAndFormatPrice(usdPrice).then(setPrice);
  }, [usdPrice]);

  return <span>{price}</span>;
};

