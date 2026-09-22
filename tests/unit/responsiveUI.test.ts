import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

test('Responsive UI - defines mandatory breakpoint media queries in global.css', () => {
  const cssPath = path.resolve(__dirname, '../../frontend/src/styles/global.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  // Verify 1024px (tablet/laptop) breakdown exists
  assert.ok(cssContent.includes('@media (max-width: 1024px)'));

  // Verify 768px (mobile landscape/portrait) breakdown exists
  assert.ok(cssContent.includes('@media (max-width: 768px)'));

  // Verify 480px (extra small mobile) breakdown exists
  assert.ok(cssContent.includes('@media (max-width: 480px)'));

  // Verify mobile header class exists
  assert.ok(cssContent.includes('.mobile-header'));

  // Verify mobile drawer backdrop class exists
  assert.ok(cssContent.includes('.mobile-drawer-backdrop'));

  // Verify responsive table & diff container scroll utilities exist
  assert.ok(cssContent.includes('.table-responsive-container'));
  assert.ok(cssContent.includes('.diff-responsive-container'));
});

test('Responsive UI - implements responsive mobile navigation header and slide drawer in Sidebar.tsx', () => {
  const sidebarPath = path.resolve(__dirname, '../../frontend/src/components/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

  // Verify accessible hamburger button state & attributes
  assert.ok(sidebarContent.includes('mobile-menu-btn'));
  assert.ok(sidebarContent.includes('aria-expanded={mobileOpen}'));
  assert.ok(sidebarContent.includes('aria-controls="mobile-nav-drawer"'));

  // Verify Escape key accessibility listener
  assert.ok(sidebarContent.includes("e.key === 'Escape'"));

  // Verify mobile header brand & backdrop
  assert.ok(sidebarContent.includes('mobile-header'));
  assert.ok(sidebarContent.includes('mobile-drawer-backdrop'));

  // Verify drawer auto-close on link click
  assert.ok(sidebarContent.includes('setMobileOpen(false)'));
});

test('Responsive UI - guarantees touch target minimum size specifications in css', () => {
  const cssPath = path.resolve(__dirname, '../../frontend/src/styles/global.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  // Verify minimum 48px touch targets for mobile buttons
  assert.ok(cssContent.includes('min-height: 48px'));
});
