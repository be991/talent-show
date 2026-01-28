'use client';

import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/atoms/Button';
import { ChevronRight } from 'lucide-react';

interface PaystackButtonProps {
  config: any;
  amount: number;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export default function PaystackButton({ config, amount, onSuccess, onClose }: PaystackButtonProps) {
  const initializePayment = usePaystackPayment(config);
  
  return (
    <Button 
      size="lg"
      className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
      onClick={() => initializePayment({ onSuccess, onClose })}
    >
      Pay ₦{amount.toLocaleString()} Now
      <ChevronRight className="w-5 h-5 ml-2" />
    </Button>
  );
}
