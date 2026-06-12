import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoriesProps {
  categories: Category[];
}

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-gold uppercase tracking-wider mb-2">
            Browse by Type
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy">
            Award Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-14 w-14 rounded-full bg-navy/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <span className="text-2xl">🏆</span>
              </div>
              <span className="text-sm font-medium text-center leading-tight text-navy">
                {cat.name}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
