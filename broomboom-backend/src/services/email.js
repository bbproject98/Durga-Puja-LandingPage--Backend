const axios = require("axios");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
require("../config/env");
/* ============================================================
 * BroomBoom Cabs — Lead Confirmation Email (Brevo + React)
 * Durga Puja 2026 Festive Edition 🪔  |  Image Ticket UI
 * ============================================================ */

/* ---------- Config ---------- */

const CFG = {
  websiteUrl: process.env.WEBSITE_URL || "https://durgapuja.broomboomcabs.com/",
  offerUrl: process.env.OFFER_URL || "https://durgapuja.broomboomcabs.com/offer",
  fleetUrl: process.env.FLEET_URL || "https://durgapuja.broomboomcabs.com/fleet",
  outstationUrl: process.env.OUTSTATION_URL || "https://durgapuja.broomboomcabs.com/outstation-fleet",
  supportPhone: process.env.SUPPORT_PHONE || "8240765499",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "918240765499",
  whatsappIcon: process.env.WHATSAPP_ICON_URL || "https://cdn-icons-png.flaticon.com/512/733/733585.png",
  logoUrl: process.env.LOGO_URL || "https://durgapuja.broomboomcabs.com/images/Broomboom-logo.png",
  pujaImage: process.env.PUJA_IMAGE_URL || "https://durgapuja.broomboomcabs.com/images/durga-puja-2026-broomboom-cabs.jpg",
  
  // ✅ NEW COUPON IMAGE
  couponImage: process.env.COUPON_IMAGE_URL || "https://i.postimg.cc/CM4yHCgM/image.png",
  
  offerAmount: "₹500",
  offerExpiryDays: "2",
};

/* ============================================================
 * Helpers
 * ============================================================ */

const buildEnquiryText = (context) => {
  if (typeof context === "string" && context.trim()) return context.trim();
  if (context && typeof context === "object") {
    const parts = [];
    if (context.pickup) parts.push(`Pickup: ${context.pickup}`);
    if (context.drop) parts.push(`Drop: ${context.drop}`);
    if (context.travelDate) parts.push(`Date: ${context.travelDate}`);
    if (context.passengers) parts.push(`Passengers: ${context.passengers}`);
    if (context.vehicleType) parts.push(`Vehicle: ${context.vehicleType}`);
    if (context.message) parts.push(context.message);
    if (parts.length) return parts.join(" • ");
  }
  return "General Inquiry";
};

const buildOfferUrl = (context) => {
  if (typeof context === "string") {
    const t = context.trim();
    if (t.startsWith("Rental Package:")) return CFG.fleetUrl;
    if (t.startsWith("Outstation:")) return CFG.outstationUrl;
  }
  return CFG.offerUrl;
};

/* ============================================================
 * Styles (Coupon image size reduced)
 * ============================================================ */

