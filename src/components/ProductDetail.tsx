import type { Workspace } from "./SelectWorkspace";
import type { ShelfProduct } from "../types";
import { ProductGenerator } from "./ProductGenerator";

export function ProductDetail({
  workspace,
  product,
  productsCount,
  familiesCount = 0,
  onBack,
  onSignOut,
  onSaveChanges,
}: {
  workspace: Workspace;
  product: ShelfProduct;
  productsCount: number;
  familiesCount?: number;
  onBack: () => void;
  onSignOut: () => void;
  onSaveChanges?: (product: ShelfProduct) => void;
}) {
  return (
    <ProductGenerator
      workspace={workspace}
      initialProduct={product}
      shelfCount={productsCount}
      familiesCount={familiesCount}
      onBackToShelf={onBack}
      onSaveChanges={onSaveChanges}
      onGenerated={() => {}}
      onLogout={onSignOut}
    />
  );
}
