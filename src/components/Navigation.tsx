"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PlusCircle, Home } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="app-header">
      <Link href="/" className="logo">
        🏫 <span className="title-gradient">Italiano A1</span>
      </Link>
      <nav className="nav-links">
        <Link 
          href="/" 
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link 
          href="/custom-cards" 
          className={`nav-link ${pathname === '/custom-cards' ? 'active' : ''}`}
        >
          <PlusCircle size={20} />
          <span>Dodaj własne</span>
        </Link>
      </nav>
    </header>
  );
}
