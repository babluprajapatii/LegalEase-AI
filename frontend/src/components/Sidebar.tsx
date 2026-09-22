'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  IconDashboard,
  IconDocument,
  IconUpload,
  IconCompare,
  IconHistory,
  IconSettings,
  IconMenu,
  IconClose,
} from './ui/Icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: '/documents', label: 'Documents', icon: IconDocument },
  { href: '/upload', label: 'Upload', icon: IconUpload },
  { href: '/compare', label: 'Compare', icon: IconCompare },
  { href: '/history', label: 'History', icon: IconHistory },
  { href: '/settings', label: 'Settings', icon: IconSettings },
];

/**
 * Responsive Sidebar & Mobile Navigation Header matching Figma UI/UX.
 * Provides desktop fixed 280px sidebar and mobile/tablet header with slide-over drawer menu.
 */
export default function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  // Close mobile drawer on Escape key or route change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Handled in auth context
    }
  };

  return (
    <>
      {/* Mobile / Tablet Header Bar (< 1024px) */}
      <header className="mobile-header" role="banner">
        <div className="mobile-header-brand">
          <div className="sidebar-logo" aria-hidden="true">
            <IconDocument size={18} />
          </div>
          <span className="sidebar-brand-name">LegalEase-AI</span>
        </div>

        <div className="mobile-header-actions">
          <Link href="/upload" className="mobile-header-upload-btn" aria-label="Upload document">
            <IconUpload size={18} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Primary Navigation Container (Desktop Sidebar & Mobile Drawer) */}
      <aside
        id="mobile-nav-drawer"
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">
            <IconDocument size={20} />
          </div>
          <span className="sidebar-brand-name">LegalEase-AI</span>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Upload CTA */}
        <Link
          href="/upload"
          className="sidebar-upload-btn"
          aria-label="Upload document"
          onClick={() => setMobileOpen(false)}
        >
          <IconUpload size={18} aria-hidden="true" />
          <span>Upload</span>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
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
    </>
  );
}
