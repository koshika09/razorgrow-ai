import pandas as pd

DATA_PATH = "backend/data/transactions.csv"

# Load transaction data
df = pd.read_csv(DATA_PATH)

print("\n===== RAZORGROW AI ANALYTICS =====")

# 1. Total revenue
total_revenue = (df["price"] * df["quantity"]).sum()

# 2. Total transactions
total_transactions = len(df)

# 3. Total items sold
total_items = df["quantity"].sum()

# 4. Average transaction value
average_transaction = total_revenue / total_transactions

# Display results
print(f"\nTotal Revenue: ₹{total_revenue}")
print(f"Total Transactions: {total_transactions}")
print(f"Total Items Sold: {total_items}")
print(f"Average Transaction Value: ₹{average_transaction:.2f}")

# 5. Revenue by category
category_revenue = (
    df.groupby("category")
    .apply(lambda x: (x["price"] * x["quantity"]).sum())
)

print("\n===== REVENUE BY CATEGORY =====")
print(category_revenue)

# 6. Best-selling category
best_category = category_revenue.idxmax()

print(f"\nBest Performing Category: {best_category}")

# 7. Revenue by product
product_revenue = (
    df.groupby("product")
    .apply(lambda x: (x["price"] * x["quantity"]).sum())
    .sort_values(ascending=False)
)

print("\n===== REVENUE BY PRODUCT =====")
print(product_revenue)

# 8. Best-selling product by revenue
best_product = product_revenue.idxmax()

print(f"\nBest Performing Product: {best_product}")

# 9. Generate business insight

if best_category == "Electronics":
    category_insight = (
        "Electronics is the strongest category. "
        "Consider increasing inventory and promotions in this category."
    )
else:
    category_insight = (
        f"{best_category} is the strongest category. "
        "Consider increasing inventory and promotions in this category."
    )

if best_product == "Headphones":
    product_insight = (
        "Headphones are the top revenue-generating product. "
        "Consider promoting headphones and maintaining sufficient stock."
    )
else:
    product_insight = (
        f"{best_product} is the top revenue-generating product. "
        "Consider promoting this product and maintaining sufficient stock."
    )

print("\n===== RAZORGROW AI INSIGHTS =====")
print(f"Category Insight: {category_insight}")
print(f"Product Insight: {product_insight}")