const S = {
  wrapper: {
    maxWidth: 480,
    margin: "15px auto",
    background: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderTop: "8px solid #7C2D12",
    borderBottom: "8px solid #7C2D12",
    borderLeft: "1px solid #FCD34D",
    borderRight: "1px solid #FCD34D",
    fontFamily: "'Segoe UI', 'Noto Sans Bengali', Arial, sans-serif",
    boxShadow: "0 10px 30px rgba(124, 45, 18, 0.15)",
  },

  strip: {
    background: "linear-gradient(90deg, #7C2D12 0%, #B91C1C 30%, #DC2626 50%, #B91C1C 70%, #7C2D12 100%)",
    padding: "10px 8px",
    textAlign: "center",
    borderBottom: "2px solid #FBBF24",
  },
  stripText: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#FEF3C7",
    margin: 0,
    display: "inline-block",
    textShadow: "0 2px 4px rgba(0,0,0,0.4)",
  },

  heroWrap: { display: "block", textDecoration: "none", background: "#7C2D12", position: "relative" },
  hero: { display: "block", width: "100%", maxWidth: 480, height: "auto", border: 0 },

  body: { padding: "12px 14px 0", color: "#3F3F46", lineHeight: 1.5 },

  h2: { fontSize: 20, color: "#7C2D12", margin: "0 0 4px", fontWeight: 800, letterSpacing: 0.5 },
  festive: { fontSize: 16, fontWeight: 900, color: "#DC2626", margin: "0 0 2px", letterSpacing: 0.8 },
  festiveSub: { fontSize: 13, color: "#B45309", margin: "0 0 6px", fontWeight: 600, fontStyle: "italic" },
  muted: { fontSize: 14, color: "#52525B", margin: "0 0 6px" },

  enquiryBox: {
    margin: "0 0 6px",
    padding: "10px 12px",
    background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
    borderLeft: "5px solid #DC2626",
    borderRadius: 10,
  },
  label: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 900, color: "#92400E", margin: "0 0 4px" },
  enquiry: { fontSize: 13, color: "#4B2E05", fontWeight: 600, margin: 0, lineHeight: 1.5 },

  /* ---------- COUPON IMAGE STYLE (SIZE REDUCED) ---------- */
  couponImgWrapper: {
    display: "block",
    textDecoration: "none",
    margin: "0 0 6px",
    textAlign: "center",
    maxWidth: 340,
    marginLeft: "auto",
    marginRight: "auto",
  },
  couponImg: {
    display: "block",
    width: "100%",
    maxWidth: 340,
    height: "auto",
    border: 0,
    borderRadius: 10,
  },

  /* Avail Now Button */
  availBtn: {
    display: "block",
    textAlign: "center",
    textDecoration: "none",
    backgroundColor: "#5E35B1",
    color: "#FFFFFF",
    fontSize: 12,           // Reduced from 14 for a smaller look
    fontWeight: 900,
    padding: "8px 16px",    // Reduced padding (was 12px 20px)
    borderRadius: 20,       // Pill shape looks more compact
    margin: "0 auto 8px",
    width: "fit-content",   // Shrinks the button to fit the text perfectly
    minWidth: "120px",      // Ensures it doesn't get too tiny
    maxWidth: "160px",      // Prevents it from stretching too wide
    boxShadow: "0 4px 10px rgba(94, 53, 177, 0.4)", // Lighter shadow
    textTransform: "uppercase",
    letterSpacing: "1px",   // Reduced from 1.5px to save horizontal space
    border: "1px solid #7E57C2",
  },
  sectionWrap: { textAlign: "center", margin: "0 0 4px" },
  sectionFlourish: { fontSize: 12, letterSpacing: 8, color: "#F59E0B", fontWeight: 900, lineHeight: 1, margin: "0 0 2px" },
  sectionHeading: { fontSize: 14, fontWeight: 900, color: "#7C2D12", margin: 0, letterSpacing: 1.5, textTransform: "uppercase" },

  table: { width: "100%", margin: "0 0 4px" },
  cell: { padding: 2, width: "50%", verticalAlign: "top" },
  
  /* Guarantee Cards - Height Reduced */
  gBase: { borderRadius: 8, padding: "6px 4px", textAlign: "center", border: "1px solid #FFFFFF", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.06)" },
  gYellow: { background: "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)" },
  gPink: { background: "linear-gradient(135deg, #FDF2F8 0%, #F9A8D4 100%)" },
  gGreen: { background: "linear-gradient(135deg, #ECFDF5 0%, #86EFAC 100%)" },
  gBlue: { background: "linear-gradient(135deg, #EFF6FF 0%, #93C5FD 100%)" },
  gEmoji: { fontSize: 18, margin: "0 0 2px", lineHeight: 1, display: "block" },
  gTextBase: { fontSize: 10, fontWeight: 900, margin: 0, lineHeight: 1.2, letterSpacing: 0.5 },
  gTextYellow: { color: "#854D0E" },
  gTextPink: { color: "#9D174D" },
  gTextGreen: { color: "#166534" },
  gTextBlue: { color: "#1E3A8A" },

  btnCall: { display: "block", textAlign: "center", textDecoration: "none", background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#FFFFFF", fontWeight: 900, fontSize: 13, padding: "10px 8px", borderRadius: 10, letterSpacing: 1, boxShadow: "0 6px 15px rgba(5, 150, 105, 0.35)" },
  btnWeb: { display: "block", textAlign: "center", textDecoration: "none", background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", color: "#FFFFFF", fontWeight: 900, fontSize: 13, padding: "10px 8px", borderRadius: 10, letterSpacing: 1, boxShadow: "0 6px 15px rgba(29, 78, 216, 0.35)" },

  /* WhatsApp & Book Buttons - Side by Side */
  waLink: { color: "#059669", fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: 0.5, display: "block", textAlign: "center", padding: "8px 6px", background: "#ECFDF5", borderRadius: 20, border: "1px solid #A7F3D0" },
  waIcon: { display: "inline-block", verticalAlign: "middle", marginRight: 4, border: 0 },
  bookBtn: { display: "block", textAlign: "center", textDecoration: "none", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#7C2D12", fontWeight: 900, fontSize: 11, padding: "8px 6px", borderRadius: 20, letterSpacing: 0.5, border: "1px solid #B45309", boxShadow: "0 4px 10px rgba(180, 83, 9, 0.3)" },

  closing: { fontSize: 13, color: "#52525B", margin: "6px 0 0", lineHeight: 1.6, textAlign: "center" },

  footer: { background: "linear-gradient(135deg, #FFF7E6 0%, #FCE7F3 60%, #FEF3C7 100%)", borderTop: "4px double #FBBF24", padding: "0 12px 12px", textAlign: "center" },
  footerText: { fontSize: 10, color: "#92400E", margin: 0, lineHeight: 1.6 },
  footerLogo: { display: "inline-block", verticalAlign: "middle", marginRight: 6, borderRadius: 4, border: 0 },
  footerMotif: { fontSize: 12, letterSpacing: 6, color: "#B91C1C", fontWeight: 900, margin: "0 0 4px", lineHeight: 1 },
};

/* ============================================================
 * Motion & Dark Mode Layer (CSS)
 * ============================================================ */

const EMAIL_CSS = `
@keyframes bbRise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.bb-body > * { animation: bbRise .8s cubic-bezier(.2,.8,.2,1) backwards; }
.bb-body > *:nth-child(1)  { animation-delay: .05s; }
.bb-body > *:nth-child(2)  { animation-delay: .12s; }
.bb-body > *:nth-child(3)  { animation-delay: .19s; }
.bb-body > *:nth-child(4)  { animation-delay: .26s; }
.bb-body > *:nth-child(5)  { animation-delay: .33s; }
.bb-body > *:nth-child(6)  { animation-delay: .40s; }
.bb-body > *:nth-child(7)  { animation-delay: .47s; }
.bb-body > *:nth-child(8)  { animation-delay: .54s; }

@keyframes bbFlow {
  0%,100% { background-position: 0% 50%; }
  50%     { background-position: 100% 50%; }
}
.bb-strip {
  background-size: 300% 100% !important;
  animation: bbFlow 8s ease-in-out infinite;
}
@keyframes bbFlicker {
  0%,100% { opacity: 1;  text-shadow: 0 0 15px rgba(254,243,199,.7); }
  50%     { opacity: .9; text-shadow: 0 0 25px rgba(251,191,36,1); }
}
.bb-strip-text { animation: bbFlicker 3s ease-in-out infinite; }

.bb-hero img { transition: transform .8s cubic-bezier(.2,.8,.2,1), filter .8s ease; }
.bb-hero:hover img { transform: scale(1.05); filter: brightness(1.1); }

.bb-coupon-img { transition: transform .4s ease, filter .4s ease; }
.bb-coupon-img:hover { transform: scale(1.03); filter: brightness(1.05); }

@keyframes bbPulse {
  0%,100% { box-shadow: 0 10px 25px rgba(94, 53, 177, 0.4); }
  50%     { box-shadow: 0 15px 35px rgba(94, 53, 177, 0.7); }
}
.bb-avail {
  animation: bbPulse 2.5s ease-in-out infinite;
  transition: transform .3s ease, filter .3s ease;
}
.bb-avail:hover { transform: translateY(-4px) scale(1.02); filter: brightness(1.1); }
.bb-avail:active { transform: translateY(-1px) scale(.99); }

.bb-guarantee { transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s ease, filter .4s ease; }
.bb-guarantee:hover { transform: translateY(-8px) scale(1.05); filter: saturate(1.2) brightness(1.05); box-shadow: 0 20px 40px rgba(0,0,0,.15) !important; }
@keyframes bbWiggle {
  0%,100% { transform: rotate(0deg) scale(1); }
  25%     { transform: rotate(-15deg) scale(1.2); }
  75%     { transform: rotate(15deg)  scale(1.2); }
}
.bb-g-emoji { display: block; }
.bb-guarantee:hover .bb-g-emoji { animation: bbWiggle .8s ease-in-out; }

.bb-call, .bb-web { transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease, filter .3s ease; }
.bb-call:hover { transform: translateY(-4px); filter: brightness(1.15); box-shadow: 0 20px 40px rgba(5,150,105,.5) !important; }
.bb-web:hover { transform: translateY(-4px); filter: brightness(1.15); box-shadow: 0 20px 40px rgba(29,78,216,.5) !important; }

.bb-wa-link { transition: all .3s ease; }
.bb-wa-link:hover { background: #D1FAE5; transform: scale(1.02); }
.bb-wa-link img { transition: transform .4s cubic-bezier(.2,.8,.2,1); }
.bb-wa-link:hover img { transform: scale(1.2) rotate(-10deg); }

@keyframes bbBookGlow {
  0%,100% { box-shadow: 0 8px 20px rgba(180,83,9,.3); }
  50%     { box-shadow: 0 15px 35px rgba(251,191,36,.7); }
}
.bb-book { animation: bbBookGlow 3s ease-in-out infinite; transition: transform .3s cubic-bezier(.2,.8,.2,1), filter .3s ease; }
.bb-book:hover { transform: translateY(-5px) scale(1.08); filter: brightness(1.1) saturate(1.2); }

@media (prefers-color-scheme: dark) {
  .bb-root { background-color: #1F1F1F !important; border-color: #B91C1C !important; }
  .bb-body { background-color: #1F1F1F !important; color: #E5E5E5 !important; }
  .bb-body h2, .bb-body p, .bb-body .bb-closing { color: #E5E5E5 !important; }
  .bb-enquiry { background: #2A2A2A !important; border-left-color: #F59E0B !important; }
  .bb-enquiry .bb-label, .bb-enquiry .bb-enquiry-text { color: #FDE68A !important; }
  .bb-footer { background: #111111 !important; border-top-color: #B91C1C !important; }
  .bb-footer p { color: #A3A3A3 !important; }
  .bb-g-yellow, .bb-g-pink, .bb-g-green, .bb-g-blue { background: #2A2A2A !important; border-color: #404040 !important; }
  .bb-g-text { color: #E5E5E5 !important; }
}

@media (prefers-reduced-motion: reduce) {
  .bb-root *, .bb-root *::after { animation: none !important; transition: none !important; }
}
`;

/* ============================================================
 * React email component
 * ============================================================ */

const R = React.createElement;

const Guarantee = ({ bg, emoji, text, color }) =>
  R(
    "div",
    { className: "bb-guarantee", style: { ...S.gBase, ...bg } },
    R("div", { className: "bb-g-emoji", style: S.gEmoji }, emoji),
    R(
      "div",
      { className: "bb-g-text", style: { ...S.gTextBase, color } },
      text.split("\n").map((line, i, arr) =>
        R(React.Fragment, { key: i }, line, i < arr.length - 1 ? R("br", { key: `br-${i}` }) : null)
      )
    )
  );

const SectionHeading = ({ title }) =>
  R(
    "div",
    { style: S.sectionWrap },
    R("div", { style: S.sectionFlourish }, "❋ ✦ ❋ ✦ ❋"),
    R("div", { style: S.sectionHeading }, title)
  );

function LeadEmail({ customerName, enquiryText, offerUrl, whatsappLink, currentYear }) {
  return R(
    "div",
    { className: "bb-root", style: S.wrapper },

    /* Top festive strip */
    R(
      "div",
      { className: "bb-strip", style: S.strip },
      R("span", { className: "bb-strip-text", style: S.stripText }, "🪔  Durga Puja 2026 Special  🪔")
    ),

    /* Hero image */
    R(
      "a",
      { href: offerUrl, target: "_blank", className: "bb-hero", style: S.heroWrap },
      R("img", {
        src: CFG.pujaImage,
        alt: "BroomBoom Cabs — Durga Puja 2026",
        width: 480,
        style: S.hero,
      })
    ),

    /* Body */
    R(
      "div",
      { className: "bb-body", style: S.body },

      R("h2", { style: S.h2 }, `Hello ${customerName},`),
      R("p", { style: S.festive }, "🪔 Shubho Sharadiya!"),
      R("p", { style: S.festiveSub }, "May Maa Durga bless you with joy, prosperity & safe journeys."),
      R("p", { style: S.muted }, "Your enquiry is confirmed ✅ — our travel expert will reach out shortly. Here's a little Puja gift for you:"),

      /* Enquiry block */
      R(
        "div",
        { className: "bb-enquiry", style: S.enquiryBox },
        R("div", { className: "bb-label", style: S.label }, "✦ Your Enquiry ✦"),
        R("div", { className: "bb-enquiry-text", style: S.enquiry }, enquiryText)
      ),

      /* Coupon Image (SIZE REDUCED) */
      R(
        "a",
        { href: offerUrl, target: "_blank", className: "bb-coupon-img-wrapper", style: S.couponImgWrapper },
        R("img", {
          src: CFG.couponImage,
          alt: `${CFG.offerAmount} OFF Coupon`,
          width: 340,
          className: "bb-coupon-img",
          style: S.couponImg,
        })
      ),

      /* Avail Now Button */
      R(
        "a",
        { href: offerUrl, target: "_blank", className: "bb-avail", style: S.availBtn },
        "Avail Now →"
      ),

      /* Guarantees */
      R(SectionHeading, { title: "Why Ride With Us" }),
      R(
        "table",
        { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, border: 0, style: S.table },
        R(
          "tbody",
          null,
          R(
            "tr",
            null,
            R("td", { style: S.cell }, R(Guarantee, { bg: S.gYellow, emoji: "🚖", text: "100% CAB\nGUARANTEE", color: S.gTextYellow.color })),
            R("td", { style: S.cell }, R(Guarantee, { bg: S.gPink, emoji: "🗺️", text: "TOUR EXPERT\nGUIDES", color: S.gTextPink.color }))
          ),
          R(
            "tr",
            null,
            R("td", { style: S.cell }, R(Guarantee, { bg: S.gGreen, emoji: "🛠️", text: "24/7 ON ROAD\nRIDE ASSISTANCE", color: S.gTextGreen.color })),
            R("td", { style: S.cell }, R(Guarantee, { bg: S.gBlue, emoji: "📋", text: "TRANSPARENT\nBILLING SYSTEM", color: S.gTextBlue.color }))
          )
        )
      ),

      /* Call + Website */
      R(
        "table",
        { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, border: 0, style: { margin: "0 0 4px" } },
        R(
          "tbody",
          null,
          R(
            "tr",
            null,
            R("td", { width: "50%", style: { paddingRight: 4 } }, R("a", { href: `tel:${CFG.supportPhone}`, className: "bb-call", style: S.btnCall }, "📞 Call Us")),
            R("td", { width: "50%", style: { paddingLeft: 4 } }, R("a", { href: CFG.websiteUrl, target: "_blank", className: "bb-web", style: S.btnWeb }, "🌐 Website"))
          )
        )
      ),

      /* WhatsApp + Reserve Cabs (Side by Side) */
      R(
        "table",
        { role: "presentation", width: "100%", cellPadding: 0, cellSpacing: 0, border: 0, style: { margin: "0 0 6px" } },
        R(
          "tbody",
          null,
          R(
            "tr",
            null,
            R(
              "td",
              { width: "50%", style: { paddingRight: 4, verticalAlign: "middle" } },
              R(
                "a",
                { href: whatsappLink, target: "_blank", className: "bb-wa-link", style: S.waLink },
                R("img", { src: CFG.whatsappIcon, alt: "WhatsApp", width: 14, height: 14, style: S.waIcon }),
                R("span", { style: { verticalAlign: "middle" } }, "WhatsApp")
              )
            ),
            R(
              "td",
              { width: "50%", style: { paddingLeft: 4, verticalAlign: "middle" } },
              R("a", { href: CFG.websiteUrl, target: "_blank", className: "bb-book", style: S.bookBtn }, "🚖 Reserve Cabs")
            )
          )
        )
      ),

      /* Closing */
      R(
        "p",
        { style: S.closing },
        "Wishing you a joyful Puja season,",
        R("br"),
        R("strong", { style: { color: "#7C2D12" } }, "Team BroomBoom Cabs"),
        " 🚖🪔"
      )
    ),

    /* Footer */
    R(
      "div",
      { style: S.footer },
      R("div", { className: "bb-footer-motif", style: S.footerMotif }, "❋ ✿ ❋ ✿ ❋"),
      R(
        "p",
        { style: S.footerText },
        R("img", { src: CFG.logoUrl, alt: "BroomBoom Cabs", width: 20, height: 20, style: S.footerLogo }),
        R("span", { style: { verticalAlign: "middle", fontWeight: 800 } }, `© ${currentYear} BroomBoom Cabs. All rights reserved.`),
        R("br"),
        "You're receiving this because you submitted an enquiry on our website."
      )
    )
  );
}

/* ============================================================
 * sendLeadEmail
 * ============================================================ */

const sendLeadEmail = async ({ name, email, context = "" }) => {
  if (!email) {
    console.log("No customer email. Skipping email.");
    return null;
  }

  if (!process.env.BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY in environment.");
    return null;
  }

  const customerName = name || "Guest Traveler";
  const enquiryText = buildEnquiryText(context);
  const offerUrl = buildOfferUrl(context);
  const currentYear = new Date().getFullYear();

  const whatsappLink = `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(
    `Hi BroomBoom Cabs! 🚖 I'd like to claim the ${CFG.offerAmount} OFF Durga Puja offer.`
  )}`;

  const innerHtml = renderToStaticMarkup(
    R(LeadEmail, { customerName, enquiryText, offerUrl, whatsappLink, currentYear })
  );

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>BroomBoom Cabs — Durga Puja 2026</title>
<style>
${EMAIL_CSS}
</style>
</head>
<body style="margin:0;padding:0;background-color:#F3E5F5;background-image:linear-gradient(135deg,#F3E5F5 0%,#FFF7E6 50%,#FCE7F3 100%);">
${innerHtml}
</body>
</html>`;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || "BroomBoom Cabs",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email, name: customerName }],
        subject: `🪔 Shubho Sharadiya ${customerName}! Your ${CFG.offerAmount} OFF Puja ride is waiting 🚖`,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("Customer email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Brevo email error:", error.response?.data || error.message);
    return null;
  }
};

module.exports = { sendLeadEmail, LeadEmail };