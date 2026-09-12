export function Terms() {
  return (
    <section id="terms" className="relative z-10 py-20 border-t border-slate-800 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            TRANSPARENCY &amp; PROTOCOLS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Official Terms &amp; Conditions
          </h2>
          <p className="text-slate-400 mt-2">
            Clear, automated, zero-deduction guidelines for global investors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              💳
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">Withdrawal Limits</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Minimum: <strong>$2 USDT</strong><br />
                Maximum: <strong>$5,000 USDT</strong> per transaction.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shrink-0">
              ⏰
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">Daily Withdrawal Window</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Open everyday strictly between <strong>10:00 AM To 02:00 PM (IST)</strong> for automated batch dispatch.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
              🛡️
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">Zero Deductions (100% Payout)</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong>0% Admin Charge, Zero TDS, Zero Withdrawal Fees.</strong> You receive 100% of your earnings.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              🔓
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">No Direct Condition to Withdraw</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                No mandatory sponsor condition required to withdraw your earnings. Complete financial freedom.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">ID Activation &amp; P2P Transfer</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Activate new accounts from Income wallet with 0% fee. Instant member-to-member P2P transfers.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shrink-0">
              🔗
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">USDT BEP-20 Standard</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                All blockchain deposits and withdrawals operate seamlessly on BNB Smart Chain (BEP-20) in 100% USDT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}