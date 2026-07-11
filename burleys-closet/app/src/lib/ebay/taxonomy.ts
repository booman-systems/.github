import { ebayFetch } from './client';
import { EBAY } from './config';

export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  path: string;
}

export async function suggestCategories(query: string): Promise<CategorySuggestion[]> {
  const json = await ebayFetch<{
    categorySuggestions?: {
      category: { categoryId: string; categoryName: string };
      categoryTreeNodeAncestors?: { categoryName: string }[];
    }[];
  }>(
    `/commerce/taxonomy/v1/category_tree/${EBAY.categoryTreeId}/get_category_suggestions?q=${encodeURIComponent(query)}`,
  );
  return (json.categorySuggestions ?? []).map((s) => ({
    categoryId: s.category.categoryId,
    categoryName: s.category.categoryName,
    path: [
      ...(s.categoryTreeNodeAncestors ?? []).map((a) => a.categoryName).reverse(),
      s.category.categoryName,
    ].join(' > '),
  }));
}

export interface AspectRequirement {
  name: string;
  required: boolean;
  values: string[];
}

export async function requiredAspects(categoryId: string): Promise<AspectRequirement[]> {
  const json = await ebayFetch<{
    aspects?: {
      localizedAspectName: string;
      aspectConstraint?: { aspectRequired?: boolean };
      aspectValues?: { localizedValue: string }[];
    }[];
  }>(
    `/commerce/taxonomy/v1/category_tree/${EBAY.categoryTreeId}/get_item_aspects_for_category?category_id=${categoryId}`,
  );
  return (json.aspects ?? []).map((a) => ({
    name: a.localizedAspectName,
    required: Boolean(a.aspectConstraint?.aspectRequired),
    values: (a.aspectValues ?? []).slice(0, 100).map((v) => v.localizedValue),
  }));
}
