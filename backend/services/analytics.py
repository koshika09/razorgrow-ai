"""Merchant analytics built from the local transaction dataset."""

from collections import Counter
from pathlib import Path

import pandas as pd

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "transactions.csv"
REQUIRED_COLUMNS = {"transaction_id", "product", "category", "quantity", "price", "payment_method"}


class AnalyticsError(ValueError):
    pass


def _money(value):
    return round(float(value), 2)


def load_transactions():
    if not DATA_PATH.exists():
        raise AnalyticsError("Merchant transaction data is unavailable.")
    try:
        frame = pd.read_csv(DATA_PATH)
    except Exception as exc:
        raise AnalyticsError("Merchant transaction data could not be read.") from exc
    if REQUIRED_COLUMNS - set(frame.columns):
        raise AnalyticsError("Merchant data is missing required fields.")
    frame["quantity"] = pd.to_numeric(frame["quantity"], errors="coerce")
    frame["price"] = pd.to_numeric(frame["price"], errors="coerce")
    frame = frame.dropna(subset=["transaction_id", "product", "category", "quantity", "price"])
    frame = frame[(frame["quantity"] > 0) & (frame["price"] >= 0)].copy()
    if frame.empty:
        raise AnalyticsError("No valid merchant transactions are available for analysis.")
    frame["revenue"] = frame["quantity"] * frame["price"]
    return frame


def get_merchant_analytics():
    frame = load_transactions()
    product_revenue = frame.groupby("product")["revenue"].sum().sort_values(ascending=False)
    category_revenue = frame.groupby("category")["revenue"].sum().sort_values(ascending=False)
    product_units = frame.groupby("product")["quantity"].sum().sort_values(ascending=False)
    payment_methods = frame.groupby("payment_method").size().sort_values(ascending=False)
    total_revenue = _money(frame["revenue"].sum())
    total_transactions = int(frame["transaction_id"].nunique())
    product_categories = frame.groupby("product")["category"].agg(lambda values: values.mode().iat[0]).to_dict()
    revenue_by_date = {}
    if "date" in frame.columns:
        parsed_dates = pd.to_datetime(frame["date"], errors="coerce")
        dated = frame.assign(_date=parsed_dates).dropna(subset=["_date"])
        revenue_by_date = {date.strftime("%Y-%m-%d"): _money(value) for date, value in dated.groupby("_date")["revenue"].sum().sort_index().items()}
    return {
        "total_transactions": total_transactions, "total_items_sold": int(frame["quantity"].sum()),
        "average_transaction_value": _money(total_revenue / total_transactions), "total_revenue": total_revenue,
        "best_category": category_revenue.index[0], "best_product": product_revenue.index[0],
        "category_revenue": {key: _money(value) for key, value in category_revenue.items()},
        "product_revenue": {key: _money(value) for key, value in product_revenue.items()},
        "product_units": {key: int(value) for key, value in product_units.items()},
        "payment_method_distribution": {key: int(value) for key, value in payment_methods.items()},
        "product_categories": product_categories,
        "revenue_by_date": revenue_by_date,
        "data_quality": {"valid_rows": int(len(frame)), "has_transaction_baskets": bool((frame.groupby("transaction_id")["product"].nunique() > 1).any())},
    }


def get_cross_sell_opportunities():
    baskets = load_transactions().groupby("transaction_id")["product"].apply(lambda values: sorted(set(values)))
    pairs = Counter()
    for products in baskets:
        for index, product in enumerate(products):
            for partner in products[index + 1:]:
                pairs[(product, partner)] += 1
    return [{"product_a": first, "product_b": second, "co_occurrences": count,
             "reason": f"Purchased together in {count} transaction(s)."} for (first, second), count in pairs.most_common()]
