from fastapi import APIRouter
import pandas as pd

router = APIRouter()

DATA_PATH = "backend/data/transactions.csv"


@router.get("/analytics")
def get_analytics():

    df = pd.read_csv(DATA_PATH)

    # Basic metrics
    total_transactions = len(df)
    total_items_sold = int(df["quantity"].sum())
    average_transaction_value = round(
        (df["price"] * df["quantity"]).sum() / total_transactions, 2
    )

    # Revenue calculation
    df["revenue"] = df["price"] * df["quantity"]

    # Revenue by category
    category_revenue = (
        df.groupby("category")["revenue"]
        .sum()
        .to_dict()
    )

    # Revenue by product
    product_revenue = (
        df.groupby("product")["revenue"]
        .sum()
        .sort_values(ascending=False)
        .to_dict()
    )

    # Best performers
    best_category = max(
        category_revenue,
        key=category_revenue.get
    )

    best_product = max(
        product_revenue,
        key=product_revenue.get
    )

    # AI-style insights
    category_insight = (
        f"{best_category} is the strongest category. "
        f"Consider increasing inventory and promotions in this category."
    )

    product_insight = (
        f"{best_product} is the top revenue-generating product. "
        f"Consider promoting this product and maintaining sufficient stock."
    )

    return {
        "total_transactions": total_transactions,
        "total_items_sold": total_items_sold,
        "average_transaction_value": average_transaction_value,
        "best_category": best_category,
        "best_product": best_product,
        "category_revenue": category_revenue,
        "product_revenue": product_revenue,
        "total_revenue": int(df["revenue"].sum()),
        "category_insight": category_insight,
        "product_insight": product_insight
    }