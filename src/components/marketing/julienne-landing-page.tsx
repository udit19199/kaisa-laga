"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Sun } from "lucide-react";

const recipes = [
  {
    title: "Strawberry Bread With Strawberry Glaze",
    author: "@nurturednutrition_",
    image: "/julienne/strawberry-bread.png",
  },
  {
    title: "Banana Bread Coffee Cake With Brown Butter",
    author: "@___emilyrangel",
    image: "/julienne/banana-bread.png",
  },
  {
    title: "Classic Lemon & Sugar Crêpes",
    author: "Bbcgoodfood",
    image: "/julienne/crepes.png",
  },
  {
    title: "Earl Grey Orange Loaf",
    author: "@howaboutsaturday",
    image: "/julienne/orange-loaf.png",
  },
  {
    title: "Orange Loaf Cake",
    author: "@wineandwhinee",
    image: "/julienne/orange-cake.png",
  },
];

function JulienneMark() {
  return (
    <span aria-hidden="true" className="julienne-mark">
      <span className="julienne-mark-half julienne-mark-left" />
      <span className="julienne-mark-half julienne-mark-right" />
    </span>
  );
}

function AppleGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="julienne-apple">
      <path
        fill="currentColor"
        d="M16.71 12.32c-.03-3.08 2.52-4.58 2.64-4.65-1.45-2.12-3.7-2.41-4.49-2.43-1.89-.2-3.72 1.13-4.68 1.13-.98 0-2.46-1.11-4.06-1.08-2.06.03-3.99 1.23-5.05 3.08-2.18 3.77-.55 9.3 1.53 12.35 1.04 1.49 2.25 3.15 3.85 3.09 1.56-.06 2.14-.99 4.02-.99 1.86 0 2.41.99 4.03.95 1.68-.03 2.74-1.49 3.74-2.99 1.2-1.71 1.68-3.4 1.7-3.49-.04-.01-3.2-1.22-3.23-4.97ZM13.62 3.24A4.44 4.44 0 0 0 14.64 0a4.57 4.57 0 0 0-2.96 1.54 4.25 4.25 0 0 0-1.05 3.12 3.77 3.77 0 0 0 2.99-1.42Z"
      />
    </svg>
  );
}

function RecipeCard({
  recipe,
}: {
  recipe: (typeof recipes)[number];
}) {
  const isLinkedAuthor = recipe.author.startsWith("@");

  return (
    <article className="julienne-recipe-card">
      <div className="julienne-card-heading">
        <h2>{recipe.title}</h2>
        <button type="button" aria-label={`Save ${recipe.title}`}>
          <Bookmark />
        </button>
      </div>

      <Image
        src={recipe.image}
        alt=""
        width={260}
        height={260}
        className="julienne-recipe-image"
        priority
        unoptimized
      />

      <p className="julienne-byline">
        By{" "}
        {isLinkedAuthor ? (
          <a href="#recipes">{recipe.author}</a>
        ) : (
          <span>{recipe.author}</span>
        )}
      </p>
    </article>
  );
}

export function JulienneLandingPage() {
  return (
    <div className="julienne-page">
      <header className="julienne-header">
        <Link href="/" className="julienne-brand" aria-label="Julienne home">
          <JulienneMark />
          <span>Julienne</span>
        </Link>

        <nav className="julienne-nav" aria-label="Primary navigation">
          <a href="#recipes">Discover</a>
          <a href="#recipes">Cookbook</a>
          <a href="#recipes">Shop</a>
          <a href="#recipes">Instagram</a>
          <Link href="/sign-in">Log in</Link>
          <button type="button" className="julienne-theme-button" aria-label="Change theme">
            <Sun />
          </button>
        </nav>
      </header>

      <main>
        <section className="julienne-hero">
          <h1>
            <span>Discover &amp; save the latest trending recipes.</span>
            <span>
              Here&apos;s what others are making for <em>breakfast</em> today.
            </span>
          </h1>

          <div className="julienne-actions">
            <div className="julienne-qr">
              <Image
                src="/julienne/app-qr.png"
                alt="QR code to get the Julienne app"
                width={92}
                height={92}
                priority
                unoptimized
              />
            </div>

            <a href="#recipes" className="julienne-app-button">
              <AppleGlyph />
              <span>Get the app</span>
            </a>

            <a href="#recipes" className="julienne-google-button">
              <span className="julienne-google-g">G</span>
              <span>See more recipes</span>
            </a>
          </div>

          <p className="julienne-account">
            Already have an account? <Link href="/sign-in">Log in</Link>
          </p>
        </section>

        <section id="recipes" className="julienne-recipes" aria-label="Trending breakfast recipes">
          <div className="julienne-recipe-row">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.title} recipe={recipe} />
            ))}
          </div>
          <div className="julienne-recipe-row julienne-recipe-row-ghost" aria-hidden="true">
            {recipes.map((recipe) => (
              <div key={recipe.title} className="julienne-recipe-card" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
