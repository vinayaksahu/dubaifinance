import os
import subprocess
import pymupdf
import base64

html_file = 'dubai_finance_presentation.html'
pdf_file = 'Dubai_Finance_Presentation.pdf'

def get_base64_image(image_path):
    if os.path.exists(image_path):
        with open(image_path, 'rb') as f:
            encoded = base64.b64encode(f.read()).decode('utf-8')
            ext = 'jpeg' if image_path.endswith('.jpg') or image_path.endswith('.jpeg') else 'png'
            return f'data:image/{ext};base64,{encoded}'
    return ''

hero_img = get_base64_image('assets/hero_skyline.jpg')
office_img = get_base64_image('assets/office_building.jpg')
crypto_img = get_base64_image('assets/crypto_trading.jpg')

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>DUBAI FINANCE</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@page {{
    size: 1920px 1080px;
    margin: 0;
}}

* {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}}

body {{
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;
    background-color: #030712;
    color: #f8fafc;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}}

.slide {{
    width: 1920px;
    height: 1080px;
    position: relative;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
    background: radial-gradient(circle at 80% 15%, #18153f 0%, #0a0e1a 50%, #030610 100%);
    display: flex;
    flex-direction: column;
}}

/* Ambient Golden Glows */
.bg-glow-gold {{
    position: absolute;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 192, 66, 0.1) 0%, rgba(245, 192, 66, 0) 70%);
    top: -250px;
    right: -150px;
    pointer-events: none;
    z-index: 1;
}}

.bg-glow-blue {{
    position: absolute;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(56, 189, 248, 0) 70%);
    bottom: -200px;
    left: -150px;
    pointer-events: none;
    z-index: 1;
}}

.top-bar {{
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 35px 70px 15px 70px;
}}

.brand-badge {{
    display: flex;
    align-items: center;
    gap: 16px;
}}

.brand-logo-icon {{
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fce082, #e5a93b, #b8821f);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 0 25px rgba(245, 192, 66, 0.4);
}}

.brand-name {{
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: 2px;
    color: #ffd056;
    text-transform: uppercase;
}}

.top-tag {{
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(245, 192, 66, 0.1);
    border: 1px solid rgba(245, 192, 66, 0.35);
    padding: 10px 24px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 700;
    color: #fce082;
    letter-spacing: 0.5px;
}}

.content-container {{
    position: relative;
    z-index: 10;
    padding: 15px 70px 35px 70px;
    flex: 1;
    display: flex;
    flex-direction: column;
}}

/* Text Colors (clean solid vectors without chrome print clipping bugs) */
.gold-text {{
    color: #ffd056;
}}

.gold-light {{
    color: #fef08a;
}}

.emerald-text {{
    color: #10b981;
}}

.cyan-text {{
    color: #38bdf8;
}}

.section-header {{
    margin-bottom: 25px;
}}

.section-tag {{
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #ffd056;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
}}

.section-title {{
    font-family: 'Outfit', sans-serif;
    font-size: 46px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.5px;
    color: #ffffff;
}}

.section-subtitle {{
    font-size: 20px;
    color: #94a3b8;
    margin-top: 6px;
}}

/* Glass Cards */
.glass-card {{
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(245, 192, 66, 0.22);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.55);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
}}

.glass-card-gold {{
    background: linear-gradient(145deg, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.9));
    border: 1px solid rgba(245, 192, 66, 0.45);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 192, 66, 0.1);
}}

/* Footer on slides */
.slide-footer {{
    position: absolute;
    bottom: 25px;
    left: 70px;
    right: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 15px;
    color: #64748b;
    z-index: 10;
}}

.footer-highlight {{
    color: #ffd056;
    font-weight: 700;
}}

/* ================== SLIDE 1 ================== */
.slide-hero {{
    background: #030712;
    position: relative;
}}

.hero-bg-img {{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.38;
    z-index: 1;
    filter: brightness(0.9) contrast(1.1);
}}

.hero-overlay {{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 35% 50%, rgba(3, 7, 18, 0.35) 0%, rgba(3, 7, 18, 0.94) 80%);
    z-index: 2;
}}

.hero-content {{
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
    padding: 0 100px;
}}

.hero-pill {{
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(245, 192, 66, 0.15);
    border: 1px solid rgba(245, 192, 66, 0.5);
    padding: 12px 30px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 800;
    color: #ffd056;
    letter-spacing: 4px;
    text-transform: uppercase;
    box-shadow: 0 0 30px rgba(245, 192, 66, 0.25);
    margin-bottom: 25px;
}}

.hero-title {{
    font-family: 'Outfit', sans-serif;
    font-size: 96px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -1px;
    margin-bottom: 20px;
    text-transform: uppercase;
    color: #ffd056;
}}

.hero-tagline {{
    font-size: 30px;
    font-weight: 500;
    color: #cbd5e1;
    margin-bottom: 45px;
    max-width: 900px;
    letter-spacing: 0.5px;
}}

.hero-highlights-row {{
    display: flex;
    gap: 25px;
    margin-bottom: 50px;
}}

.highlight-box {{
    background: rgba(15, 23, 42, 0.88);
    border: 1px solid rgba(245, 192, 66, 0.4);
    padding: 24px 34px;
    border-radius: 18px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    gap: 8px;
}}

.highlight-box .num {{
    font-family: 'Outfit', sans-serif;
    font-size: 38px;
    font-weight: 900;
    color: #ffd056;
}}

.highlight-box .desc {{
    font-size: 15px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}}

.hero-bottom-bar {{
    display: flex;
    align-items: center;
    gap: 40px;
    font-size: 20px;
    color: #e2e8f0;
}}

.hero-urgent-badge {{
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: #ffffff;
    font-weight: 800;
    padding: 12px 28px;
    border-radius: 12px;
    font-size: 18px;
    letter-spacing: 2px;
    box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
}}

