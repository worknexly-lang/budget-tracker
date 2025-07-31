import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Home,
  Car,
  Ticket,
  Zap,
  ShoppingBag,
  Utensils,
  Plane,
  Receipt,
  CircleHelp,
  Landmark,
} from "lucide-react";
import type { Category } from "@/types";

export const categoryIcons: Record<Category, LucideIcon> = {
  Groceries: ShoppingCart,
  Rent: Home,
  Transport: Car,
  Entertainment: Ticket,
  Utilities: Zap,
  Shopping: ShoppingBag,
  Food: Utensils,
  Travel: Plane,
  Bills: Receipt,
  Income: Landmark,
  Other: CircleHelp,
};
