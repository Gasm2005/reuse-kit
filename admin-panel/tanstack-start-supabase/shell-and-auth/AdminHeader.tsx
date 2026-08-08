import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();

  const getPageTitle = () => {
    const path = router.state.location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path.startsWith("/admin/artworks")) return "Artworks";
    if (path.startsWith("/admin/categories")) return "Categories";
    if (path.startsWith("/admin/products")) return "Shop Products";
    if (path.startsWith("/admin/orders")) return "Orders";
    if (path.startsWith("/admin/reviews")) return "Reviews";
    if (path.startsWith("/admin/subscribers")) return "Subscribers";
    if (path.startsWith("/admin/shop-categories")) return "Shop Categories";
    if (path.startsWith("/admin/blog")) return "Journal";
    if (path.startsWith("/admin/media")) return "Media Library";
    if (path.startsWith("/admin/website-content")) return "Pages";
    if (path.startsWith("/admin/seo")) return "SEO Center";
    if (path.startsWith("/admin/leads")) return "Leads";
    return "Admin";
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="flex items-center justify-between h-[56px] px-4">
        {/* Page title */}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[18px] text-forest font-medium">{getPageTitle()}</h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50" />
            <input
              type="text"
              placeholder="Search..."
              className="h-[36px] pl-9 pr-3 rounded-xl border border-border bg-cream/50 font-body text-[13px] text-forest focus:outline-none focus:border-gold w-[200px] transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
