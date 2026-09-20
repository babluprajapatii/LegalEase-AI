'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/documents', label: 'Documents', icon: '📄' },
  { href: '/upload', label: 'Upload', icon: '⬆' },
  { href: '/compare', label: 'Compare', icon: '⇅' },
  { href: '/history', label: 'History', icon: '🕐' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

/**
 * Left sidebar navigation matching Figma 03-dashboard design.
 * Shows logo, upload button, nav items, and user profile area.
 */
export default function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Error handled in auth context
    }
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          §
        </div>
        <span className="sidebar-brand-name">LegalEase-AI</span>
      </div>

      {/* Upload CTA */}
      <Link href="/upload" className="sidebar-upload-btn" aria-label="Upload document">
        <span aria-hidden="true">⬆</span> Upload
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${pathname === item.href || pathname?.startsWith(item.href + '/') ? 'active' : ''}`}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <span className="sidebar-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div
        className="sidebar-user"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={dropdownOpen}
        aria-label="User menu"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setDropdownOpen(!dropdownOpen);
          }
        }}
      >
        <div className="sidebar-user-avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-email">{displayEmail}</div>
        </div>
        <span className="sidebar-user-dropdown" aria-hidden="true">
          {dropdownOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="user-dropdown" role="menu">
          <button className="user-dropdown-item danger" onClick={handleSignOut} role="menuitem">
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
