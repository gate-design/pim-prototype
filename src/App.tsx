import { useState } from "react";
import { SelectWorkspace } from "./components/SelectWorkspace";
import { MainShelf } from "./components/MainShelf";
import { ProductGenerator } from "./components/ProductGenerator";
import { ManageRates } from "./components/ManageRates";
import { ProductFamilies } from "./components/ProductFamilies";
import { TenantSettings } from "./components/TenantSettings";
import { LenderSettings } from "./components/LenderSettings";
import { ProductFamilyDetail } from "./components/ProductFamilyDetail";
import { ProductDetail } from "./components/ProductDetail";
import type { Workspace } from "./components/SelectWorkspace";
import type { ShelfProduct } from "./types";
import type { ProductFamily } from "./components/ProductFamilyDetail";
import { INITIAL_SHELF_PRODUCTS } from "./types";

type View =
  | "shelf"
  | "create-product"
  | "manage-rates"
  | "product-families"
  | "tenant-settings"
  | "lender-settings"
  | "product-family-detail"
  | "product-detail";

function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [products, setProducts] = useState<ShelfProduct[]>(INITIAL_SHELF_PRODUCTS);
  const [view, setView] = useState<View>("shelf");
  const [manageRatesProduct, setManageRatesProduct] = useState<ShelfProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShelfProduct | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<ProductFamily | null>(null);

  if (!activeWorkspace) {
    return <SelectWorkspace onLaunch={setActiveWorkspace} />;
  }

  if (view === "create-product") {
    return (
      <ProductGenerator
        workspace={activeWorkspace}
        onBackToShelf={() => setView("shelf")}
        onGenerated={(newProducts) => {
          setProducts((prev) => [...prev, ...newProducts]);
        }}
        onProductFamilies={() => setView("product-families")}
        onTenantSettings={() => setView("tenant-settings")}
        onLenderSettings={() => setView("lender-settings")}
        onLogout={() => setActiveWorkspace(null)}
      />
    );
  }

  if (view === "manage-rates" && manageRatesProduct) {
    return (
      <ManageRates
        workspace={activeWorkspace}
        product={manageRatesProduct}
        onBack={() => {
          setManageRatesProduct(null);
          setView("shelf");
        }}
        onSave={(productId, rate) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, rate } : p))
          );
          setManageRatesProduct(null);
          setView("shelf");
        }}
        onLogout={() => setActiveWorkspace(null)}
      />
    );
  }

  if (view === "tenant-settings") {
    return (
      <TenantSettings
        workspace={activeWorkspace}
        onBack={() => setView("shelf")}
        onSignOut={() => setActiveWorkspace(null)}
        onLenderSettings={() => setView("lender-settings")}
      />
    );
  }

  if (view === "lender-settings") {
    return (
      <LenderSettings
        workspace={activeWorkspace}
        onBack={() => setView("shelf")}
        onSignOut={() => setActiveWorkspace(null)}
      />
    );
  }

  if (view === "product-family-detail" && selectedFamily) {
    return (
      <ProductFamilyDetail
        workspace={activeWorkspace}
        family={selectedFamily}
        onBack={() => {
          setSelectedFamily(null);
          setView("product-families");
        }}
        onSignOut={() => setActiveWorkspace(null)}
        familiesCount={7}
      />
    );
  }

  if (view === "product-detail" && selectedProduct) {
    return (
      <ProductDetail
        workspace={activeWorkspace}
        product={selectedProduct}
        productsCount={products.length}
        onBack={() => {
          setSelectedProduct(null);
          setView("shelf");
        }}
        onSignOut={() => setActiveWorkspace(null)}
        onSaveChanges={(updated) => {
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setSelectedProduct(null);
          setView("shelf");
        }}
      />
    );
  }

  if (view === "product-families") {
    return (
      <ProductFamilies
        workspace={activeWorkspace}
        onBackToShelf={() => setView("shelf")}
        onLogout={() => setActiveWorkspace(null)}
        onTenantSettings={() => setView("tenant-settings")}
        onLenderSettings={() => setView("lender-settings")}
        onFamilyClick={(family) => {
          setSelectedFamily(family);
          setView("product-family-detail");
        }}
      />
    );
  }

  return (
    <MainShelf
      workspace={activeWorkspace}
      products={products}
      onLogout={() => setActiveWorkspace(null)}
      onCreateProduct={() => setView("create-product")}
      onManageRates={(product) => {
        setManageRatesProduct(product);
        setView("manage-rates");
      }}
      onProductFamilies={() => setView("product-families")}
      onTenantSettings={() => setView("tenant-settings")}
      onLenderSettings={() => setView("lender-settings")}
      onProductClick={(product) => {
        setSelectedProduct(product);
        setView("product-detail");
      }}
    />
  );
}

export default App;
