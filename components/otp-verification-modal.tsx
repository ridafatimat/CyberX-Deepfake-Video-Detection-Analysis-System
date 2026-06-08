'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InputOTP } from '@/components/ui/input-otp';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, RotateCcw, Mail } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onCancel: () => void;
}

export function OTPVerificationModal({ email, onVerify, onResend, onCancel }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const success = await onVerify(otp);
      if (success) {
        setMessage({ type: 'success', text: 'Verification successful!' });
      } else {
        setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
      setMessage({ type: 'success', text: 'OTP resent to your email' });
      setOtp('');
      setTimeLeft(300);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend OTP' });
    }
    setResending(false);
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <Card className="bg-slate-900 border-cyan-900/30 p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">Verify Your Identity</h2>
          <p className="text-gray-400 text-sm mt-2">
            We&apos;ve sent a 6-digit code to {email}
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded flex items-center gap-2 border text-sm ${
            message.type === 'success'
              ? 'bg-green-950/20 border-green-500/30 text-green-300'
              : 'bg-red-950/20 border-red-500/30 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">Enter OTP</label>
            <InputOTP value={otp} onChange={setOtp} maxLength={6} />
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3">
              OTP expires in: <span className={timeLeft < 60 ? 'text-red-400 font-semibold' : 'text-gray-400'}>{formatTimeLeft(timeLeft)}</span>
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>

          <Button
            onClick={handleResend}
            disabled={resending}
            variant="outline"
            className="w-full border-cyan-900/30 text-gray-300 hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {resending ? 'Resending...' : 'Resend OTP'}
          </Button>

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-300 hover:bg-slate-800/50"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
