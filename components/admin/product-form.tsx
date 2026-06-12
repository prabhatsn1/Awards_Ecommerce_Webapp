"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import type { Category } from "@/lib/types";

interface ProductFormProps {
  product?: ProductInput & { id: string };
}

const MATERIALS = ["glass", "crystal", "metal", "acrylic", "wood", "resin"];
const SIZES = ["small", "medium", "large", "extra-large"];

export function AdminProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema) as import('react-hook-form').Resolver<ProductInput>,
    defaultValues: product || {
      is_customisable: true,
      is_featured: false,
      is_active: true,
      stock_quantity: 100,
      images: [],
      materials: [],
      sizes: [],
    },
  });

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }: { data: Category[] | null }) => setCategories(data || []));
  }, [supabase]);

  const watchedName = watch("name");
  const watchedMaterials = watch("materials") || [];
  const watchedSizes = watch("sizes") || [];
  const watchedImages = watch("images") || [];

  // Auto-fill slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) {
      setValue("slug", slugify(e.target.value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    const urls: string[] = [];

    for (const file of files) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Invalid file", description: "Only images are allowed." });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max 5MB per image." });
        continue;
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { data, error } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images")
        .upload(fileName, file);

      if (error) {
        toast({ variant: "destructive", title: "Upload failed", description: error.message });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images")
        .getPublicUrl(data.path);

      urls.push(publicUrl);
    }

    setValue("images", [...watchedImages, ...urls]);
    setIsUploading(false);
  };

  const onSubmit = async (data: import('react-hook-form').FieldValues) => {
    const typedData = data as ProductInput;
    if (product) {
      const { error } = await supabase
        .from("products")
        .update(typedData)
        .eq("id", product.id);
      if (error) {
        toast({ variant: "destructive", title: "Update failed", description: error.message });
        return;
      }
      toast({ title: "Product updated" });
    } else {
      const { error } = await supabase.from("products").insert(typedData);
      if (error) {
        toast({ variant: "destructive", title: "Create failed", description: error.message });
        return;
      }
      toast({ title: "Product created" });
    }
    router.push("/admin/products");
    router.refresh();
  };

  const toggleArrayValue = (
    field: "materials" | "sizes",
    value: string,
    currentValues: string[]
  ) => {
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter((v) => v !== value));
    } else {
      setValue(field, [...currentValues, value]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={(e) => { register("name").onChange(e); handleNameChange(e); }}
                  className="mt-1"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...register("slug")} className="mt-1" />
                {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} rows={5} className="mt-1" />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Input id="short_description" {...register("short_description")} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {watchedImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Image ${i + 1}`} className="h-20 w-20 object-cover rounded-md" />
                    <button
                      type="button"
                      className="absolute inset-0 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      onClick={() => setValue("images", watchedImages.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <Label
                htmlFor="image-upload"
                className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isUploading ? "Uploading..." : "Click to upload images (max 5MB each)"}
                </span>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </Label>
              {errors.images && <p className="text-xs text-destructive">{errors.images.message as string}</p>}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title (max 60 chars)</Label>
                <Input id="meta_title" {...register("meta_title")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description (max 160 chars)</Label>
                <Textarea id="meta_description" {...register("meta_description")} rows={3} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={watch("category_id")}
                  onValueChange={(v) => setValue("category_id", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id.message}</p>}
              </div>
              <div>
                <Label htmlFor="base_price">Base Price (₹)</Label>
                <Input id="base_price" type="number" step="0.01" min="0" {...register("base_price")} className="mt-1" />
                {errors.base_price && <p className="text-xs text-destructive mt-1">{errors.base_price.message}</p>}
              </div>
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input id="stock_quantity" type="number" min="0" {...register("stock_quantity")} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Materials</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {MATERIALS.map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={watchedMaterials.includes(m)}
                    onCheckedChange={() => toggleArrayValue("materials", m, watchedMaterials)}
                  />
                  <span className="text-sm capitalize">{m}</span>
                </label>
              ))}
              {errors.materials && <p className="text-xs text-destructive">{errors.materials.message as string}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sizes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {SIZES.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={watchedSizes.includes(s)}
                    onCheckedChange={() => toggleArrayValue("sizes", s, watchedSizes)}
                  />
                  <span className="text-sm capitalize">{s.replace("-", " ")}</span>
                </label>
              ))}
              {errors.sizes && <p className="text-xs text-destructive">{errors.sizes.message as string}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { field: "is_active" as const, label: "Active (visible in shop)" },
                { field: "is_featured" as const, label: "Featured on homepage" },
                { field: "is_customisable" as const, label: "Customisable" },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={watch(field) as boolean}
                    onCheckedChange={(v) => setValue(field, v as boolean)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
