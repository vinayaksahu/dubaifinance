import os
import base64
import subprocess
import fitz

workspace = os.path.dirname(os.path.abspath(__file__))

def get_base64_image(rel_path):
    full_path = os.path.join(workspace, rel_path)
    if os.path.exists(full_path):
        with open(full_path, "rb") as img_file:
            encoded = base64.b64encode(img_file.read()).decode('utf-8')
            mime = "image/jpeg" if full_path.endswith((".jpg", ".jpeg")) else "image/png"
            return f"data:{mime};base64,{encoded}"
    return ""

# Load all images
hero_b64 = get_base64_image("assets/hero_skyline.jpg")
office_b64 = get_base64_image("assets/office_building.jpg")
trading_b64 = get_base64_image("assets/crypto_trading.jpg")
rewards_b64 = get_base64_image("assets/luxury_rewards.jpg")
blockchain_b64 = get_base64_image("assets/usdt_blockchain.jpg")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dubai Finance - Official Business Presentation (USDT BEP-20)</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700;800&display=swap');

* {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}}

body {{
    background-color: #030712;
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans', sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}}

@page {{
    size: 1920px 1080px;
    margin: 0;
}}

.slide {{
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    background: radial-gradient(circle at 80% 20%, #151d38 0%, #080c18 55%, #03060f 100%);
    padding: 70px 100px;
    display: flex;
    flex-direction: column;
}}

/* Top Brand Header Bar */
.slide-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 36px;
    position: relative;
    z-index: 10;
}}

.logo-container {{
    display: flex;
    align-items: center;
    gap: 16px;
}}

.logo-badge {{
    width: 54px;
    height: 54px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);
}}

.logo-text {{
    font-family: 'Space Grotesk', sans-serif;
    font-size: 36px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #ffd056;
}}

.header-badge {{
    background: rgba(255, 208, 86, 0.1);
    border: 1px solid rgba(255, 208, 86, 0.35);
    color: #fce082;
    padding: 10px 24px;
    border-radius: 999px;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
}}

/* Bottom Footer Bar */
.slide-footer {{
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 18px;
    font-size: 16px;
    color: #64748b;
    font-weight: 600;
    position: relative;
    z-index: 10;
}}

/* Typography */
.category-title {{
    color: #ffd056;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 10px;
}}

.main-title {{
    font-family: 'Space Grotesk', sans-serif;
    font-size: 64px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.15;
    margin-bottom: 12px;
}}

.subtitle {{
    font-size: 25px;
    color: #94a3b8;
    margin-bottom: 36px;
    line-height: 1.4;
}}

/* Glass Cards */
.card {{
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 34px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
    position: relative;
    backdrop-filter: blur(16px);
}}

.card-gold {{
    border: 1px solid rgba(255, 208, 86, 0.35);
    background: linear-gradient(145deg, rgba(26, 32, 53, 0.9), rgba(15, 23, 42, 0.85));
    box-shadow: 0 20px 50px rgba(245, 158, 11, 0.12);
}}

.card-vip {{
    border: 2px solid #ffd056;
    background: linear-gradient(145deg, rgba(35, 42, 70, 0.95), rgba(18, 25, 48, 0.9));
    box-shadow: 0 25px 60px rgba(245, 158, 11, 0.25);
}}

/* Tables */
.custom-table {{
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
}}

.custom-table th {{
    background: #0f172a;
    color: #ffd056;
    padding: 20px 24px;
    font-size: 21px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid rgba(255, 208, 86, 0.3);
    text-align: left;
}}

.custom-table td {{
    background: rgba(15, 23, 42, 0.65);
    padding: 17px 24px;
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}}

.custom-table tr:last-child td {{
    border-bottom: none;
}}

.custom-table tr:nth-child(even) td {{
    background: rgba(30, 41, 59, 0.45);
}}

/* Grid Utilities */
.grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}}

.grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 36px;
}}

.grid-4 {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
}}

.grid-5 {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
}}

