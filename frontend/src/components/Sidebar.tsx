'use client';

import { useState } from 'react';
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
 * Left sidebar navigation matching Figma UI/UX design.
 * Shows stroke-icon branding, upload CTA button, active route highlights, and user profile drawer.
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
      // Handled in auth context
    }
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          <IconDocument size={20} />
        </div>
        <span className="sidebar-brand-name">LegalEase-AI</span>
      </div>

      {/* Upload CTA */}
      <Link href="/upload" className="sidebar-upload-btn" aria-label="Upload document">
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
  );
}