/* ================== SLIDE 2 (ABOUT US) ================== */
.about-grid {{
    display: grid;
    grid-template-columns: 1.18fr 0.82fr;
    gap: 40px;
    flex: 1;
    align-items: center;
}}

.about-cards-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}}

.about-mini-card {{
    padding: 28px;
}}

.about-mini-card .icon-wrap {{
    width: 54px;
    height: 54px;
    border-radius: 14px;
    background: rgba(245, 192, 66, 0.12);
    border: 1px solid rgba(245, 192, 66, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 16px;
}}

.about-mini-card h4 {{
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 10px;
}}

.about-mini-card p {{
    font-size: 16px;
    line-height: 1.6;
    color: #94a3b8;
}}

.leadership-panel {{
    padding: 36px;
    display: flex;
    flex-direction: column;
    gap: 25px;
}}

.leader-badge {{
    display: flex;
    align-items: center;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(245, 192, 66, 0.25);
}}

.leader-avatar {{
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd056, #b47a12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    box-shadow: 0 0 25px rgba(245, 192, 66, 0.4);
}}

.leader-meta h3 {{
    font-size: 28px;
    font-weight: 900;
    color: #ffffff;
}}

.leader-meta span {{
    font-size: 15px;
    color: #ffd056;
    font-weight: 700;
    letter-spacing: 1.5px;
}}

.office-info-item {{
    display: flex;
    gap: 18px;
    align-items: flex-start;
}}

.office-info-item .icon {{
    font-size: 24px;
    margin-top: 2px;
}}

.office-info-item .text h5 {{
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #94a3b8;
    margin-bottom: 4px;
    font-weight: 700;
}}

.office-info-item .text p {{
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;
}}

/* ================== SLIDE 3 (TYPES OF INCOME) ================== */
.income-types-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    margin-top: 10px;
}}

.income-card {{
    padding: 35px 30px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}}

.income-num-badge {{
    width: 50px;
    height: 50px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fce082, #e5a93b);
    color: #030712;
    font-size: 22px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(245, 192, 66, 0.35);
}}

.income-card h3 {{
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
}}

.income-card .val {{
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 4px;
}}

.income-card p {{
    font-size: 16px;
    color: #94a3b8;
    line-height: 1.55;
}}

/* ================== SLIDE 4 & 6 (PACKAGES) ================== */
.pkg-split-grid {{
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 40px;
    flex: 1;
    align-items: center;
}}

.pkg-main-card {{
    padding: 42px;
    display: flex;
    flex-direction: column;
    gap: 26px;
}}

.pkg-amount-banner {{
    background: linear-gradient(135deg, rgba(245, 192, 66, 0.16), rgba(245, 192, 66, 0.05));
    border: 2px solid rgba(245, 192, 66, 0.5);
    padding: 28px;
    border-radius: 20px;
    text-align: center;
}}

.pkg-amount-banner .label {{
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 3px;
    color: #94a3b8;
    text-transform: uppercase;
    margin-bottom: 8px;
}}

.pkg-amount-banner .val {{
    font-family: 'Outfit', sans-serif;
    font-size: 54px;
    font-weight: 900;
    color: #ffd056;
}}

.pkg-specs-row {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}}