/* Button & Pill */
.btn-primary {{
    background: linear-gradient(135deg, #e11d48, #be123c);
    color: #ffffff;
    font-size: 22px;
    font-weight: 800;
    padding: 16px 36px;
    border-radius: 16px;
    display: inline-block;
    box-shadow: 0 10px 30px rgba(225, 29, 72, 0.4);
}}

.btn-gold {{
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #030712;
    font-size: 24px;
    font-weight: 900;
    padding: 18px 40px;
    border-radius: 16px;
    display: inline-block;
    box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
}}
</style>
</head>
<body>

<!-- ==================== SLIDE 01: COVER ==================== -->
<div class="slide" style="justify-content: center; align-items: flex-start; background: linear-gradient(rgba(3, 7, 18, 0.72), rgba(3, 7, 18, 0.88)), url('{hero_b64}') center/cover no-repeat; padding-left: 120px; padding-right: 120px;">
    <div style="background: rgba(255, 208, 86, 0.15); border: 2px solid #ffd056; padding: 12px 30px; border-radius: 999px; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">⚜️</span>
        <span style="color: #ffd056; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Official Business Presentation 2024-2025</span>
    </div>
    
    <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 110px; font-weight: 900; color: #ffd056; line-height: 1; letter-spacing: 2px; margin-bottom: 20px; text-shadow: 0 10px 40px rgba(0,0,0,0.8);">
        DUBAI FINANCE
    </h1>
    
    <p style="font-size: 32px; color: #e2e8f0; font-weight: 600; margin-bottom: 44px; max-width: 1500px; line-height: 1.4;">
        Decentralized High-Yield Wealth Ecosystem • Powered by <span style="color: #38bdf8; font-weight: 800; white-space: nowrap;">USDT (BEP-20)</span>
    </p>

    <!-- Key Metrics Ribbon -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; width: 100%; max-width: 1680px; margin-bottom: 44px;">
        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #ffd056;">5% DAILY</div>
            <div style="font-size: 18px; color: #94a3b8; font-weight: 700; margin-top: 6px;">BASIC ROI (30 DAYS)</div>
        </div>
        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #38bdf8;">10% & 15%</div>
            <div style="font-size: 18px; color: #94a3b8; font-weight: 700; margin-top: 6px;">FIX DEPOSIT (FD) ROI</div>
        </div>
        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #10b981;">15% INSTANT</div>
            <div style="font-size: 18px; color: #94a3b8; font-weight: 700; margin-top: 6px;">DIRECT REFERRAL</div>
        </div>
        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #f43f5e;">12 LEVELS</div>
            <div style="font-size: 18px; color: #94a3b8; font-weight: 700; margin-top: 6px;">DAILY TEAM ROYALTY</div>
        </div>
        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #a855f7;">REWARDS</div>
            <div style="font-size: 18px; color: #94a3b8; font-weight: 700; margin-top: 6px;">CARS, TRIPS & CASH</div>
        </div>
    </div>

    <div style="display: flex; align-items: center; gap: 40px;">
        <div class="btn-primary" style="font-size: 26px; padding: 18px 48px;">JOIN WITH AS LOW AS $5 USDT</div>
        <div style="font-size: 24px; color: #94a3b8; font-weight: 700;">🌐 Dubaifinance.online</div>
        <div style="font-size: 24px; color: #94a3b8; font-weight: 700;">📍 Sheikh Zayed Road, Dubai, UAE</div>
    </div>
</div>

<!-- ==================== SLIDE 02: ABOUT COMPANY ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Corporate Profile</div>
    </div>
    
    <div class="category-title">Institutional Financial Strength</div>
    <h2 class="main-title">About Dubai Finance</h2>
    <p class="subtitle">A premier global financial conglomerate with 25+ years of cross-industry mastery and 7+ years of crypto market leadership.</p>

    <div class="grid-2" style="align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card" style="display: flex; gap: 24px; align-items: flex-start;">
                <div style="width: 70px; height: 70px; border-radius: 18px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 36px; border: 1px solid #ffd056;">🏢</div>
                <div>
                    <h3 style="font-size: 28px; font-weight: 800; color: #ffd056; margin-bottom: 8px;">25+ Years Proven Track Record</h3>
                    <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">Deep-rooted experience in Prime Real Estate, Five-Star Hospitality, Wholesale Trade, and Global Tourism & Travel networks.</p>
                </div>
            </div>

            <div class="card" style="display: flex; gap: 24px; align-items: flex-start;">
                <div style="width: 70px; height: 70px; border-radius: 18px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; font-size: 36px; border: 1px solid #38bdf8;">📈</div>
                <div>
                    <h3 style="font-size: 28px; font-weight: 800; color: #38bdf8; margin-bottom: 8px;">7+ Years Crypto Market Leadership</h3>
                    <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">Proprietary quantitative arbitrage, crypto derivatives trading, automated high-frequency bot liquidity, and risk-hedged futures strategies.</p>
                </div>
            </div>

            <div class="card" style="display: flex; gap: 24px; align-items: flex-start;">
                <div style="width: 70px; height: 70px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 36px; border: 1px solid #10b981;">💰</div>
                <div>
                    <h3 style="font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 8px;">$100+ Million Generated</h3>
                    <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">Substantial multi-million dollar liquidity generation enabling guaranteed, sustainable daily returns to community members worldwide.</p>
                </div>
            </div>
        </div>

        <div style="border-radius: 28px; overflow: hidden; border: 2px solid rgba(255, 208, 86, 0.3); height: 520px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            <img src="{trading_b64}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Institutional Corporate Profile</span>
        <span>Slide 02 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 03: LEADERSHIP & HEADQUARTERS ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Executive Management</div>
    </div>
    
    <div class="category-title">Visionary Leadership</div>
    <h2 class="main-title">CMD & Corporate Headquarters</h2>
    <p class="subtitle">Guided by visionary leadership and operating from the heart of the global financial district in Dubai, UAE.</p>

    <div class="grid-2" style="align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 28px;">
            <div class="card card-gold" style="padding: 40px;">
                <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px;">
                    <div style="width: 90px; height: 90px; border-radius: 24px; background: linear-gradient(135deg, #f59e0b, #b45309); display: flex; align-items: center; justify-content: center; font-size: 44px;">👨‍💼</div>
                    <div>
                        <div style="color: #94a3b8; font-size: 18px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Chairman & Managing Director</div>
                        <div style="color: #ffd056; font-size: 42px; font-weight: 900; font-family: 'Space Grotesk', sans-serif;">CMD Sheikh Tariq Al Mansoori</div>
                    </div>
                </div>
                <p style="font-size: 22px; color: #cbd5e1; line-height: 1.5;">
                    "Our mission is to democratize high-frequency institutional finance, ensuring every individual enjoys steady, transparent, and profitable daily returns powered by next-gen blockchain automation."
                </p>
            </div>

            <div class="card" style="padding: 36px;">
                <h4 style="font-size: 24px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Corporate Verification</h4>
                <div style="display: flex; flex-direction: column; gap: 16px; font-size: 20px;">
                    <div style="display: flex; gap: 16px;"><span style="color: #ffd056; font-size: 24px;">📍</span> <span><strong>Office Address:</strong> Office 3802, Latifa Tower, Sheikh Zayed Road, Dubai, UAE</span></div>
                    <div style="display: flex; gap: 16px;"><span style="color: #10b981; font-size: 24px;">🗓️</span> <span><strong>Official Launch Date:</strong> 15th December 2023</span></div>
                    <div style="display: flex; gap: 16px;"><span style="color: #f43f5e; font-size: 24px;">✉️</span> <span><strong>Official Email:</strong> support@dubaifinance.online</span></div>
                    <div style="display: flex; gap: 16px;"><span style="color: #a855f7; font-size: 24px;">🌐</span> <span><strong>Web Portal:</strong> Dubaifinance.online</span></div>
                </div>
            </div>
        </div>

        <div style="border-radius: 28px; overflow: hidden; border: 2px solid rgba(255, 208, 86, 0.3); height: 520px; position: relative; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            <img src="{office_b64}" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(3,7,18,0.95)); padding: 24px; text-align: center;">
                <div style="color: #ffd056; font-size: 24px; font-weight: 800;">DUBAI FINANCE HEADQUARTERS</div>
                <div style="color: #94a3b8; font-size: 18px; font-weight: 600;">Sheikh Zayed Road, Dubai, UAE</div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Executive Leadership & Headquarters</span>
        <span>Slide 03 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 04: WHY DUBAI FINANCE ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Core Advantages</div>
    </div>
    
    <div class="category-title">The Dubai Finance Edge</div>
    <h2 class="main-title">Why Dubai Finance?</h2>
    <p class="subtitle">Built on trust, blockchain transparency, and industry-leading payout parameters designed for maximum investor wealth.</p>

    <div class="grid-4" style="margin-top: 20px;">
        <div class="card card-gold" style="text-align: center; padding: 48px 30px;">
            <div style="width: 90px; height: 90px; margin: 0 auto 24px; border-radius: 24px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; font-size: 48px; border: 1px solid #38bdf8;">🌐</div>
            <h3 style="font-size: 30px; font-weight: 900; color: #38bdf8; margin-bottom: 14px;">100% USDT (BEP-20)</h3>
            <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">Zero currency volatility. Safe, fast, decentralized deposits and withdrawals on Binance Smart Chain.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 48px 30px;">
            <div style="width: 90px; height: 90px; margin: 0 auto 24px; border-radius: 24px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 48px; border: 1px solid #10b981;">🛡️</div>
            <h3 style="font-size: 30px; font-weight: 900; color: #10b981; margin-bottom: 14px;">100% Net Payout</h3>
            <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">0% Admin Deductions, 0% TDS, 0% Hidden Fees. You receive 100% of your hard-earned profits.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 48px 30px;">
            <div style="width: 90px; height: 90px; margin: 0 auto 24px; border-radius: 24px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 48px; border: 1px solid #ffd056;">⚡</div>
            <h3 style="font-size: 30px; font-weight: 900; color: #ffd056; margin-bottom: 14px;">Daily 5% ROI (30 Days)</h3>
            <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">Generates steady cash flow 7 days a week with transparent 30-day fixed tenure contracts.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 48px 30px;">
            <div style="width: 90px; height: 90px; margin: 0 auto 24px; border-radius: 24px; background: rgba(225, 29, 72, 0.15); display: flex; align-items: center; justify-content: center; font-size: 48px; border: 1px solid #e11d48;">🔓</div>
            <h3 style="font-size: 30px; font-weight: 900; color: #f43f5e; margin-bottom: 14px;">No Referral Condition</h3>
            <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">Withdraw your daily earnings freely every day. No compulsory direct referral required to withdraw!</p>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Key Competitive Strengths</span>
        <span>Slide 04 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 05: JOINING PACKAGES OVERVIEW ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Activation Tiers</div>
    </div>
    
    <div class="category-title">Accessible to Everyone</div>
    <h2 class="main-title">Joining Packages: $5 To $5,000 USDT</h2>
    <p class="subtitle">Select the package that fits your financial goals. All packages run on a disciplined <strong>30-Day Tenure</strong> at <strong>5% Daily ROI</strong>.</p>

    <!-- 9 Packages Grid (3x3) -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 10px;">
        <div class="card" style="padding: 24px; text-align: center; border: 1px solid rgba(56, 189, 248, 0.3);">
            <div style="font-size: 16px; color: #38bdf8; font-weight: 800; letter-spacing: 2px;">STARTER TIER</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffffff; margin: 8px 0;">$5 <span style="font-size: 22px; color: #94a3b8;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 700;">Daily ROI: $0.25 (5%) • 30 Days: $7.50</div>
        </div>

        <div class="card" style="padding: 24px; text-align: center; border: 1px solid rgba(56, 189, 248, 0.3);">
            <div style="font-size: 16px; color: #38bdf8; font-weight: 800; letter-spacing: 2px;">STARTER TIER</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffffff; margin: 8px 0;">$10 <span style="font-size: 22px; color: #94a3b8;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 700;">Daily ROI: $0.50 (5%) • 30 Days: $15.00</div>
        </div>

        <div class="card" style="padding: 24px; text-align: center; border: 1px solid rgba(56, 189, 248, 0.3);">
            <div style="font-size: 16px; color: #38bdf8; font-weight: 800; letter-spacing: 2px;">STARTER TIER</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffffff; margin: 8px 0;">$20 <span style="font-size: 22px; color: #94a3b8;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 700;">Daily ROI: $1.00 (5%) • 30 Days: $30.00</div>
        </div>

        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 16px; color: #ffd056; font-weight: 800; letter-spacing: 2px;">GROWTH TIER</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffd056; margin: 8px 0;">$50 <span style="font-size: 22px; color: #94a3b8;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 700;">Daily ROI: $2.50 (5%) • 30 Days: $75.00</div>
        </div>

        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 16px; color: #ffd056; font-weight: 800; letter-spacing: 2px;">GROWTH TIER</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffd056; margin: 8px 0;">$100 <span style="font-size: 22px; color: #94a3b8;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 700;">Daily ROI: $5.00 (5%) • 30 Days: $150.00</div>
        </div>

        <div class="card card-gold" style="padding: 24px; text-align: center;">
            <div style="font-size: 16px; color: #ffd056; font-weight: 800; letter-spacing: 2px;">GROWTH TIER</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffd056; margin: 8px 0;">$500 <span style="font-size: 22px; color: #94a3b8;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 700;">Daily ROI: $25.00 (5%) • 30 Days: $750.00</div>
        </div>

        <div class="card card-vip" style="padding: 24px; text-align: center;">
            <div style="font-size: 16px; color: #f43f5e; font-weight: 800; letter-spacing: 2px;">ELITE VIP</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffffff; margin: 8px 0;">$1,000 <span style="font-size: 22px; color: #ffd056;">USDT</span></div>
            <div style="font-size: 18px; color: #ffd056; font-weight: 800;">Daily ROI: $50.00 (5%) • 30 Days: $1,500.00</div>
        </div>

        <div class="card card-vip" style="padding: 24px; text-align: center;">
            <div style="font-size: 16px; color: #f43f5e; font-weight: 800; letter-spacing: 2px;">ELITE VIP</div>
            <div style="font-size: 52px; font-weight: 900; color: #ffffff; margin: 8px 0;">$2,000 <span style="font-size: 22px; color: #ffd056;">USDT</span></div>
            <div style="font-size: 18px; color: #ffd056; font-weight: 800;">Daily ROI: $100.00 (5%) • 30 Days: $3,000.00</div>
        </div>

        <div class="card card-vip" style="padding: 24px; text-align: center; border: 2px solid #10b981;">
            <div style="font-size: 16px; color: #10b981; font-weight: 800; letter-spacing: 2px;">ROYAL DIAMOND</div>
            <div style="font-size: 52px; font-weight: 900; color: #10b981; margin: 8px 0;">$5,000 <span style="font-size: 22px; color: #ffffff;">USDT</span></div>
            <div style="font-size: 18px; color: #10b981; font-weight: 900;">Daily ROI: $250.00 (5%) • 30 Days: $7,500.00</div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Complete Joining Packages Suite ($5 - $5,000)</span>
        <span>Slide 05 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 06: STARTER PACKAGES ($5, $10, $20) ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Starter Tier</div>
    </div>
    
    <div class="category-title">Accessible Micro-Investing</div>
    <h2 class="main-title">Starter Packages: $5 • $10 • $20 USDT</h2>
    <p class="subtitle">Ideal entry points for every beginner to experience automated daily earnings with zero barrier to entry.</p>

    <div class="grid-3" style="margin-top: 20px;">
        <!-- Card $5 -->
        <div class="card card-gold" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">MICRO STARTER</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffffff; font-family: 'Space Grotesk', sans-serif;">$5</div>
            <div style="font-size: 20px; color: #94a3b8; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.6); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$0.25 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$7.50 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$2.50 USDT (50%)</strong></div>
            </div>
        </div>

        <!-- Card $10 -->
        <div class="card card-gold" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">BASIC STARTER</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffffff; font-family: 'Space Grotesk', sans-serif;">$10</div>
            <div style="font-size: 20px; color: #94a3b8; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.6); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$0.50 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$15.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$5.00 USDT (50%)</strong></div>
            </div>
        </div>

        <!-- Card $20 -->
        <div class="card card-gold" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">ADVANCED STARTER</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffffff; font-family: 'Space Grotesk', sans-serif;">$20</div>
            <div style="font-size: 20px; color: #94a3b8; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.6); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$1.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$30.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$10.00 USDT (50%)</strong></div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Starter Packages ($5, $10, $20 USDT)</span>
        <span>Slide 06 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 07: GROWTH PACKAGES ($50, $100, $500) ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Growth Tier</div>
    </div>
    
    <div class="category-title">Accelerated Wealth Creation</div>
    <h2 class="main-title">Growth Packages: $50 • $100 • $500 USDT</h2>
    <p class="subtitle">Most popular investment brackets chosen by community members for fast daily income generation.</p>

    <div class="grid-3" style="margin-top: 20px;">
        <!-- Card $50 -->
        <div class="card card-gold" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #ffd056; color: #ffd056; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">GROWTH PRO</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffd056; font-family: 'Space Grotesk', sans-serif;">$50</div>
            <div style="font-size: 20px; color: #94a3b8; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.6); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$2.50 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$75.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$25.00 USDT (50%)</strong></div>
            </div>
        </div>

        <!-- Card $100 -->
        <div class="card card-gold" style="padding: 44px 36px; text-align: center; border: 2px solid #ffd056;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #030712; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 900; letter-spacing: 1px; margin-bottom: 20px;">MOST POPULAR</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffffff; font-family: 'Space Grotesk', sans-serif;">$100</div>
            <div style="font-size: 20px; color: #ffd056; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.6); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$5.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$150.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$50.00 USDT (50%)</strong></div>
            </div>
        </div>

        <!-- Card $500 -->
        <div class="card card-gold" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #ffd056; color: #ffd056; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">GROWTH ELITE</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffd056; font-family: 'Space Grotesk', sans-serif;">$500</div>
            <div style="font-size: 20px; color: #94a3b8; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.6); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$25.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$750.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$250.00 USDT (50%)</strong></div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Growth Packages ($50, $100, $500 USDT)</span>
        <span>Slide 07 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 08: VIP PACKAGES ($1000, $2000, $5000) ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">VIP Elite Club</div>
    </div>
    
    <div class="category-title">Maximum Yield Powerhouse</div>
    <h2 class="main-title">VIP Packages: $1,000 • $2,000 • $5,000 USDT</h2>
    <p class="subtitle">Designed for high-net-worth leaders seeking premier institutional daily returns and maximum reward points.</p>

    <div class="grid-3" style="margin-top: 20px;">
        <!-- Card $1,000 -->
        <div class="card card-vip" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f43f5e; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">VIP PLATINUM</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffffff; font-family: 'Space Grotesk', sans-serif;">$1,000</div>
            <div style="font-size: 20px; color: #ffd056; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.75); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$50.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$1,500.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$500.00 USDT (50%)</strong></div>
            </div>
        </div>

        <!-- Card $2,000 -->
        <div class="card card-vip" style="padding: 44px 36px; text-align: center;">
            <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #a855f7; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin-bottom: 20px;">VIP DIAMOND</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffffff; font-family: 'Space Grotesk', sans-serif;">$2,000</div>
            <div style="font-size: 20px; color: #ffd056; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.75); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$100.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$3,000.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$1,000.00 USDT (50%)</strong></div>
            </div>
        </div>

        <!-- Card $5,000 -->
        <div class="card card-vip" style="padding: 44px 36px; text-align: center; border: 2px solid #10b981;">
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; display: inline-block; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 900; letter-spacing: 1px; margin-bottom: 20px;">ROYAL CROWN VIP</div>
            <div style="font-size: 80px; font-weight: 900; color: #10b981; font-family: 'Space Grotesk', sans-serif;">$5,000</div>
            <div style="font-size: 20px; color: #ffffff; font-weight: 700; margin-bottom: 30px;">USDT BEP-20</div>

            <div style="background: rgba(3, 7, 18, 0.75); border-radius: 18px; padding: 24px; text-align: left; display: flex; flex-direction: column; gap: 14px; font-size: 20px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Yield (5%):</span> <strong style="color: #ffd056;">$250.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Tenure Duration:</span> <strong>30 Days</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Gross Return:</span> <strong style="color: #10b981;">$7,500.00 USDT</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Net Profit:</span> <strong style="color: #38bdf8;">$2,500.00 USDT (50%)</strong></div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • VIP Elite Packages ($1,000, $2,000, $5,000 USDT)</span>
        <span>Slide 08 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 09: COMPLETE PACKAGE MATRIX TABLE ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Financial Returns Matrix</div>
    </div>
    
    <div class="category-title">Comprehensive 30-Day Projections</div>
    <h2 class="main-title">Basic ROI Packages & Return Matrix</h2>
    <p class="subtitle">Complete transparent calculation of daily returns and total gross payout over the 30-day contractual tenure.</p>

    <table class="custom-table" style="margin-top: 10px;">
        <thead>
            <tr>
                <th>Package (USDT)</th>
                <th>Daily ROI (5%)</th>
                <th>10 Days Return</th>
                <th>20 Days Return</th>
                <th>30 Days (150% Return)</th>
                <th>Net Profit (50%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong style="color: #ffffff;">$5 USDT</strong></td>
                <td><strong style="color: #ffd056;">$0.25</strong></td>
                <td>$2.50</td>
                <td>$5.00</td>
                <td><strong style="color: #10b981;">$7.50 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$2.50 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffffff;">$10 USDT</strong></td>
                <td><strong style="color: #ffd056;">$0.50</strong></td>
                <td>$5.00</td>
                <td>$10.00</td>
                <td><strong style="color: #10b981;">$15.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$5.00 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffffff;">$20 USDT</strong></td>
                <td><strong style="color: #ffd056;">$1.00</strong></td>
                <td>$10.00</td>
                <td>$20.00</td>
                <td><strong style="color: #10b981;">$30.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$10.00 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffffff;">$50 USDT</strong></td>
                <td><strong style="color: #ffd056;">$2.50</strong></td>
                <td>$25.00</td>
                <td>$50.00</td>
                <td><strong style="color: #10b981;">$75.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$25.00 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$100 USDT</strong></td>
                <td><strong style="color: #ffd056;">$5.00</strong></td>
                <td>$50.00</td>
                <td>$100.00</td>
                <td><strong style="color: #10b981;">$150.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$50.00 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$500 USDT</strong></td>
                <td><strong style="color: #ffd056;">$25.00</strong></td>
                <td>$250.00</td>
                <td>$500.00</td>
                <td><strong style="color: #10b981;">$750.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$250.00 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$1,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$50.00</strong></td>
                <td>$500.00</td>
                <td>$1,000.00</td>
                <td><strong style="color: #10b981;">$1,500.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$500.00 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$2,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$100.00</strong></td>
                <td>$1,000.00</td>
                <td>$2,000.00</td>
                <td><strong style="color: #10b981;">$3,000.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$1,000.00 USDT</strong></td>
            </tr>
            <tr style="background: rgba(16, 185, 129, 0.1);">
                <td><strong style="color: #10b981;">$5,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$250.00</strong></td>
                <td>$2,500.00</td>
                <td>$5,000.00</td>
                <td><strong style="color: #10b981;">$7,500.00 USDT</strong></td>
                <td><strong style="color: #38bdf8;">+$2,500.00 USDT</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="slide-footer">
        <span>Dubai Finance • Complete 30-Day Financial Projections Matrix</span>
        <span>Slide 09 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 10: 5 TYPES OF INCOME ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Compensation Plan</div>
    </div>
    
    <div class="category-title">Multiple Revenue Streams</div>
    <h2 class="main-title">5 Powerful Types of Income</h2>
    <p class="subtitle">Experience an unprecedented combination of high-yield passive returns, team networking royalties, and milestone rewards.</p>

    <div class="grid-5" style="margin-top: 20px;">
        <div class="card card-gold" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 20px;">📈</div>
            <div style="font-size: 16px; color: #ffd056; font-weight: 800; letter-spacing: 1px;">INCOME 01</div>
            <h3 style="font-size: 26px; font-weight: 900; color: #ffffff; margin: 12px 0;">Basic Daily ROI</h3>
            <div style="font-size: 36px; font-weight: 900; color: #ffd056; margin-bottom: 10px;">5% Daily</div>
            <p style="font-size: 17px; color: #94a3b8; line-height: 1.4;">Earn 5% daily for 30 Days (150% gross). Credited 7 days a week.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 20px;">🏦</div>
            <div style="font-size: 16px; color: #38bdf8; font-weight: 800; letter-spacing: 1px;">INCOME 02</div>
            <h3 style="font-size: 26px; font-weight: 900; color: #ffffff; margin: 12px 0;">Fix Deposit (FD)</h3>
            <div style="font-size: 36px; font-weight: 900; color: #38bdf8; margin-bottom: 10px;">10% & 15%</div>
            <p style="font-size: 17px; color: #94a3b8; line-height: 1.4;">High-yield locked staking contracts delivering massive compounding yields.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 20px;">⚡</div>
            <div style="font-size: 16px; color: #10b981; font-weight: 800; letter-spacing: 1px;">INCOME 03</div>
            <h3 style="font-size: 26px; font-weight: 900; color: #ffffff; margin: 12px 0;">Direct Referral</h3>
            <div style="font-size: 36px; font-weight: 900; color: #10b981; margin-bottom: 10px;">15% Instant</div>
            <p style="font-size: 17px; color: #94a3b8; line-height: 1.4;">Instant 15% cash bonus credited directly in USDT for every sponsor.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 20px;">👥</div>
            <div style="font-size: 16px; color: #f43f5e; font-weight: 800; letter-spacing: 1px;">INCOME 04</div>
            <h3 style="font-size: 26px; font-weight: 900; color: #ffffff; margin: 12px 0;">Daily 12 Level</h3>
            <div style="font-size: 36px; font-weight: 900; color: #f43f5e; margin-bottom: 10px;">12 Levels</div>
            <p style="font-size: 17px; color: #94a3b8; line-height: 1.4;">Daily recurring team royalty up to 12 generations deep every single day.</p>
        </div>

        <div class="card card-gold" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 20px;">🏆</div>
            <div style="font-size: 16px; color: #a855f7; font-weight: 800; letter-spacing: 1px;">INCOME 05</div>
            <h3 style="font-size: 26px; font-weight: 900; color: #ffffff; margin: 12px 0;">Reward Income</h3>
            <div style="font-size: 36px; font-weight: 900; color: #a855f7; margin-bottom: 10px;">Mega Ranks</div>
            <p style="font-size: 17px; color: #94a3b8; line-height: 1.4;">Luxury watches, Dubai trips, and supercars on team turnover targets.</p>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • 5 Pillars of Wealth Generation</span>
        <span>Slide 10 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 11: INCOME 1 - BASIC ROI (5%) ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Income Stream #1</div>
    </div>
    
    <div class="category-title">Daily Passive Growth</div>
    <h2 class="main-title">Basic ROI Income: 5% Daily for 30 Days</h2>
    <p class="subtitle">Experience uninterrupted daily compounding yield credited directly into your wallet 7 days a week.</p>

    <div class="grid-2" style="align-items: center; margin-top: 10px;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card card-gold" style="padding: 36px;">
                <div style="font-size: 64px; font-weight: 900; color: #ffd056; line-height: 1; margin-bottom: 10px;">5% EVERY DAY</div>
                <div style="font-size: 26px; color: #f8fafc; font-weight: 800; margin-bottom: 14px;">Monday Through Sunday (No Non-Trading Days!)</div>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.5;">
                    Your capital is deployed into live institutional crypto arbitrage and quantitative scalping bots, delivering pure 5% daily cash flow without market risk exposure.
                </p>
            </div>

            <div class="card" style="padding: 36px;">
                <h4 style="font-size: 24px; font-weight: 800; color: #38bdf8; margin-bottom: 20px; text-transform: uppercase;">Key Tenure Parameters</h4>
                <div style="display: flex; flex-direction: column; gap: 14px; font-size: 21px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
                        <span>Contract Tenure:</span> <strong style="color: #ffd056;">30 Days Fixed</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
                        <span>Total Gross Payout:</span> <strong style="color: #10b981;">150% of Deposit</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
                        <span>Net ROI Profit:</span> <strong style="color: #38bdf8;">50% Pure Gain</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Re-Topup Facility:</span> <strong style="color: #ffffff;">Available Anytime</strong>
                    </div>
                </div>
            </div>
        </div>

        <div style="border-radius: 28px; overflow: hidden; border: 2px solid rgba(255, 208, 86, 0.3); height: 500px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            <img src="{hero_b64}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Income 1: 5% Daily ROI (30-Day Tenure)</span>
        <span>Slide 11 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 12: INCOME 2 - FIX DEPOSIT (FD) OVERVIEW ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Income Stream #2</div>
    </div>
    
    <div class="category-title">Institutional Staking Contracts</div>
    <h2 class="main-title">Fix Deposit (FD) Income: 10% & 15% Daily</h2>
    <p class="subtitle">Lock your capital in premier institutional liquidity pools and earn supercharged daily yields with contractual guarantees.</p>

    <div class="grid-2" style="margin-top: 20px;">
        <!-- FD Option 1 -->
        <div class="card card-gold" style="padding: 48px; border: 2px solid #38bdf8;">
            <div style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: inline-block; padding: 10px 26px; border-radius: 999px; font-size: 18px; font-weight: 800; letter-spacing: 2px; margin-bottom: 24px;">FD PLAN A</div>
            <div style="font-size: 80px; font-weight: 900; color: #38bdf8; font-family: 'Space Grotesk', sans-serif; line-height: 1; margin-bottom: 12px;">10% <span style="font-size: 32px; color: #ffffff;">DAILY</span></div>
            <div style="font-size: 24px; color: #cbd5e1; font-weight: 700; margin-bottom: 30px;">Contract Duration: 180 Days</div>

            <div style="background: rgba(3, 7, 18, 0.65); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 16px; font-size: 21px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Credited Yield:</span> <strong style="color: #38bdf8;">10% Daily</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Total Contract Return:</span> <strong style="color: #10b981;">1,800% Total</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Capital Lock:</span> <strong>Maturity Payout</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Level Income on FD:</span> <strong style="color: #ffd056;">Full Royalty Active</strong></div>
            </div>
        </div>

        <!-- FD Option 2 -->
        <div class="card card-vip" style="padding: 48px; border: 2px solid #ffd056;">
            <div style="background: rgba(245, 158, 11, 0.2); color: #ffd056; display: inline-block; padding: 10px 26px; border-radius: 999px; font-size: 18px; font-weight: 900; letter-spacing: 2px; margin-bottom: 24px;">FD PLAN B (VIP)</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffd056; font-family: 'Space Grotesk', sans-serif; line-height: 1; margin-bottom: 12px;">15% <span style="font-size: 32px; color: #ffffff;">DAILY</span></div>
            <div style="font-size: 24px; color: #cbd5e1; font-weight: 700; margin-bottom: 30px;">Contract Duration: 210 Days</div>

            <div style="background: rgba(3, 7, 18, 0.65); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 16px; font-size: 21px;">
                <div style="display: flex; justify-content: space-between;"><span>Daily Credited Yield:</span> <strong style="color: #ffd056;">15% Daily</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Total Contract Return:</span> <strong style="color: #10b981;">3,150% Total</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Capital Lock:</span> <strong>Maturity Payout</strong></div>
                <div style="display: flex; justify-content: space-between;"><span>Level Income on FD:</span> <strong style="color: #ffd056;">Full Royalty Active</strong></div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Income 2: Fix Deposit (FD) High-Yield Overview</span>
        <span>Slide 12 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 13: FD PLAN A - 10% DAILY PACKAGES ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">FD 180-Day Plan</div>
    </div>
    
    <div class="category-title">180 Days Contract Tenure</div>
    <h2 class="main-title">FD Plan A: 10% Daily ROI Breakdown</h2>
    <p class="subtitle">Complete tier-by-tier calculation of daily income and total 180-day returns in USDT (BEP-20).</p>

    <table class="custom-table" style="margin-top: 10px;">
        <thead>
            <tr>
                <th>FD Tier Deposit</th>
                <th>Daily Return (10%)</th>
                <th>30 Days Profit</th>
                <th>90 Days Profit</th>
                <th>Total 180 Days Return</th>
                <th>Multiple</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong style="color: #ffffff;">$50 USDT</strong></td>
                <td><strong style="color: #ffd056;">$5.00 / day</strong></td>
                <td>$150.00</td>
                <td>$450.00</td>
                <td><strong style="color: #10b981;">$900.00 USDT</strong></td>
                <td><span style="color: #38bdf8; font-weight: 800;">18X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffffff;">$100 USDT</strong></td>
                <td><strong style="color: #ffd056;">$10.00 / day</strong></td>
                <td>$300.00</td>
                <td>$900.00</td>
                <td><strong style="color: #10b981;">$1,800.00 USDT</strong></td>
                <td><span style="color: #38bdf8; font-weight: 800;">18X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$500 USDT</strong></td>
                <td><strong style="color: #ffd056;">$50.00 / day</strong></td>
                <td>$1,500.00</td>
                <td>$4,500.00</td>
                <td><strong style="color: #10b981;">$9,000.00 USDT</strong></td>
                <td><span style="color: #38bdf8; font-weight: 800;">18X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$1,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$100.00 / day</strong></td>
                <td>$3,000.00</td>
                <td>$9,000.00</td>
                <td><strong style="color: #10b981;">$18,000.00 USDT</strong></td>
                <td><span style="color: #38bdf8; font-weight: 800;">18X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$2,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$200.00 / day</strong></td>
                <td>$6,000.00</td>
                <td>$18,000.00</td>
                <td><strong style="color: #10b981;">$36,000.00 USDT</strong></td>
                <td><span style="color: #38bdf8; font-weight: 800;">18X Return</span></td>
            </tr>
            <tr style="background: rgba(16, 185, 129, 0.12);">
                <td><strong style="color: #10b981;">$5,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$500.00 / day</strong></td>
                <td>$15,000.00</td>
                <td>$45,000.00</td>
                <td><strong style="color: #10b981;">$90,000.00 USDT</strong></td>
                <td><span style="color: #ffd056; font-weight: 900;">18X Return</span></td>
            </tr>
        </tbody>
    </table>

    <div class="slide-footer">
        <span>Dubai Finance • FD Plan A: 10% Daily ROI Tier Breakdown</span>
        <span>Slide 13 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 14: FD PLAN B - 15% DAILY PACKAGES ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">FD 210-Day VIP Plan</div>
    </div>
    
    <div class="category-title">210 Days VIP Staking</div>
    <h2 class="main-title">FD Plan B: 15% Daily ROI Breakdown</h2>
    <p class="subtitle">Our most lucrative fixed contract offering explosive wealth multiplication for serious investors.</p>

    <table class="custom-table" style="margin-top: 10px;">
        <thead>
            <tr>
                <th>FD Tier Deposit</th>
                <th>Daily Return (15%)</th>
                <th>30 Days Profit</th>
                <th>90 Days Profit</th>
                <th>Total 210 Days Return</th>
                <th>Multiple</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong style="color: #ffffff;">$100 USDT</strong></td>
                <td><strong style="color: #ffd056;">$15.00 / day</strong></td>
                <td>$450.00</td>
                <td>$1,350.00</td>
                <td><strong style="color: #10b981;">$3,150.00 USDT</strong></td>
                <td><span style="color: #ffd056; font-weight: 800;">31.5X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$500 USDT</strong></td>
                <td><strong style="color: #ffd056;">$75.00 / day</strong></td>
                <td>$2,250.00</td>
                <td>$6,750.00</td>
                <td><strong style="color: #10b981;">$15,750.00 USDT</strong></td>
                <td><span style="color: #ffd056; font-weight: 800;">31.5X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$1,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$150.00 / day</strong></td>
                <td>$4,500.00</td>
                <td>$13,500.00</td>
                <td><strong style="color: #10b981;">$31,500.00 USDT</strong></td>
                <td><span style="color: #ffd056; font-weight: 800;">31.5X Return</span></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">$2,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$300.00 / day</strong></td>
                <td>$9,000.00</td>
                <td>$27,000.00</td>
                <td><strong style="color: #10b981;">$63,000.00 USDT</strong></td>
                <td><span style="color: #ffd056; font-weight: 800;">31.5X Return</span></td>
            </tr>
            <tr style="background: rgba(16, 185, 129, 0.15);">
                <td><strong style="color: #10b981;">$5,000 USDT</strong></td>
                <td><strong style="color: #ffd056;">$750.00 / day</strong></td>
                <td>$22,500.00</td>
                <td>$67,500.00</td>
                <td><strong style="color: #10b981;">$157,500.00 USDT</strong></td>
                <td><span style="color: #10b981; font-weight: 900;">31.5X Return</span></td>
            </tr>
        </tbody>
    </table>

    <div class="slide-footer">
        <span>Dubai Finance • FD Plan B: 15% Daily ROI VIP Tier Breakdown</span>
        <span>Slide 14 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 15: INCOME 3 - DIRECT REFERRAL (15%) ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Income Stream #3</div>
    </div>
    
    <div class="category-title">Instant Cash Compensation</div>
    <h2 class="main-title">Direct Referral Income: 15% Instant</h2>
    <p class="subtitle">Earn a generous 15% instant commission in USDT (BEP-20) on every personal partner activation without limits.</p>

    <div class="grid-2" style="align-items: center; margin-top: 10px;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card card-gold" style="padding: 40px;">
                <div style="font-size: 80px; font-weight: 900; color: #10b981; line-height: 1; margin-bottom: 12px;">15% INSTANT</div>
                <div style="font-size: 26px; color: #ffffff; font-weight: 800; margin-bottom: 16px;">Direct Wallet Credit Upon Deposit</div>
                <p style="font-size: 21px; color: #cbd5e1; line-height: 1.5;">
                    Share the opportunity with partners, friends, and investors. The moment they activate any package from $5 to $5,000, 15% of their package amount is instantly credited to your withdrawal wallet!
                </p>
            </div>

            <div class="card" style="padding: 32px;">
                <h4 style="font-size: 22px; font-weight: 800; color: #ffd056; margin-bottom: 16px; text-transform: uppercase;">Direct Earning Examples</h4>
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 20px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                        <span>Direct Refer $100 Package:</span> <strong style="color: #10b981;">+$15.00 USDT Instant</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                        <span>Direct Refer $500 Package:</span> <strong style="color: #10b981;">+$75.00 USDT Instant</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                        <span>Direct Refer $1,000 Package:</span> <strong style="color: #10b981;">+$150.00 USDT Instant</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Direct Refer $5,000 Package:</span> <strong style="color: #10b981;">+$750.00 USDT Instant</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-vip" style="padding: 44px; text-align: center;">
            <div style="font-size: 70px; margin-bottom: 16px;">🚀</div>
            <h3 style="font-size: 34px; font-weight: 900; color: #ffd056; margin-bottom: 16px;">Unlimited Direct Potential</h3>
            <p style="font-size: 22px; color: #cbd5e1; line-height: 1.5; margin-bottom: 30px;">
                There is NO cap on how many direct partners you can introduce. Refer 10 leaders with $1,000 packages and earn <strong>$1,500 USDT</strong> instantly!
            </p>
            <div style="background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; border-radius: 20px; padding: 24px;">
                <div style="font-size: 28px; font-weight: 900; color: #10b981;">100% WITHDRAWABLE IMMEDIATELY</div>
                <div style="font-size: 18px; color: #cbd5e1; margin-top: 6px;">Zero waiting period • Instant P2P or BEP-20 withdrawal</div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Income 3: 15% Instant Direct Referral Income</span>
        <span>Slide 15 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 16: INCOME 4 - DAILY 12-LEVEL TEAM ROYALTY ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Income Stream #4</div>
    </div>
    
    <div class="category-title">Generational Team Wealth</div>
    <h2 class="main-title">Daily 12-Level Team Royalty</h2>
    <p class="subtitle">Receive daily passive income derived from the daily ROI earnings of your entire 12-generation downline organization.</p>

    <div class="grid-2" style="align-items: center; margin-top: 10px;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card card-gold" style="padding: 40px;">
                <div style="font-size: 54px; font-weight: 900; color: #f43f5e; line-height: 1; margin-bottom: 12px;">DAILY PASSIVE CASH FLOW</div>
                <div style="font-size: 24px; color: #ffffff; font-weight: 800; margin-bottom: 16px;">Paid Every Single Day (Mon-Sun)</div>
                <p style="font-size: 21px; color: #cbd5e1; line-height: 1.5;">
                    Unlike one-time bonuses, the 12-Level Income pays you <strong>every day</strong> whenever your team members earn their daily ROI. As your team grows, your daily recurring income explodes!
                </p>
            </div>

            <div class="card" style="padding: 32px;">
                <h4 style="font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 16px; text-transform: uppercase;">Key Royalty Rules</h4>
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 20px;">
                    <div style="display: flex; gap: 14px;"><span>✅</span> <span>Royalty calculated daily on your downline's daily ROI yield</span></div>
                    <div style="display: flex; gap: 14px;"><span>✅</span> <span>1 Direct Referral unlocks each progressive level</span></div>
                    <div style="display: flex; gap: 14px;"><span>✅</span> <span>Total 12 Direct Referrals unlock all 12 Levels forever</span></div>
                    <div style="display: flex; gap: 14px;"><span>✅</span> <span>Zero flushing, zero lapse of downline volume</span></div>
                </div>
            </div>
        </div>

        <div class="card card-vip" style="padding: 44px;">
            <h3 style="font-size: 32px; font-weight: 900; color: #ffd056; margin-bottom: 24px; text-align: center;">Exponential Network Power</h3>
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 21px;">
                <div style="background: rgba(15, 23, 42, 0.8); padding: 18px 24px; border-radius: 14px; border-left: 4px solid #ffd056; display: flex; justify-content: space-between;">
                    <span>Level 1 (Direct Team):</span> <strong style="color: #ffd056;">10% Daily</strong>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 18px 24px; border-radius: 14px; border-left: 4px solid #38bdf8; display: flex; justify-content: space-between;">
                    <span>Level 2 (Secondary Team):</span> <strong style="color: #38bdf8;">5% Daily</strong>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 18px 24px; border-radius: 14px; border-left: 4px solid #10b981; display: flex; justify-content: space-between;">
                    <span>Level 3 (Tier 3 Team):</span> <strong style="color: #10b981;">3% Daily</strong>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 18px 24px; border-radius: 14px; border-left: 4px solid #a855f7; display: flex; justify-content: space-between;">
                    <span>Level 4 to Level 6:</span> <strong style="color: #a855f7;">2% Daily each</strong>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 18px 24px; border-radius: 14px; border-left: 4px solid #f43f5e; display: flex; justify-content: space-between;">
                    <span>Level 7 to Level 12:</span> <strong style="color: #f43f5e;">1% Daily each</strong>
                </div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Income 4: Daily 12-Level Team Royalty Overview</span>
        <span>Slide 16 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 17: 12-LEVEL PERCENTAGE & CONDITION TABLE ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Level Structure</div>
    </div>
    
    <div class="category-title">Full 12-Tier Distribution</div>
    <h2 class="main-title">12-Level Royalty Matrix & Unlock Conditions</h2>
    <p class="subtitle">Every direct referral unlocks another level of daily lifetime team royalty.</p>

    <table class="custom-table" style="margin-top: 10px;">
        <thead>
            <tr>
                <th>Level</th>
                <th>Daily Royalty (%)</th>
                <th>Direct Referral Condition</th>
                <th>Cumulative Directs</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong style="color: #ffd056;">Level 1</strong></td>
                <td><strong style="color: #ffd056;">10% Daily</strong></td>
                <td>1 Direct Referral Required</td>
                <td>1 Direct</td>
                <td><span style="color: #10b981; font-weight: 800;">ACTIVE</span></td>
            </tr>
            <tr>
                <td><strong style="color: #38bdf8;">Level 2</strong></td>
                <td><strong style="color: #38bdf8;">5% Daily</strong></td>
                <td>+1 Direct Referral Required</td>
                <td>2 Directs</td>
                <td><span style="color: #10b981; font-weight: 800;">ACTIVE</span></td>
            </tr>
            <tr>
                <td><strong style="color: #10b981;">Level 3</strong></td>
                <td><strong style="color: #10b981;">3% Daily</strong></td>
                <td>+1 Direct Referral Required</td>
                <td>3 Directs</td>
                <td><span style="color: #10b981; font-weight: 800;">ACTIVE</span></td>
            </tr>
            <tr>
                <td><strong style="color: #a855f7;">Level 4</strong></td>
                <td><strong style="color: #a855f7;">2% Daily</strong></td>
                <td>+1 Direct Referral Required</td>
                <td>4 Directs</td>
                <td><span style="color: #10b981; font-weight: 800;">ACTIVE</span></td>
            </tr>
            <tr>
                <td><strong style="color: #a855f7;">Level 5</strong></td>
                <td><strong style="color: #a855f7;">2% Daily</strong></td>
                <td>+1 Direct Referral Required</td>
                <td>5 Directs</td>
                <td><span style="color: #10b981; font-weight: 800;">ACTIVE</span></td>
            </tr>
            <tr>
                <td><strong style="color: #a855f7;">Level 6</strong></td>
                <td><strong style="color: #a855f7;">2% Daily</strong></td>
                <td>+1 Direct Referral Required</td>
                <td>6 Directs</td>
                <td><span style="color: #10b981; font-weight: 800;">ACTIVE</span></td>
            </tr>
            <tr>
                <td><strong style="color: #f43f5e;">Level 7 to Level 12</strong></td>
                <td><strong style="color: #f43f5e;">1% Daily (Each Level)</strong></td>
                <td>+1 Direct Referral per Level</td>
                <td>12 Directs Total</td>
                <td><span style="color: #ffd056; font-weight: 900;">ALL LEVELS UNLOCKED</span></td>
            </tr>
        </tbody>
    </table>

    <div class="slide-footer">
        <span>Dubai Finance • Complete 12-Level Percentage & Directs Criteria</span>
        <span>Slide 17 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 18: INCOME 5 - MEGA MILESTONE REWARDS ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Income Stream #5</div>
    </div>
    
    <div class="category-title">Leadership Recognition</div>
    <h2 class="main-title">Mega Milestone & Rank Rewards</h2>
    <p class="subtitle">Accelerate your status with Dubai Finance. Hit team turnover milestones and win prestigious luxury assets or instant USDT cash!</p>

    <div class="grid-2" style="align-items: center; margin-top: 10px;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card card-gold" style="padding: 40px;">
                <div style="font-size: 54px; font-weight: 900; color: #ffd056; line-height: 1; margin-bottom: 12px;">LUXURY VIP LIFESTYLE</div>
                <div style="font-size: 24px; color: #ffffff; font-weight: 800; margin-bottom: 16px;">Guaranteed Physical Gifts or Cash Equivalent</div>
                <p style="font-size: 21px; color: #cbd5e1; line-height: 1.5;">
                    As your network expands and business volume compounds, Dubai Finance honors your dedication with elite rewards: from Smart Gadgets and Dubai VIP trips to Gold Rolex Watches and Luxury Sports Cars!
                </p>
            </div>

            <div class="card" style="padding: 32px;">
                <h4 style="font-size: 22px; font-weight: 800; color: #10b981; margin-bottom: 16px; text-transform: uppercase;">Leadership Advantages</h4>
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 20px;">
                    <div style="display: flex; gap: 14px;"><span>🏆</span> <span>Cumulative team business counts towards rank achievement</span></div>
                    <div style="display: flex; gap: 14px;"><span>💵</span> <span>Choose between physical reward or 100% instant USDT payout</span></div>
                    <div style="display: flex; gap: 14px;"><span>✈️</span> <span>VIP invitations to Dubai Annual Leadership Summits</span></div>
                </div>
            </div>
        </div>

        <div style="border-radius: 28px; overflow: hidden; border: 2px solid rgba(255, 208, 86, 0.4); height: 500px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            <img src="{rewards_b64}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Income 5: Mega Milestone Rewards Overview</span>
        <span>Slide 18 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 19: REWARDS MATRIX TABLE ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Reward Matrix</div>
    </div>
    
    <div class="category-title">Turnover Milestones</div>
    <h2 class="main-title">Milestone Rewards Structure</h2>
    <p class="subtitle">Progress through prestigious leadership ranks and unlock life-changing rewards.</p>

    <table class="custom-table" style="margin-top: 10px;">
        <thead>
            <tr>
                <th>Rank Title</th>
                <th>Team Business (USDT)</th>
                <th>Guaranteed Reward</th>
                <th>Cash Equivalent (USDT)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong style="color: #ffffff;">⭐ Star Leader</strong></td>
                <td>$1,000 USDT</td>
                <td>Premium Smart Watch</td>
                <td><strong style="color: #ffd056;">$50 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #38bdf8;">🥈 Silver Leader</strong></td>
                <td>$2,500 USDT</td>
                <td>5G Android Smartphone</td>
                <td><strong style="color: #ffd056;">$125 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #ffd056;">🥇 Gold Leader</strong></td>
                <td>$5,000 USDT</td>
                <td>Apple iPad / Business Laptop</td>
                <td><strong style="color: #ffd056;">$250 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #f43f5e;">💎 Ruby Director</strong></td>
                <td>$10,000 USDT</td>
                <td>All-Expense Paid Dubai VIP Trip (3N/4D)</td>
                <td><strong style="color: #ffd056;">$600 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #10b981;">👑 Emerald Director</strong></td>
                <td>$25,000 USDT</td>
                <td>Luxury Gold Watch / iPhone Pro Max</td>
                <td><strong style="color: #ffd056;">$1,500 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #38bdf8;">💠 Diamond Ambassador</strong></td>
                <td>$50,000 USDT</td>
                <td>International Luxury Holiday (Europe/Bali)</td>
                <td><strong style="color: #ffd056;">$3,500 USDT</strong></td>
            </tr>
            <tr>
                <td><strong style="color: #a855f7;">🏆 Blue Diamond</strong></td>
                <td>$100,000 USDT</td>
                <td>Sedan Car Fund / Royal Gold Bullion</td>
                <td><strong style="color: #ffd056;">$8,000 USDT</strong></td>
            </tr>
            <tr style="background: rgba(245, 158, 11, 0.15);">
                <td><strong style="color: #ffd056;">👑 Crown King President</strong></td>
                <td>$250,000 USDT</td>
                <td>Luxury Sports Car (BMW/Mercedes/Porsche)</td>
                <td><strong style="color: #10b981; font-size: 26px;">$25,000 USDT</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="slide-footer">
        <span>Dubai Finance • Complete Milestone Rewards Schedule</span>
        <span>Slide 19 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 20: BLOCKCHAIN DEPOSIT & P2P SYSTEM ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Ecosystem Infrastructure</div>
    </div>
    
    <div class="category-title">Decentralized Power</div>
    <h2 class="main-title">USDT BEP-20 Network & P2P Ecosystem</h2>
    <p class="subtitle">Experience frictionless global transactions powered by the ultra-fast, low-gas Binance Smart Chain.</p>

    <div class="grid-2" style="align-items: center; margin-top: 10px;">
        <div style="border-radius: 28px; overflow: hidden; border: 2px solid rgba(56, 189, 248, 0.4); height: 500px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            <img src="{blockchain_b64}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card card-gold" style="padding: 36px;">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px;">
                    <div style="font-size: 40px;">⚡</div>
                    <div>
                        <h3 style="font-size: 28px; font-weight: 800; color: #ffd056;">Instant Automated Deposits</h3>
                        <p style="font-size: 19px; color: #94a3b8;">Deposit USDT (BEP-20) seamlessly from Trust Wallet, MetaMask, Binance, or OKX.</p>
                    </div>
                </div>
            </div>

            <div class="card card-gold" style="padding: 36px;">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px;">
                    <div style="font-size: 40px;">🔄</div>
                    <div>
                        <h3 style="font-size: 28px; font-weight: 800; color: #38bdf8;">Zero-Fee P2P Wallet Transfer</h3>
                        <p style="font-size: 19px; color: #94a3b8;">Transfer internal balance instantly to other members without any fee to activate new downline IDs.</p>
                    </div>
                </div>
            </div>

            <div class="card card-gold" style="padding: 36px;">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px;">
                    <div style="font-size: 40px;">🔒</div>
                    <div>
                        <h3 style="font-size: 28px; font-weight: 800; color: #10b981;">Maximum Security & Automation</h3>
                        <p style="font-size: 19px; color: #94a3b8;">All transactions protected by decentralized cryptographic verification with 99.99% uptime.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Blockchain Infrastructure & P2P Transfers</span>
        <span>Slide 20 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 21: TERMS & CONDITIONS ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Transparency Protocol</div>
    </div>
    
    <div class="category-title">Fair & Transparent Guidelines</div>
    <h2 class="main-title">Terms & Conditions</h2>
    <p class="subtitle">Clear, member-first rules ensuring seamless daily operation and guaranteed payout protection.</p>

    <div class="grid-2" style="margin-top: 10px;">
        <div class="card card-gold" style="padding: 36px; display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-size: 44px; width: 70px; height: 70px; border-radius: 18px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #38bdf8;">💳</div>
            <div>
                <h3 style="font-size: 28px; font-weight: 800; color: #38bdf8; margin-bottom: 8px;">Withdrawal Limits</h3>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">
                    <strong>Minimum Withdrawal:</strong> <span style="color: #ffd056;">$2 USDT</span><br>
                    <strong>Maximum Withdrawal:</strong> <span style="color: #ffd056;">$5,000 USDT</span> per transaction.
                </p>
            </div>
        </div>

        <div class="card card-gold" style="padding: 36px; display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-size: 44px; width: 70px; height: 70px; border-radius: 18px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #ffd056;">⏰</div>
            <div>
                <h3 style="font-size: 28px; font-weight: 800; color: #ffd056; margin-bottom: 8px;">Daily Withdrawal Timing</h3>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">
                    Withdrawal requests are accepted daily from <strong>10:00 AM To 02:00 PM</strong> for rapid, automated batch blockchain processing.
                </p>
            </div>
        </div>

        <div class="card card-gold" style="padding: 36px; display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-size: 44px; width: 70px; height: 70px; border-radius: 18px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #10b981;">🛡️</div>
            <div>
                <h3 style="font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 8px;">Zero Deductions (100% Payout)</h3>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">
                    <strong>0% Admin Charge • 0% TDS • 0% Hidden Fee</strong>. You receive exactly 100% of your earnings straight to your wallet.
                </p>
            </div>
        </div>

        <div class="card card-gold" style="padding: 36px; display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-size: 44px; width: 70px; height: 70px; border-radius: 18px; background: rgba(244, 63, 94, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #f43f5e;">🔓</div>
            <div>
                <h3 style="font-size: 28px; font-weight: 800; color: #f43f5e; margin-bottom: 8px;">No Withdrawal Conditions</h3>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">
                    No mandatory direct referrals required to withdraw your daily ROI income. Complete financial freedom for all investors!
                </p>
            </div>
        </div>

        <div class="card card-gold" style="padding: 36px; display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-size: 44px; width: 70px; height: 70px; border-radius: 18px; background: rgba(168, 85, 247, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #a855f7;">⏳</div>
            <div>
                <h3 style="font-size: 28px; font-weight: 800; color: #a855f7; margin-bottom: 8px;">Tenure Duration: 30 Days</h3>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">
                    Basic ROI plans mature after <strong>30 Days (150% gross payout)</strong>. Members can re-topup and compound continuously.
                </p>
            </div>
        </div>

        <div class="card card-gold" style="padding: 36px; display: flex; gap: 24px; align-items: flex-start;">
            <div style="font-size: 44px; width: 70px; height: 70px; border-radius: 18px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #38bdf8;">🌐</div>
            <div>
                <h3 style="font-size: 28px; font-weight: 800; color: #38bdf8; margin-bottom: 8px;">Standard Blockchain BEP-20</h3>
                <p style="font-size: 20px; color: #cbd5e1; line-height: 1.4;">
                    Operates strictly on the <strong>USDT (Binance Smart Chain BEP-20)</strong> standard for lightning speed and minimal network gas fees.
                </p>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Official Transparency Terms & Protocols</span>
        <span>Slide 21 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 22: OFFICIAL CORPORATE CONTACT ==================== -->
<div class="slide">
    <div class="slide-header">
        <div class="logo-container">
            <div class="logo-badge"><span style="font-size: 26px;">⚜️</span></div>
            <span class="logo-text">DUBAI FINANCE</span>
        </div>
        <div class="header-badge">Global Headquarters</div>
    </div>
    
    <div class="category-title">World-Class Presence</div>
    <h2 class="main-title">Dubai Corporate Headquarters</h2>
    <p class="subtitle">Located at the epicenter of international finance and blockchain innovation on Sheikh Zayed Road, Dubai.</p>

    <div class="grid-2" style="align-items: center; margin-top: 10px;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="card card-gold" style="padding: 36px;">
                <div style="font-size: 18px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Managing Leadership</div>
                <div style="font-size: 38px; font-weight: 900; color: #ffd056; font-family: 'Space Grotesk', sans-serif; margin-top: 6px;">CMD Sheikh Tariq Al Mansoori</div>
            </div>

            <div class="card" style="padding: 36px;">
                <div style="font-size: 18px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Physical Headquarters</div>
                <div style="font-size: 26px; font-weight: 800; color: #ffffff; margin-top: 6px; line-height: 1.4;">
                    Office 3802, Latifa Tower, Sheikh Zayed Road, Financial District, Dubai, United Arab Emirates
                </div>
            </div>

            <div class="card" style="padding: 36px;">
                <div style="font-size: 18px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Official Communications</div>
                <div style="font-size: 24px; font-weight: 800; color: #38bdf8; margin-top: 6px;">
                    📧 support@dubaifinance.online
                </div>
                <div style="font-size: 24px; font-weight: 800; color: #10b981; margin-top: 8px;">
                    🌐 Dubaifinance.online
                </div>
            </div>
        </div>

        <div style="border-radius: 28px; overflow: hidden; border: 2px solid rgba(255, 208, 86, 0.4); height: 500px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            <img src="{office_b64}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance • Global Corporate Headquarters</span>
        <span>Slide 22 / 23</span>
    </div>
</div>

<!-- ==================== SLIDE 23: CLOSING & CALL TO ACTION ==================== -->
<div class="slide" style="justify-content: center; align-items: center; text-align: center; background: linear-gradient(rgba(3, 7, 18, 0.8), rgba(3, 7, 18, 0.92)), url('{hero_b64}') center/cover no-repeat; padding: 80px;">
    <div style="background: rgba(255, 208, 86, 0.15); border: 2px solid #ffd056; padding: 12px 36px; border-radius: 999px; margin-bottom: 28px; display: inline-flex; align-items: center; gap: 14px;">
        <span style="font-size: 28px;">⚜️</span>
        <span style="color: #ffd056; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">A New Beginning • Financial Sovereignty</span>
    </div>

    <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 96px; font-weight: 900; color: #ffffff; line-height: 1.1; margin-bottom: 24px;">
        Thank You & Welcome to <br><span style="color: #ffd056;">Dubai Finance</span>
    </h1>

    <p style="font-size: 32px; color: #cbd5e1; max-width: 1100px; line-height: 1.4; margin-bottom: 48px;">
        Join thousands of smart global investors achieving consistent, automated daily returns. Start your journey today with just <span style="color: #10b981; font-weight: 900;">$5 USDT</span>!
    </p>

    <div style="display: flex; gap: 30px; margin-bottom: 60px;">
        <div class="btn-gold" style="font-size: 28px; padding: 22px 60px;">REGISTER ON DUBAIFINANCE.ONLINE</div>
    </div>

    <div style="display: flex; gap: 60px; font-size: 24px; color: #94a3b8; font-weight: 700;">
        <div>🏢 CMD Sheikh Tariq Al Mansoori</div>
        <div>📍 Latifa Tower, Sheikh Zayed Road, Dubai, UAE</div>
        <div>✉️ support@dubaifinance.online</div>
    </div>
</div>

</body>
</html>
"""

html_path = os.path.join(workspace, "dubai_finance_presentation_usdt.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Wrote {html_path} successfully.")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
pdf_path = os.path.join(workspace, "Dubai_Finance_Presentation.pdf")

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Running Chrome headless to generate 23-slide USDT PDF...")
res = subprocess.run(cmd, capture_output=True, text=True)
print(f"Chrome return code: {res.returncode}")

if os.path.exists(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"Successfully generated {pdf_path} with {len(doc)} pages!")
    
    # Render all pages to new_rendered_pages
    render_dir = os.path.join(workspace, "new_rendered_pages")
    os.makedirs(render_dir, exist_ok=True)
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        pix.save(os.path.join(render_dir, f"page_{i+1}.png"))
    print(f"Rendered all {len(doc)} pages to {render_dir}/")
