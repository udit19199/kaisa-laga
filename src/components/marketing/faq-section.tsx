"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Customer Experience",
    questions: [
      {
        q: "Do customers need an app?",
        a: "No. They simply scan the QR code and it opens immediately in their mobile browser."
      },
      {
        q: "Is feedback anonymous?",
        a: "Customers can leave their feedback anonymously, but they have the option to leave their contact info if they want a follow-up."
      },
      {
        q: "Is feedback public?",
        a: "Absolutely not. Auris is a private channel directly to management. Nothing is posted to Google or Yelp."
      }
    ]
  },
  {
    category: "Getting Started",
    questions: [
      {
        q: "How long does setup take?",
        a: "Less than 5 minutes. You sign up, enter your location name, and your QR code is generated instantly."
      },
      {
        q: "How do I get my QR code?",
        a: "You can download it instantly from your dashboard to print yourself, or we can mail you a premium acrylic counter display."
      },
      {
        q: "Can I start today?",
        a: "Yes. You can start collecting voice feedback the moment you print your code. No complex integrations required."
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
