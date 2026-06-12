"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Business",
    questions: [
      {
        q: "How do I get my QR code?",
        a: "Upon signup, you can instantly download and print your code. We also mail you a premium acrylic display for your counter within 3-5 business days."
      },
      {
        q: "Do I need to train staff?",
        a: "Zero training required. Customers interact entirely with their own phones and the QR code. Your staff just does their job."
      },
      {
        q: "Can I export feedback?",
        a: "Yes, all structured data and raw transcripts can be exported to CSV."
      }
    ]
  },
  {
    category: "Customer Experience",
    questions: [
      {
        q: "Do customers need an app?",
        a: "No. The QR code opens a lightweight webpage directly in their mobile browser."
      },
      {
        q: "Is the feedback public?",
        a: "Absolutely not. Auris is a private channel directly to management. Nothing is posted to Google or Yelp."
      }
    ]
  },
  {
    category: "AI & Insights",
    questions: [
      {
        q: "How are insights generated?",
        a: "We use advanced speech-to-text models combined with LLMs to transcribe the audio, detect emotional tone, and categorize the feedback into operational themes."
      },
      {
        q: "Can I listen to original recordings?",
        a: "Yes. While the AI gives you the summary, you always have access to the raw audio to hear the exact tone of your customer."
      }
    ]
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-white" id="faq">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
            Questions? We have answers.
          </h2>
        </div>
        <div className="mt-16 space-y-12">
          {FAQS.map((group) => (
            <div key={group.category}>
              <h3 className="text-xl font-semibold text-[var(--brand-ink)] mb-4">{group.category}</h3>
              <div className="space-y-4">
                {group.questions.map((faq, idx) => {
                  const id = `${group.category}-${idx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={idx} className="border-b border-gray-100 pb-4">
                      <button
                        onClick={() => toggle(id)}
                        className="flex w-full items-start justify-between text-left text-lg font-medium text-gray-900 focus:outline-none"
                      >
                        <span>{faq.q}</span>
                        <span className="ml-6 flex h-7 items-center">
                          <svg
                            className={cn("h-6 w-6 transform transition-transform duration-200", isOpen ? "rotate-180" : "rotate-0")}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="mt-2 pr-12">
                          <p className="text-base text-gray-500">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
