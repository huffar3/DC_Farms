import { useState, useEffect } from "react";
import { InventoryGrid } from "./components/inventory-grid";
import { InventoryFilters } from "./components/inventory-filters";
import { EditModal } from "./components/edit-modal";
import { AuthModal } from "./components/auth-modal";
import { Package, Plus, LogIn, LogOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";

// Mock inventory data
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  image: string;
  reorderLevel: number;
}

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "Electronics",
    quantity: 45,
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    reorderLevel: 20,
  },
  {
    id: "2",
    name: "Smart Watch",
    category: "Electronics",
    quantity: 12,
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    reorderLevel: 15,
  },
  {
    id: "3",
    name: "Leather Backpack",
    category: "Accessories",
    quantity: 28,
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    reorderLevel: 10,
  },
  {
    id: "4",
    name: "Running Shoes",
    category: "Footwear",
    quantity: 0,
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    reorderLevel: 25,
  },
  {
    id: "5",
    name: "Coffee Maker",
    category: "Appliances",
    quantity: 34,
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop",
    reorderLevel: 15,
  },
  {
    id: "6",
    name: "Yoga Mat",
    category: "Sports",
    quantity: 67,
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
    reorderLevel: 30,
  },
  {
    id: "7",
    name: "Desk Lamp",
    category: "Home",
    quantity: 8,
    price: 45.99,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    reorderLevel: 12,
  },
  {
    id: "8",
    name: "Water Bottle",
    category: "Sports",
    quantity: 92,
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    reorderLevel: 50,
  },
  {
    id: "9",
    name: "Bluetooth Speaker",
    category: "Electronics",
    quantity: 3,
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    reorderLevel: 10,
  },
  {
    id: "10",
    name: "Sunglasses",
    category: "Accessories",
    quantity: 41,
    price: 159.99,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    reorderLevel: 20,
  },
  {
    id: "11",
    name: "Notebook Set",
    category: "Stationery",
    quantity: 125,
    price: 19.99,
    image:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop",
    reorderLevel: 60,
  },
  {
    id: "12",
    name: "Plant Pot",
    category: "Home",
    quantity: 15,
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop",
    reorderLevel: 20,
  },
];

export default function App() {
  const [inventory, setInventory] =
    useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
  );

  // Check for existing session on load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setIsAuthenticated(true);
        setUserEmail(data.session.user.email || "");
      }
    } catch (err) {
      console.error("Error checking session:", err);
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ) => {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data?.session) {
        setIsAuthenticated(true);
        setUserEmail(data.session.user.email || "");
        setShowAuthModal(false);
        setAuthError("");
      }
    } catch (err) {
      setAuthError("Failed to login. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail("");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Get unique categories
  const categories = ["all", "Baked Goods", "Meat", "Self Care"];

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      item.category === selectedCategory;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "out" && item.quantity === 0) ||
      (stockFilter === "low" &&
        item.quantity > 0 &&
        item.quantity <= item.reorderLevel) ||
      (stockFilter === "in" &&
        item.quantity > item.reorderLevel);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate statistics
  const totalItems = inventory.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const outOfStock = inventory.filter(
    (item) => item.quantity === 0,
  ).length;
  const lowStock = inventory.filter(
    (item) =>
      item.quantity > 0 && item.quantity <= item.reorderLevel,
  ).length;

  const handleAddNew = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setIsAddingNew(true);
    setEditingItem({
      id: Date.now().toString(),
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      reorderLevel: 10,
    });
  };

  const handleEdit = (item: InventoryItem) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setIsAddingNew(false);
    setEditingItem(item);
  };

  const handleDelete = (id: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (confirm("Are you sure you want to delete this item?")) {
      setInventory(inventory.filter((item) => item.id !== id));
    }
  };

  const handleSave = (updatedItem: InventoryItem) => {
    if (isAddingNew) {
      setInventory([...inventory, updatedItem]);
    } else {
      setInventory(
        inventory.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      );
    }
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1759756909952-ff503b51735e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5ueSUyMGZhcm1sYW5kJTIwY291bnRyeXNpZGV8ZW58MXx8fHwxNzY2NjMyNjc0fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-white/80"></div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-10 h-10 text-green-700" />
                <h1 className="text-5xl text-gray-900">D&C Farms</h1>
              </div>
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-600">
                      {userEmail}
                    </span>
                    <button
                      onClick={handleAddNew}
                      className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Owner Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-6">
              <p className="text-gray-600">Total Products</p>
              <p className="text-gray-900 mt-1">
                {inventory.length}
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-6">
              <p className="text-gray-600">Total Items</p>
              <p className="text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-6">
              <p className="text-gray-600">Low Stock</p>
              <p className="text-orange-600 mt-1">{lowStock}</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow p-6">
              <p className="text-gray-600">Out of Stock</p>
              <p className="text-red-600 mt-1">{outOfStock}</p>
            </div>
          </div>

          {/* Filters */}
          <InventoryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
          />

          {/* Inventory Grid */}
          <InventoryGrid
            items={filteredInventory}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAuthenticated={isAuthenticated}
          />

          {/* No results */}
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No items found matching your filters
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingItem && isAuthenticated && (
          <EditModal
            item={editingItem}
            isNew={isAddingNew}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            onLogin={handleLogin}
            onClose={() => {
              setShowAuthModal(false);
              setAuthError("");
            }}
            error={authError}
          />
        )}
      </div>
    </div>
  );
}