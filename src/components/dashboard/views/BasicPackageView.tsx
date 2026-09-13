"use client";

import React, { useState } from 'react';
import { Package, Check, X, ShieldCheck } from 'lucide-react';

interface UserData {
  id: string;
  customId: string;
  fullName: string;
  email: string;
  fundBalance: number;
}

interface BasicPackageViewProps {
  user: any;
  onRefresh?: () => void;
  onRefreshUser?: () => void;
}

const PACKAGE_TEMPLATES = [
  { id: 1, name: 'Starter', amount: 5 },
  { id: 2, name: 'Basic', amount: 10 },
  { id: 3, name: 'Silver', amount: 20 },
  { id: 4, name: 'Gold', amount: 50 },
  { id: 5, name: 'Platinum', amount: 100 },
  { id: 6, name: 'Diamond', amount: 500 },
  { id: 7, name: 'Elite', amount: 1000 },
  { id: 8, name: 'Royal', amount: 2000 },
  { id: 9, name: 'Crown', amount: 5000 },
];

export function BasicPackageView({ user, onRefresh, onRefreshUser }: BasicPackageViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [transactionPin, setTransactionPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dynamic system configurations set by Admin
  const cfg = user?.systemConfig || {};
  const dailyRoiRate = cfg.BASIC_PLAN_DAILY_ROI !== undefined ? Number(cfg.BASIC_PLAN_DAILY_ROI) : 5.0;
  const tenureDays = cfg.BASIC_PLAN_TENURE_DAYS !== undefined ? Number(cfg.BASIC_PLAN_TENURE_DAYS) : 30;
  const usdtToInrRate = cfg.USDT_TO_INR_RATE !== undefined ? Number(cfg.USDT_TO_INR_RATE) : 110;

  const dynamicPackages = PACKAGE_TEMPLATES.map((tmpl) => {
    const dailyRoi = (tmpl.amount * dailyRoiRate) / 100;
    const totalReturn = dailyRoi * tenureDays;
    return {
      ...tmpl,
      dailyRoi,
      days: tenureDays,
      totalReturn,
    };
  });

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    if (transactionPin.length !== 6) {
      setError('Transaction PIN must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/packages/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: 'BASIC_SAVING',
          amountInInr: selectedPlan.amount * usdtToInrRate,
          transactionPin
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to purchase package');
      }

      setSuccess(`Successfully purchased ${selectedPlan.name} package!`);
      setSelectedPlan(null);
      setTransactionPin('');
      if (onRefresh) onRefresh();
      if (onRefreshUser) onRefreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070e20] p-6 rounded-2xl border border-[#152238]">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Basic Packages</h2>
          <p className="text-slate-400">Fixed {dailyRoiRate}% daily ROI for {tenureDays} days</p>
        </div>
        <div className="bg-[#0a1229] p-4 rounded-xl border border-[#152238] flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Available Fund Balance</p>
            <p className="text-xl font-bold text-white">${user?.fundBalance?.toFixed(2) || '0.00'} USDT</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
          <X size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dynamicPackages.map((plan) => (
          <div key={plan.id} className="bg-[#070e20] rounded-2xl border border-[#152238] overflow-hidden flex flex-col hover:border-purple-500/50 transition-colors">
            <div className="p-6 border-b border-[#152238] bg-gradient-to-br from-purple-500/5 to-transparent relative">
              <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-full">
                {dailyRoiRate}% Daily
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">${plan.amount}</span>
                <span className="text-slate-400">USDT</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Daily ROI</span>
                  <span className="text-white font-medium">${plan.dailyRoi.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white font-medium">{plan.days} Days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Return</span>
                  <span className="text-green-400 font-bold">${plan.totalReturn.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors mt-auto"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#070e20] rounded-2xl border border-[#152238] w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#152238] flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-purple-400" />
                Confirm Purchase
              </h3>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setTransactionPin('');
                  setError('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-[#0a1229] p-4 rounded-xl border border-[#152238]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Package</span>
                  <span className="text-white font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-bold">${selectedPlan.amount} USDT</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#152238]">
                  <span className="text-slate-400">Daily Return</span>
                  <span className="text-green-400 font-medium">${selectedPlan.dailyRoi.toFixed(2)} / day</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Transaction PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full bg-[#0a1229] border border-[#152238] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    setTransactionPin('');
                    setError('');
                  }}
                  className="flex-1 py-3 px-4 bg-[#0a1229] hover:bg-[#152238] border border-[#152238] text-white rounded-xl font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={loading || transactionPin.length !== 6}
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
