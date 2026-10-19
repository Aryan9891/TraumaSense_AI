import React from "react";

export const FAQ_ITEMS = [
  {
    question: "How is my privacy and confidentiality protected when reporting distress?",
    answer:
      "TraumaSense operates on a survivor-first privacy architecture. All submissions are encrypted in transit and at rest with role-based access. Audio files are processed for clinical acoustic biomarkers (such as pitch tremor and hesitation pauses) without retaining identifiable voiceprints for commercial profiling, and zero tracking cookies or advertising pixels are used.",
  },
  {
    question: "Which Indian languages are currently supported for voice and text statements?",
    answer:
      "TraumaSense supports 7 major Indian languages: Hindi (हिंदी), Bengali (বাংলা), Marathi (मराठी), Tamil (தமிழ்), Telugu (తెలుగు), Odia (ଓଡ଼ିଆ), and English. Survivors can narrate or type in their mother tongue, and the clinical NLP pipeline processes distress markers natively.",
  },
  {
    question: "What is the Stress Vulnerability Index (SVI) and how is it calculated?",
    answer:
      "The Stress Vulnerability Index (SVI) is a clinical triage score scaled from 0 to 100. It synthesizes acoustic speech biomarkers (YIN pitch, RMS energy, spectral centroid, pause ratio) with linguistic crisis indicators (Columbia C-SSRS suicidal ideation, weapon and violence detection, intimidation cues) to help responders rapidly prioritize life-threatening cases.",
  },
  {
    question: "What happens when an acute emergency or weapon threat is detected?",
    answer:
      "When an assessment flags acute distress (SVI >= 78 or explicit weapon/violence threat), the platform automatically activates high-priority safety override protocols. A critical alert banner is raised for emergency dispatchers, and immediate referral pathways to 112 (National Emergency), 181 (Women in Distress), 1098 (Childline), or 14416 (Tele-MANAS) are surfaced with localized safety planning.",
  },
  {
    question: "Can survivors track their case status and recommendations anonymously?",
    answer:
      "Yes. Every filed statement generates a unique Case Reference ID. Survivors can monitor triage status, forensic biomarker assessments, and prescribed legal, medical, or protective recommendations via the Case Status portal.",
  },
];

export default function SeoJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://traumasense-ai.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${siteUrl}/#medicalwebpage`,
        name: "TraumaSense Multilingual Crisis Reporting & Clinical Triage Platform",
        description:
          "Trauma-informed multilingual crisis reporting, acoustic distress triage, and clinical decision support platform across 7 Indian regional languages.",
        url: siteUrl,
        inLanguage: ["en", "hi", "bn", "mr", "ta", "te", "or"],
        about: [
          {
            "@type": "MedicalCondition",
            name: "Psychological Trauma and Acute Distress",
          },
        ],
        audience: {
          "@type": "Audience",
          audienceType:
            "Crisis Survivors, Duty Officers, First Responders, and Healthcare Professionals",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#webapp`,
        name: "TraumaSense",
        applicationCategory: "HealthApplication",
        operatingSystem: "All modern web browsers",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "EmergencyService",
        "@id": `${siteUrl}/#emergencyservice`,
        name: "India National Emergency & Crisis Helplines",
        areaServed: "IN",
        availableLanguage: ["en", "hi", "bn", "mr", "ta", "te", "or"],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "112",
            contactType: "emergency",
            availableLanguage: ["en", "hi", "bn", "mr", "ta", "te", "or"],
            areaServed: "IN",
          },
          {
            "@type": "ContactPoint",
            telephone: "181",
            contactType: "women crisis",
            availableLanguage: ["en", "hi", "bn", "mr", "ta", "te", "or"],
            areaServed: "IN",
          },
          {
            "@type": "ContactPoint",
            telephone: "1098",
            contactType: "child helpline",
            availableLanguage: ["en", "hi", "bn", "mr", "ta", "te", "or"],
            areaServed: "IN",
          },
          {
            "@type": "ContactPoint",
            telephone: "14416",
            contactType: "mental health crisis (Tele-MANAS)",
            availableLanguage: ["en", "hi", "bn", "mr", "ta", "te", "or"],
            areaServed: "IN",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
