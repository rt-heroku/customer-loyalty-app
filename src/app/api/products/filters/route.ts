import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    // Get categories
    const categoriesQuery = `
      SELECT 
        category,
        COUNT(*) as product_count
      FROM products
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY product_count DESC
    `;
    const categoriesResult = await query(categoriesQuery);

    // Get brands
    const brandsQuery = `
      SELECT 
        brand,
        COUNT(*) as product_count
      FROM products
      WHERE brand IS NOT NULL
      GROUP BY brand
      ORDER BY product_count DESC
    `;
    const brandsResult = await query(brandsQuery);

    // Get price range
    const priceRangeQuery = `
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products
      WHERE price IS NOT NULL
    `;
    const priceRangeResult = await query(priceRangeQuery);

    // Get stock status options
    const stockStatusQuery = `
      SELECT 
        stock_status,
        COUNT(*) as product_count
      FROM products
      WHERE stock_status IS NOT NULL
      GROUP BY stock_status
      ORDER BY product_count DESC
    `;
    const stockStatusResult = await query(stockStatusQuery);

    // Get rating options
    const ratingQuery = `
      SELECT 
        CASE 
          WHEN rating >= 4.5 THEN '4.5+'
          WHEN rating >= 4.0 THEN '4.0+'
          WHEN rating >= 3.5 THEN '3.5+'
          WHEN rating >= 3.0 THEN '3.0+'
          ELSE 'Any'
        END as rating_range,
        COUNT(*) as product_count
      FROM products
      WHERE rating IS NOT NULL
      GROUP BY 
        CASE 
          WHEN rating >= 4.5 THEN '4.5+'
          WHEN rating >= 4.0 THEN '4.0+'
          WHEN rating >= 3.5 THEN '3.5+'
          WHEN rating >= 3.0 THEN '3.0+'
          ELSE 'Any'
        END
      ORDER BY 
        CASE rating_range
          WHEN '4.5+' THEN 1
          WHEN '4.0+' THEN 2
          WHEN '3.5+' THEN 3
          WHEN '3.0+' THEN 4
          ELSE 5
        END
    `;
    const ratingResult = await query(ratingQuery);

    // Get popular tags
    const tagsQuery = `
      SELECT 
        unnest(tags) as tag,
        COUNT(*) as product_count
      FROM products
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      GROUP BY unnest(tags)
      ORDER BY product_count DESC
      LIMIT 20
    `;
    const tagsResult = await query(tagsQuery);

    // Get on-sale and new product counts
    const featureCountsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE is_on_sale = true) as on_sale_count,
        COUNT(*) FILTER (WHERE is_new = true) as new_count,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_count
      FROM products
    `;
    const featureCountsResult = await query(featureCountsQuery);

    const filters = {
      categories: categoriesResult.rows.map((row: any) => ({
        value: row.category,
        label: row.category,
        count: parseInt(row.product_count),
      })),
      brands: brandsResult.rows.map((row: any) => ({
        value: row.brand,
        label: row.brand,
        count: parseInt(row.product_count),
      })),
      priceRange: {
        min: priceRangeResult.rows[0]?.min_price
          ? parseFloat(priceRangeResult.rows[0].min_price)
          : 0,
        max: priceRangeResult.rows[0]?.max_price
          ? parseFloat(priceRangeResult.rows[0].max_price)
          : 1000,
      },
      stockStatus: stockStatusResult.rows.map((row: any) => ({
        value: row.stock_status,
        label: row.stock_status
          .replace('_', ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        count: parseInt(row.product_count),
      })),
      ratings: ratingResult.rows.map((row: any) => ({
        value:
          row.rating_range === 'Any'
            ? 0
            : parseFloat(row.rating_range.replace('+', '')),
        label: row.rating_range,
        count: parseInt(row.product_count),
      })),
      tags: tagsResult.rows.map((row: any) => ({
        value: row.tag,
        label: row.tag,
        count: parseInt(row.product_count),
      })),
      features: {
        onSale: parseInt(featureCountsResult.rows[0]?.on_sale_count || '0'),
        new: parseInt(featureCountsResult.rows[0]?.new_count || '0'),
        featured: parseInt(featureCountsResult.rows[0]?.featured_count || '0'),
      },
    };

    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