.pkg-spec-box {{
    background: rgba(30, 41, 59, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 22px;
    border-radius: 14px;
}}

.pkg-spec-box .label {{
    font-size: 14px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    margin-bottom: 6px;
}}

.pkg-spec-box .val {{
    font-size: 26px;
    font-weight: 800;
    color: #f8fafc;
}}

.pkg-note-card {{
    background: linear-gradient(135deg, rgba(245, 192, 66, 0.15), rgba(16, 185, 129, 0.1));
    border: 1px solid rgba(245, 192, 66, 0.4);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
}}

.pkg-note-card .icon {{
    font-size: 38px;
    color: #ffd056;
}}

.pkg-note-card .text h4 {{
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 4px;
}}

.pkg-note-card .text p {{
    font-size: 17px;
    color: #cbd5e1;
    line-height: 1.45;
}}

.crypto-graphic-panel {{
    border-radius: 20px;
    overflow: hidden;
    height: 100%;
    max-height: 580px;
    border: 1px solid rgba(245, 192, 66, 0.35);
    position: relative;
    box-shadow: 0 20px 40px rgba(0,0,0,0.65);
}}

.crypto-graphic-panel img {{
    width: 100%;
    height: 100%;
    object-fit: cover;
}}

/* ================== SLIDE 5 (DAILY ROI TABLE) ================== */
.table-container {{
    flex: 1;
    margin-top: 10px;
}}

.luxe-table {{
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
}}

.luxe-table th {{
    background: linear-gradient(90deg, #1e293b, #0f172a);
    color: #ffd056;
    font-family: 'Outfit', sans-serif;
    font-size: 19px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 16px 24px;
    text-align: center;
    border-top: 1px solid rgba(245, 192, 66, 0.35);
    border-bottom: 1px solid rgba(245, 192, 66, 0.35);
}}

.luxe-table th:first-child {{
    border-radius: 12px 0 0 12px;
    border-left: 1px solid rgba(245, 192, 66, 0.35);
    text-align: left;
}}

.luxe-table th:last-child {{
    border-radius: 0 12px 12px 0;
    border-right: 1px solid rgba(245, 192, 66, 0.35);
}}

.luxe-table td {{
    background: rgba(15, 23, 42, 0.8);
    padding: 14px 24px;
    text-align: center;
    font-size: 19px;
    font-weight: 600;
    color: #e2e8f0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}}

.luxe-table td:first-child {{
    border-radius: 12px 0 0 12px;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    text-align: left;
    font-weight: 800;
    color: #ffffff;
}}

.luxe-table td:last-child {{
    border-radius: 0 12px 12px 0;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    font-weight: 900;
    color: #ffd056;
}}

/* ================== SLIDE 7 (FD CARDS) ================== */
.fd-cards-row {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    flex: 1;
    align-items: stretch;
    margin-top: 15px;
}}

.fd-tier-card {{
    padding: 26px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    border: 1px solid rgba(245, 192, 66, 0.3);
}}

.fd-tier-card.featured {{
    border: 2px solid #ffd056;
    background: linear-gradient(180deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
    box-shadow: 0 15px 40px rgba(245, 192, 66, 0.25);
}}

.fd-tier-header {{
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}}

.fd-tier-header .badge {{
    display: inline-block;
    background: rgba(245, 192, 66, 0.15);
    color: #ffd056;
    font-size: 13px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 20px;
    letter-spacing: 1px;
    margin-bottom: 10px;
}}

.fd-tier-header .price {{
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    font-weight: 900;
    color: #ffd056;
}}

.fd-plan-box {{
    background: rgba(10, 15, 28, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px;
    margin: 12px 0;
    text-align: left;
}}

.fd-plan-box.plan-180 {{
    border-left: 4px solid #38bdf8;
}}

.fd-plan-box.plan-210 {{
    border-left: 4px solid #10b981;
}}

.fd-plan-box .plan-tag {{
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
}}

.fd-plan-box.plan-180 .plan-tag {{ color: #38bdf8; }}
.fd-plan-box.plan-210 .plan-tag {{ color: #10b981; }}

.fd-plan-box .daily-row {{
    font-size: 15px;
    color: #cbd5e1;
    margin-bottom: 4px;
}}

.fd-plan-box .daily-row strong {{
    color: #ffffff;
    font-size: 17px;
}}

.fd-plan-box .profit-row {{
    font-size: 14px;
    color: #94a3b8;
}}

.fd-plan-box .profit-row strong {{
    color: #ffd056;
    font-size: 18px;
    font-weight: 900;
}}

.fd-btn {{
    background: linear-gradient(135deg, #10b981, #059669);
    color: #ffffff;
    font-size: 15px;
    font-weight: 800;
    padding: 12px 0;
    border-radius: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
    margin-top: 10px;
}}

/* ================== SLIDE 8 (DIRECT REFERRAL) ================== */
.referral-container {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 45px;
    flex: 1;
    align-items: center;
}}

.referral-giant-badge {{
    padding: 45px 35px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
}}

.referral-giant-badge .rate {{
    font-family: 'Outfit', sans-serif;
    font-size: 125px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -2px;
    color: #ffd056;
}}

.referral-giant-badge .tag {{
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #ffffff;
}}

.referral-details-box {{
    display: flex;
    flex-direction: column;
    gap: 20px;
}}

.ref-feature-row {{
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px 26px;
    border-radius: 16px;
}}

.ref-feature-row .icon-check {{
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid #10b981;
    color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
    flex-shrink: 0;
}}

.ref-feature-row h4 {{
    font-size: 21px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 4px;
}}

.ref-feature-row p {{
    font-size: 16px;
    color: #94a3b8;
}}

/* ================== SLIDE 9 (12-LEVEL INCOME) ================== */
.level-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-top: 10px;
}}

.level-table-col {{
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(245, 192, 66, 0.3);
    border-radius: 16px;
    overflow: hidden;
}}

.level-table-head {{
    background: linear-gradient(90deg, #1e293b, #0f172a);
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 16px 24px;
    font-size: 18px;
    font-weight: 900;
    color: #ffd056;
    letter-spacing: 1.5px;
    border-bottom: 1px solid rgba(245, 192, 66, 0.35);
}}

.level-row {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 13px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 18px;
    font-weight: 600;
}}

.level-row.lvl-1 {{
    background: rgba(245, 192, 66, 0.12);
    font-weight: 900;
}}

.level-row.lvl-1 .rate {{
    color: #ffd056;
    font-size: 22px;
}}

.level-note-card {{
    margin-top: 25px;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(245, 192, 66, 0.35);
    border-radius: 14px;
    padding: 20px 30px;
    display: flex;
    align-items: center;
    gap: 25px;
}}

.level-note-card .badge {{
    background: #ffd056;
    color: #030712;
    font-weight: 900;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 15px;
    letter-spacing: 1px;
    flex-shrink: 0;
}}

.level-note-card p {{
    font-size: 17px;
    color: #e2e8f0;
    line-height: 1.5;
}}

/* ================== SLIDE 10 (TERMS) ================== */
.terms-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 15px;
}}

.term-card {{
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(245, 192, 66, 0.25);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 18px;
}}

.term-icon {{
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(245, 192, 66, 0.12);
    border: 1px solid rgba(245, 192, 66, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffd056;
    font-size: 22px;
    flex-shrink: 0;
}}

.term-text h4 {{
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 4px;
}}

.term-text p {{
    font-size: 15px;
    color: #94a3b8;
    line-height: 1.45;
}}

/* ================== SLIDE 11 (THANK YOU / OFFICE) ================== */
.closing-split {{
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 50px;
    flex: 1;
    align-items: center;
}}

.office-card-hero {{
    border-radius: 20px;
    overflow: hidden;
    height: 530px;
    border: 1px solid rgba(245, 192, 66, 0.45);
    position: relative;
    box-shadow: 0 20px 50px rgba(0,0,0,0.7);
}}

.office-card-hero img {{
    width: 100%;
    height: 100%;
    object-fit: cover;
}}

.office-badge-overlay {{
    position: absolute;
    bottom: 25px;
    left: 25px;
    right: 25px;
    background: rgba(3, 7, 18, 0.88);
    border: 1px solid rgba(245, 192, 66, 0.45);
    padding: 20px 25px;
    border-radius: 14px;
}}

.closing-details-panel {{
    display: flex;
    flex-direction: column;
    gap: 28px;
}}

.closing-details-panel .big-thank {{
    font-family: 'Outfit', sans-serif;
    font-size: 64px;
    font-weight: 900;
    line-height: 1.1;
    color: #ffd056;
}}

.contact-cards-list {{
    display: flex;
    flex-direction: column;
    gap: 16px;
}}

.contact-card {{
    background: rgba(15, 23, 42, 0.82);
    border: 1px solid rgba(245, 192, 66, 0.3);
    border-radius: 14px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    gap: 18px;
}}

.contact-card .c-icon {{
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(245, 192, 66, 0.12);
    border: 1px solid rgba(245, 192, 66, 0.35);
    color: #ffd056;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}}

.contact-card .c-info h5 {{
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #94a3b8;
    margin-bottom: 4px;
    font-weight: 700;
}}

.contact-card .c-info p {{
    font-size: 19px;
    font-weight: 800;
    color: #f1f5f9;
}}
</style>
</head>
<body>

<!-- ==================== SLIDE 1: COVER ==================== -->
<section class="slide slide-hero">
    <img src="{hero_img}" class="hero-bg-img" alt="Dubai Finance">
    <div class="hero-overlay"></div>
    <div class="bg-glow-gold"></div>

    <div class="hero-content">
        <div class="hero-pill">
            <span>⚜️ Official Business Plan ⚜️</span>
        </div>

        <h1 class="hero-title">
            DUBAI FINANCE
        </h1>

        <p class="hero-tagline">
            Trusted Financial Solutions, Tailored For You &bull; High Yield Daily Returns
        </p>

        <div class="hero-highlights-row">
            <div class="highlight-box">
                <span class="num">5% &bull; 10% &bull; 15%</span>
                <span class="desc">Daily ROI Packages</span>
            </div>
            <div class="highlight-box">
                <span class="num">USDT BEP-20</span>
                <span class="desc">Fixed Rate: 1$ = 110₹</span>
            </div>
            <div class="highlight-box">
                <span class="num">10% INSTANT</span>
                <span class="desc">Direct Referral Reward</span>
            </div>
            <div class="highlight-box">
                <span class="num">12 LEVELS</span>
                <span class="desc">Daily Team Royalty</span>
            </div>
        </div>

        <div class="hero-bottom-bar">
            <div class="hero-urgent-badge">DON'T MISS THIS OPPORTUNITY</div>
            <div>🌐 <strong>Dubaifinance.online</strong></div>
            <div>📍 <strong>Headquarters: Sheikh Zayed Road, Dubai</strong></div>
        </div>
    </div>
</section>

<!-- ==================== SLIDE 2: ABOUT US ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Established Dec 15, 2023</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header">
            <div class="section-tag">COMPANY PROFILE &amp; LEADERSHIP</div>
            <h2 class="section-title"><span class="gold-text">About Dubai Finance</span></h2>
            <p class="section-subtitle">25+ Years of Business Legacy &amp; 7+ Years of Crypto Market Mastery</p>
        </div>

        <div class="about-grid">
            <div class="about-cards-grid">
                <div class="glass-card about-mini-card">
                    <div class="icon-wrap">🏢</div>
                    <h4>25+ Years Industry Experience</h4>
                    <p>Proven multi-decade track record in Real Estate, Hospitality &amp; Hotel Industry, Wholesale Trading, and Global Tour &amp; Travels.</p>
                </div>

                <div class="glass-card about-mini-card">
                    <div class="icon-wrap">📈</div>
                    <h4>7+ Years Crypto Mastery</h4>
                    <p>Elite proprietary trading strategies across Crypto Futures, Options, Forex Trading, and High-Frequency Arbitrage.</p>
                </div>

                <div class="glass-card about-mini-card">
                    <div class="icon-wrap">💰</div>
                    <h4>100+ Crore $ Generated</h4>
                    <p>Substantial institutional success generating over 100 Crore $ from cryptocurrency markets through disciplined risk management.</p>
                </div>

                <div class="glass-card about-mini-card">
                    <div class="icon-wrap">🌍</div>
                    <h4>Global Community Vision</h4>
                    <p>Dedicated to helping individuals without trading expertise or time. We trade on your behalf to generate sustainable daily returns worldwide.</p>
                </div>
            </div>

            <div class="glass-card leadership-panel glass-card-gold">
                <div class="leader-badge">
                    <div class="leader-avatar">👨‍💼</div>
                    <div class="leader-meta">
                        <h3>Abhilash Verma Sir</h3>
                        <span>CHAIRMAN &amp; MANAGING DIRECTOR (CMD)</span>
                    </div>
                </div>

                <div class="office-info-item">
                    <div class="icon">📍</div>
                    <div class="text">
                        <h5>Corporate Headquarters</h5>
                        <p>Al Tayer Building, 147/2A Sheikh Zayed Road, Al Wasl, Dubai, UAE</p>
                    </div>
                </div>

                <div class="office-info-item">
                    <div class="icon">🗓️</div>
                    <div class="text">
                        <h5>Official Launch Date</h5>
                        <p>15th December 2023</p>
                    </div>
                </div>

                <div class="office-info-item">
                    <div class="icon">✉️</div>
                    <div class="text">
                        <h5>Official Email</h5>
                        <p>dubaifinanceofficial@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Executive Presentation</span>
        <span class="footer-highlight">Slide 02 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 3: TYPES OF INCOME ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Compensation Plan</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header">
            <div class="section-tag">EARNING OPPORTUNITIES</div>
            <h2 class="section-title"><span class="gold-text">Types of Income</span></h2>
            <p class="section-subtitle">6 Dynamic Revenue Streams Designed for Rapid &amp; Long-Term Financial Freedom</p>
        </div>

        <div class="income-types-grid">
            <div class="glass-card income-card">
                <div class="income-num-badge">01</div>
                <h3>Signup Bonus</h3>
                <div class="val gold-text">₹50 Bonus</div>
                <p>Instant complimentary welcome reward credited immediately upon account registration.</p>
            </div>

            <div class="glass-card income-card">
                <div class="income-num-badge">02</div>
                <h3>Basic ROI Income</h3>
                <div class="val emerald-text">5% Daily ROI</div>
                <p>Earn 1% daily profit plus 4% daily principal return for 25 consecutive days (Total 125%).</p>
            </div>

            <div class="glass-card income-card">
                <div class="income-num-badge">03</div>
                <h3>Fix Deposit (FD) ROI</h3>
                <div class="val cyan-text">10% - 15% Daily</div>
                <p>Institutional grade fixed staking delivering exceptional daily earnings for 180 or 210 days.</p>
            </div>

            <div class="glass-card income-card">
                <div class="income-num-badge">04</div>
                <h3>Direct Referral Income</h3>
                <div class="val gold-text">10% Instant</div>
                <p>Instant 10% commission credited to your wallet on every direct member deposit &amp; re-topup.</p>
            </div>

            <div class="glass-card income-card">
                <div class="income-num-badge">05</div>
                <h3>Basic Level Income</h3>
                <div class="val emerald-text">12 Levels Deep</div>
                <p>Daily recurring income calculated directly on your team's Basic ROI earnings across 12 levels.</p>
            </div>

            <div class="glass-card income-card">
                <div class="income-num-badge">06</div>
                <h3>FD Level Income</h3>
                <div class="val cyan-text">12 Levels Team</div>
                <p>Massive compound passive commissions derived from your team's Fixed Deposit performance.</p>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Income Ecosystem</span>
        <span class="footer-highlight">Slide 03 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 4: BASIC SAVING PACKAGE ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Flexible Daily Growth</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header">
            <div class="section-tag">STARTER TO ADVANCED INVESTMENTS</div>
            <h2 class="section-title"><span class="gold-text">Basic Saving Package</span></h2>
            <p class="section-subtitle">Consistent 5% Daily Return with Fast 25-Day Capital Redemption Cycle</p>
        </div>

        <div class="pkg-split-grid">
            <div class="glass-card pkg-main-card">
                <div class="pkg-amount-banner">
                    <div class="label">Investment Amount Range</div>
                    <div class="val">₹200  To  ₹5,00,000 (5 Lakh ₹)</div>
                </div>

                <div class="pkg-specs-row">
                    <div class="pkg-spec-box">
                        <div class="label">Daily Return (ROI)</div>
                        <div class="val emerald-text">5% Daily</div>
                    </div>
                    <div class="pkg-spec-box">
                        <div class="label">Tenure / Duration</div>
                        <div class="val cyan-text">25 Days</div>
                    </div>
                </div>

                <div class="pkg-specs-row">
                    <div class="pkg-spec-box">
                        <div class="label">Profit Breakdown</div>
                        <div class="val" style="font-size: 20px;">1% Net Profit + 4% Principal</div>
                    </div>
                    <div class="pkg-spec-box">
                        <div class="label">Total Maturity Return</div>
                        <div class="val gold-text">125% Total Return</div>
                    </div>
                </div>

                <div class="pkg-note-card">
                    <div class="icon">💎</div>
                    <div class="text">
                        <h4>Blockchain Currency Standard</h4>
                        <p>All Deposits and Withdrawals are processed in <strong>USDT BEP-20</strong>.<br>Fixed Valuation: <strong>1 USDT = 110 ₹</strong> for maximum exchange stability.</p>
                    </div>
                </div>
            </div>

            <div class="crypto-graphic-panel">
                <img src="{crypto_img}" alt="Crypto Trading Analysis">
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Basic Saving Plan</span>
        <span class="footer-highlight">Slide 04 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 5: DAILY ROI & COMPOUNDING TABLE ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Exponential Compounding Matrix</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header" style="margin-bottom: 15px;">
            <div class="section-tag">WEALTH MULTIPLICATION</div>
            <h2 class="section-title"><span class="gold-text">Daily ROI &amp; Compounding Power</span></h2>
            <p class="section-subtitle">Realize the 8th Wonder of the World: Projected Compounded Returns on Reinvestment</p>
        </div>

        <div class="table-container">
            <table class="luxe-table">
                <thead>
                    <tr>
                        <th>Investment</th>
                        <th>5% Daily ROI</th>
                        <th>Compound in 25 Days</th>
                        <th>Compound in 50 Days</th>
                        <th>Compound in 100 Days</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>₹200</td>
                        <td>₹10</td>
                        <td>₹400</td>
                        <td>₹1,000</td>
                        <td>₹4,500</td>
                    </tr>
                    <tr>
                        <td>₹500</td>
                        <td>₹25</td>
                        <td>₹1,000</td>
                        <td>₹2,500</td>
                        <td>₹12,000</td>
                    </tr>
                    <tr>
                        <td>₹1,000</td>
                        <td>₹50</td>
                        <td>₹2,000</td>
                        <td>₹5,000</td>
                        <td>₹40,000</td>
                    </tr>
                    <tr>
                        <td>₹2,000</td>
                        <td>₹100</td>
                        <td>₹4,000</td>
                        <td>₹15,000</td>
                        <td>₹1,20,000</td>
                    </tr>
                    <tr>
                        <td>₹5,000</td>
                        <td>₹250</td>
                        <td>₹16,875</td>
                        <td>₹40,000</td>
                        <td>₹3,20,000</td>
                    </tr>
                    <tr>
                        <td>₹10,000</td>
                        <td>₹500</td>
                        <td>₹33,750</td>
                        <td>₹80,000</td>
                        <td>₹6,40,000</td>
                    </tr>
                    <tr>
                        <td>₹50,000</td>
                        <td>₹2,500</td>
                        <td>₹1.60 Lakh ₹</td>
                        <td>₹4.00 Lakh ₹</td>
                        <td>₹32.00 Lakh ₹</td>
                    </tr>
                    <tr>
                        <td>₹1,00,000 (1 Lakh)</td>
                        <td>₹5,000</td>
                        <td>₹3.40 Lakh ₹</td>
                        <td>₹8.00 Lakh ₹</td>
                        <td>₹64.00 Lakh ₹</td>
                    </tr>
                    <tr>
                        <td>₹2,00,000 (2 Lakh)</td>
                        <td>₹10,000</td>
                        <td>₹6.80 Lakh ₹</td>
                        <td>₹16.00 Lakh ₹</td>
                        <td>₹1.28 Crores ₹</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Compounding Growth Chart</span>
        <span class="footer-highlight">Slide 05 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 6: FIX DEPOSIT OVERVIEW ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>High-Yield Institutional Staking</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header">
            <div class="section-tag">FIXED DEPOSIT (FD) PROGRAM</div>
            <h2 class="section-title"><span class="gold-text">Fix Deposit (FD) Package</span></h2>
            <p class="section-subtitle">Earn an Industry-Leading 10% To 15% Daily ROI on Long-Term Capital Allocation</p>
        </div>

        <div class="pkg-split-grid">
            <div class="glass-card pkg-main-card">
                <div class="pkg-amount-banner">
                    <div class="label">Eligible Investment Range</div>
                    <div class="val">₹1,000  To  ₹5,00,000 (5 Lakh ₹)</div>
                </div>

                <div class="pkg-specs-row">
                    <div class="pkg-spec-box" style="border-left: 4px solid #ffd056;">
                        <div class="label">Tier 1 Staking Rate</div>
                        <div class="val gold-text">10% Daily ROI</div>
                        <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">180 Days Contract Tenure</div>
                    </div>
                    <div class="pkg-spec-box" style="border-left: 4px solid #10b981;">
                        <div class="label">Tier 2 Staking Rate</div>
                        <div class="val emerald-text">15% Daily ROI</div>
                        <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">210 Days Contract Tenure</div>
                    </div>
                </div>

                <div class="pkg-note-card" style="background: rgba(30, 27, 75, 0.6); border-color: rgba(245, 192, 66, 0.4);">
                    <div class="icon">👑</div>
                    <div class="text">
                        <h4>Guaranteed Fixed Daily Passive Income</h4>
                        <p>Enjoy guaranteed returns credited directly to your Dubai Finance wallet every single day. Full principal + returns withdrawable at completion of tenure.</p>
                    </div>
                </div>
            </div>

            <div class="crypto-graphic-panel">
                <img src="{hero_img}" alt="Dubai Finance Luxury Staking">
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Fix Deposit Plan</span>
        <span class="footer-highlight">Slide 06 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 7: FD DAILY ROI INCOME CARDS ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Fix Deposit Tier Details</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header" style="margin-bottom: 10px;">
            <div class="section-tag">PORTFOLIO RETURN SCHEDULE</div>
            <h2 class="section-title"><span class="gold-text">FD Daily ROI Income</span></h2>
            <p class="section-subtitle">Side-by-Side Comparison of All 5 Fix Deposit Packages</p>
        </div>

        <div class="fd-cards-row">
            <!-- Card 1 -->
            <div class="glass-card fd-tier-card">
                <div class="fd-tier-header">
                    <span class="badge">PACKAGE 1</span>
                    <div class="price">₹1,000</div>
                </div>
                <div class="fd-plan-box plan-180">
                    <div class="plan-tag">Plan 180 Days (10%)</div>
                    <div class="daily-row">Daily: <strong>₹100</strong></div>
                    <div class="profit-row">Profit: <strong>₹18,000</strong></div>
                </div>
                <div class="fd-plan-box plan-210">
                    <div class="plan-tag">Plan 210 Days (15%)</div>
                    <div class="daily-row">Daily: <strong>₹150</strong></div>
                    <div class="profit-row">Profit: <strong>₹31,500</strong></div>
                </div>
                <div class="fd-btn">INVEST ₹1,000</div>
            </div>

            <!-- Card 2 -->
            <div class="glass-card fd-tier-card">
                <div class="fd-tier-header">
                    <span class="badge">PACKAGE 2</span>
                    <div class="price">₹10,000</div>
                </div>
                <div class="fd-plan-box plan-180">
                    <div class="plan-tag">Plan 180 Days (10%)</div>
                    <div class="daily-row">Daily: <strong>₹1,000</strong></div>
                    <div class="profit-row">Profit: <strong>₹1,80,000</strong></div>
                </div>
                <div class="fd-plan-box plan-210">
                    <div class="plan-tag">Plan 210 Days (15%)</div>
                    <div class="daily-row">Daily: <strong>₹1,500</strong></div>
                    <div class="profit-row">Profit: <strong>₹3,15,000</strong></div>
                </div>
                <div class="fd-btn">INVEST ₹10,000</div>
            </div>

            <!-- Card 3 -->
            <div class="glass-card fd-tier-card featured">
                <div class="fd-tier-header">
                    <span class="badge" style="background: #ffd056; color: #030712;">MOST POPULAR</span>
                    <div class="price" style="color: #ffd056;">₹50,000</div>
                </div>
                <div class="fd-plan-box plan-180">
                    <div class="plan-tag">Plan 180 Days (10%)</div>
                    <div class="daily-row">Daily: <strong>₹5,000</strong></div>
                    <div class="profit-row">Profit: <strong>₹9,00,000</strong></div>
                </div>
                <div class="fd-plan-box plan-210">
                    <div class="plan-tag">Plan 210 Days (15%)</div>
                    <div class="daily-row">Daily: <strong>₹7,500</strong></div>
                    <div class="profit-row">Profit: <strong>₹15,75,000</strong></div>
                </div>
                <div class="fd-btn" style="background: linear-gradient(135deg, #ffd056, #d97706); color: #030712; font-weight: 800;">INVEST ₹50,000</div>
            </div>

            <!-- Card 4 -->
            <div class="glass-card fd-tier-card">
                <div class="fd-tier-header">
                    <span class="badge">PACKAGE 4</span>
                    <div class="price">₹1,00,000</div>
                </div>
                <div class="fd-plan-box plan-180">
                    <div class="plan-tag">Plan 180 Days (10%)</div>
                    <div class="daily-row">Daily: <strong>₹10,000</strong></div>
                    <div class="profit-row">Profit: <strong>₹18,00,000</strong></div>
                </div>
                <div class="fd-plan-box plan-210">
                    <div class="plan-tag">Plan 210 Days (15%)</div>
                    <div class="daily-row">Daily: <strong>₹15,000</strong></div>
                    <div class="profit-row">Profit: <strong>₹31,50,000</strong></div>
                </div>
                <div class="fd-btn">INVEST 1 LAKH</div>
            </div>

            <!-- Card 5 -->
            <div class="glass-card fd-tier-card">
                <div class="fd-tier-header">
                    <span class="badge">PACKAGE 5 (VIP)</span>
                    <div class="price">₹5,00,000</div>
                </div>
                <div class="fd-plan-box plan-180">
                    <div class="plan-tag">Plan 180 Days (10%)</div>
                    <div class="daily-row">Daily: <strong>₹50,000</strong></div>
                    <div class="profit-row">Profit: <strong>₹90,00,000</strong></div>
                </div>
                <div class="fd-plan-box plan-210">
                    <div class="plan-tag">Plan 210 Days (15%)</div>
                    <div class="daily-row">Daily: <strong>₹75,000</strong></div>
                    <div class="profit-row">Profit: <strong>₹1.57 Crore</strong></div>
                </div>
                <div class="fd-btn">INVEST 5 LAKH</div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Staking Yield Matrix</span>
        <span class="footer-highlight">Slide 07 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 8: DIRECT REFERRAL INCOME ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Direct Partner Rewards</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header">
            <div class="section-tag">UNLIMITED DIRECT EARNINGS</div>
            <h2 class="section-title"><span class="gold-text">Direct Referral Income</span></h2>
            <p class="section-subtitle">Instant 10% Cash Credit on Every Direct Deposit across Basic Saving &amp; Fix Deposit</p>
        </div>

        <div class="referral-container">
            <div class="glass-card referral-giant-badge glass-card-gold">
                <div style="font-size: 40px; margin-bottom: -10px;">🎁</div>
                <div class="rate">10%</div>
                <div class="tag">INSTANT COMMISSION</div>
                <p style="color: #cbd5e1; font-size: 19px; max-width: 500px; margin-top: 5px; line-height: 1.5;">
                    Received instantly at every single deposit &amp; re-topup made by your sponsored members.
                </p>

                <div style="margin-top: 15px; padding: 14px 24px; background: rgba(0,0,0,0.4); border-radius: 12px; border: 1px dashed rgba(245, 192, 66, 0.4); width: 85%;">
                    <div style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Example Earning</div>
                    <div style="font-size: 17px; color: #ffffff;">Partner deposits <strong>₹50,000</strong> &rarr; You earn <strong style="color: #ffd056;">₹5,000 Instant</strong></div>
                </div>
            </div>

            <div class="referral-details-box">
                <div class="ref-feature-row">
                    <div class="icon-check">✓</div>
                    <div>
                        <h4>Universal Coverage</h4>
                        <p>Applies seamlessly to both <strong>Basic Saving</strong> and <strong>Fix Deposit (FD)</strong> packages.</p>
                    </div>
                </div>

                <div class="ref-feature-row">
                    <div class="icon-check">✓</div>
                    <div>
                        <h4>Real-Time Wallet Credit</h4>
                        <p>Zero waiting time. Commissions are credited to your USDT wallet the second transaction confirms.</p>
                    </div>
                </div>

                <div class="ref-feature-row">
                    <div class="icon-check">✓</div>
                    <div>
                        <h4>No Referral Limits</h4>
                        <p>Refer 5, 50, or 500+ partners. There is absolutely no cap on how much referral reward you can earn.</p>
                    </div>
                </div>

                <div class="ref-feature-row">
                    <div class="icon-check">✓</div>
                    <div>
                        <h4>Re-Topup Lifetime Income</h4>
                        <p>Whenever your direct partner adds funds or renews a contract, you earn 10% again and again.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Direct Referral System</span>
        <span class="footer-highlight">Slide 08 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 9: 12-LEVEL TEAM INCOME ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Multi-Tier Team Royalty</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header" style="margin-bottom: 15px;">
            <div class="section-tag">LEADERSHIP RESIDUAL REVENUE</div>
            <h2 class="section-title"><span class="gold-text">Daily Level Income</span></h2>
            <p class="section-subtitle">Basic Saving &amp; Fix Deposit &bull; Example: If Everyone in Team Invests Just ₹1,000</p>
        </div>

        <div class="level-grid">
            <div class="level-table-col">
                <div class="level-table-head">
                    <div>LEVEL TIER</div>
                    <div>DAILY ROI INCOME %</div>
                </div>
                <div class="level-row lvl-1">
                    <div>Level 1 (Directs)</div>
                    <div class="rate">5% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 2</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 3</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 4</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 5</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 6</div>
                    <div>1% Daily</div>
                </div>
            </div>

            <div class="level-table-col">
                <div class="level-table-head">
                    <div>LEVEL TIER</div>
                    <div>DAILY ROI INCOME %</div>
                </div>
                <div class="level-row">
                    <div>Level 7</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 8</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 9</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 10</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 11</div>
                    <div>1% Daily</div>
                </div>
                <div class="level-row">
                    <div>Level 12</div>
                    <div>1% Daily</div>
                </div>
            </div>
        </div>

        <div class="level-note-card">
            <div class="badge">IMPORTANT RULES</div>
            <p>
                <strong>Daily Level income is calculated on downline daily ROI income</strong> (not on one-time investment principal amount).<br>
                <strong>Requirement:</strong> Need <strong>1 Direct Referral</strong> to unlock each respective level (12 Direct Referrals unlock all 12 Levels).
            </p>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; 12-Level Royalty Plan</span>
        <span class="footer-highlight">Slide 09 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 10: TERMS & CONDITIONS ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Official Policy</span>
        </div>
    </div>

    <div class="content-container">
        <div class="section-header" style="margin-bottom: 15px;">
            <div class="section-tag">TRANSPARENCY &amp; PROTOCOLS</div>
            <h2 class="section-title"><span class="gold-text">Terms &amp; Conditions</span></h2>
            <p class="section-subtitle">Clear, Reliable &amp; Automated Guidelines for All Global Members</p>
        </div>

        <div class="terms-grid">
            <div class="term-card">
                <div class="term-icon">💳</div>
                <div class="term-text">
                    <h4>Withdrawal Limits</h4>
                    <p>Minimum Withdrawal: <strong>₹150 ($1.36)</strong><br>Maximum Withdrawal: <strong>₹5,00,000 ($4,546)</strong> per transaction.</p>
                </div>
            </div>

            <div class="term-card">
                <div class="term-icon">⏰</div>
                <div class="term-text">
                    <h4>Daily Withdrawal Window</h4>
                    <p>Withdrawal window is open everyday between <strong>10:00 AM To 02:00 PM</strong> for swift batch settlements.</p>
                </div>
            </div>

            <div class="term-card">
                <div class="term-icon">🛡️</div>
                <div class="term-text">
                    <h4>Zero Deductions (100% Payout)</h4>
                    <p><strong>0% Admin Charges, Zero TDS, Zero Withdrawal Deductions.</strong> You receive 100% of what you earn.</p>
                </div>
            </div>

            <div class="term-card">
                <div class="term-icon">🔓</div>
                <div class="term-text">
                    <h4>No Withdrawal Conditions</h4>
                    <p><strong>No mandatory direct referrals</strong> required to withdraw your earned funds. Freedom to withdraw anytime.</p>
                </div>
            </div>

            <div class="term-card">
                <div class="term-icon">⚡</div>
                <div class="term-text">
                    <h4>ID Activation &amp; P2P Transfer</h4>
                    <p>Activate new accounts directly from your income balance with zero deduction. Fast internal P2P transfers available.</p>
                </div>
            </div>

            <div class="term-card">
                <div class="term-icon">🔗</div>
                <div class="term-text">
                    <h4>Decentralized Blockchain Standard</h4>
                    <p>All deposits and withdrawals operate on the secure <strong>USDT BEP-20 network</strong> (Binance Smart Chain).</p>
                </div>
            </div>

            <div class="term-card" style="grid-column: span 2; background: rgba(30, 27, 75, 0.7); border-color: rgba(245, 192, 66, 0.4);">
                <div class="term-icon">📅</div>
                <div class="term-text">
                    <h4>Fix Deposit (FD) Maturity Payout</h4>
                    <p>FD Daily ROI &amp; FD Level Income can be withdrawn upon successful contract completion after <strong>180 Days</strong> or <strong>210 Days</strong>.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; Compliance &amp; Protocol</span>
        <span class="footer-highlight">Slide 10 / 11</span>
    </div>
</section>

<!-- ==================== SLIDE 11: THANK YOU / CORPORATE ADDRESS ==================== -->
<section class="slide">
    <div class="bg-glow-gold"></div>
    <div class="bg-glow-blue"></div>

    <div class="top-bar">
        <div class="brand-badge">
            <div class="brand-logo-icon">⚜️</div>
            <span class="brand-name">DUBAI FINANCE</span>
        </div>
        <div class="top-tag">
            <span>Global Corporate Office</span>
        </div>
    </div>

    <div class="content-container">
        <div class="closing-split">
            <div class="closing-details-panel">
                <div>
                    <div class="section-tag">A NEW BEGINNING &bull; BETTER SERVICES</div>
                    <h2 class="big-thank">
                        Thank You!<br>
                        <span style="font-size: 42px; color: #ffffff;">Welcome to Dubai Finance</span>
                    </h2>
                    <p style="font-size: 19px; color: #94a3b8; margin-top: 12px; line-height: 1.5;">
                        Join the next generation of financial independence backed by real trading expertise and institutional strength in the financial capital of the world.
                    </p>
                </div>

                <div class="contact-cards-list">
                    <div class="contact-card">
                        <div class="c-icon">👨‍💼</div>
                        <div class="c-info">
                            <h5>Leadership</h5>
                            <p>CMD – Abhilash Verma Sir</p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="c-icon">🏢</div>
                        <div class="c-info">
                            <h5>Headquarters Office</h5>
                            <p>Al Tayer Building, 147/2A Sheikh Zayed Road, Al Wasl, Dubai, UAE</p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="c-icon">✉️</div>
                        <div class="c-info">
                            <h5>Official Support Email</h5>
                            <p>dubaifinanceofficial@gmail.com</p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="c-icon">🌐</div>
                        <div class="c-info">
                            <h5>Official Web Portal</h5>
                            <p>Dubaifinance.online</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="office-card-hero">
                <img src="{office_img}" alt="Dubai Finance Headquarters">
                <div class="office-badge-overlay">
                    <div style="font-size: 14px; font-weight: 700; color: #ffd056; letter-spacing: 2px;">PROUDLY IN DUBAI</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 4px;">Al Tayer Building &bull; Sheikh Zayed Road</div>
                </div>
            </div>
        </div>
    </div>

    <div class="slide-footer">
        <span>Dubai Finance &bull; All Rights Reserved 2024</span>
        <span class="footer-highlight">Slide 11 / 11</span>
    </div>
</section>

</body>
</html>
"""

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f'Wrote {html_file} successfully.')

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
html_path = os.path.abspath(html_file)
pdf_path = os.path.abspath(pdf_file)

cmd = [
    chrome_path,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={pdf_path}',
    f'file:///{html_path}'
]
print('Running Chrome headless to generate PDF...')
res = subprocess.run(cmd, capture_output=True, text=True)
print('Chrome return code:', res.returncode)

if os.path.exists(pdf_path):
    doc = pymupdf.open(pdf_path)
    print(f'Successfully generated {pdf_file} with {len(doc)} pages!')
else:
    print('Error: PDF file was not generated.')
