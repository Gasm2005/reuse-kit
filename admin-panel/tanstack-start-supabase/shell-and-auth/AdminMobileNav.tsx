import {
  LayoutDashboard,
  Palette,
  ShoppingBag,
  ClipboardList,
  Users,
  Newspaper,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";

const mobileTabs = [
  { label: "Home", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", to: "/admin/products", icon: ShoppingBag },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Leads", to: "/admin/leads", icon: Users },
  { label: "Artworks", to: "/admin/artworks", icon: Palette },
  { label: "Journal", to: "/admin/blog", icon: Newspaper },
];

export function AdminMobileNav() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return currentPath === to;
    return currentPath.startsWith(to);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <div className="flex items-center h-[60px] w-full overflow-x-auto no-scrollbar">
        {mobileTabs.map((tab) => {
          const active = isActive(tab.to, tab.exact);
          return (
            <a
              key={tab.to}
              href={tab.to}
              className={`flex flex-col items-center justify-center gap-0.5 shrink-0 min-w-[64px] h-full transition-colors px-2 ${
                active ? "text-forest" : "text-stone/50"
              }`}
            >
              <tab.icon size={18} />
              <span className="font-body text-[9px] font-medium whitespace-nowrap">
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
