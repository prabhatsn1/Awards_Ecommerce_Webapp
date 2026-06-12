import { AdminProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <h1 className="text-2xl font-bold mb-8">Add New Product</h1>
      <AdminProductForm />
    </div>
  );
}
