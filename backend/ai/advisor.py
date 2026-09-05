"""Explainable, data-grounded merchant growth guidance."""


def generate_growth_advice(data, question=""):
    question = question.strip().lower()
    product, category = data["best_product"], data["best_category"]
    product_revenue, category_revenue = data["product_revenue"][product], data["category_revenue"][category]
    if any(term in question for term in ("category", "focus")):
        title = f"Expand {category} visibility"
        evidence = f"{category} generates ₹{category_revenue:,.0f}, the highest category revenue."
        recommendation, goal = f"Prioritize a focused promotion for {category}, led by {product}.", "Increase qualified demand for the strongest category."
    elif any(term in question for term in ("average", "aov", "bundle", "upsell", "cross-sell")):
        title = f"Lift order value around {product}"
        evidence = f"{product} leads revenue at ₹{product_revenue:,.0f}; average order value is ₹{data['average_transaction_value']:,.0f}."
        recommendation, goal = f"Test a bundle or add-on offer around {product}; validate basket data before naming a cross-sell pair.", "Increase average order value without unsupported assumptions."
    else:
        title = f"Promote {product}"
        evidence = f"{product} produces ₹{product_revenue:,.0f}, the highest product revenue in the dataset."
        recommendation, goal = f"Run a time-bounded promotion for {product} and monitor conversion before expanding spend.", "Grow revenue using demonstrated product demand."
    return {"title": title, "recommendation": recommendation, "evidence": evidence,
            "reason": "This recommendation uses current merchant revenue performance, not external assumptions.",
            "expected_goal": goal, "recommended_product": product, "recommended_category": category,
            "action": f"Create a campaign for {product}", "confidence": "High", "risk_level": "Low"}
