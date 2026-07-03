/**
 * (public) layout — wraps /iphone/*, /blog/*, /terminos
 * Navbar and Footer are injected by the root layout via NavbarWrapper / FooterWrapper.
 * This layout exists to set a shared rendering boundary for public pages.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
