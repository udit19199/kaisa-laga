"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Business",
    questions: [
      {
        q: "How is this different from Google Reviews?",
        a: "Google Reviews are public and usually show up after the damage is done. Auris gives customers an easier, private way to tell you what happened while you still have a chance to fix it."
      },
      {
        q: "Will customers actually use this?",
        a: "That is the whole point of the product. We are betting that speaking for a few seconds is much easier than filling out a form, especially right after the experience."
      },
      {
        q: "What does my business actually get?",
        a: "Auris turns those voice notes into clear themes, transcripts, and issues your team can act on instead of leaving you with vague ratings."
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
        a: "No. Auris is a private channel for the business. Nothing is automatically posted to Google or anywhere else."
      }
    ]
  },
  {
    category: "Operations",
    questions: [
      {
        q: "Do I need to train staff or change my workflow?",
        a: "No major workflow change. Customers use their own phones, and your team only needs to review the feedback Auris organizes for them."
      },
      {
        q: "Can I still hear the original voice note?",
        a: "Yes. The summaries make feedback easier to work with, but the original recording stays available when tone or context matters."
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
    <section className="bg-white px-4 py-24 sm:px-6 sm:py-32" id="faq">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
            The questions every owner asks first.
          </h2>
        </div>
        <div className="mt-16 space-y-12">
          {FAQS.map((group) => (
            <div key={group.category}>
              <h3 className="mb-4 text-xl font-semibold text-[var(--brand-ink)]">{group.category}</h3>
              <div className="space-y-4">
                {group.questions.map((faq, idx) => {
                  const id = `${group.category}-${idx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={faq.q} className="border-b border-gray-100 pb-4">
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="flex w-full items-start justify-between text-left text-lg font-medium text-gray-900 focus:outline-none"
                      >
                        <span>{faq.q}</span>
                        <span className="ml-6 flex h-7 items-center">
                          <svg
                            className={cn(
                              "h-6 w-6 transform transition-transform duration-200",
                              isOpen ? "rotate-180" : "rotate-0",
                            )}
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
