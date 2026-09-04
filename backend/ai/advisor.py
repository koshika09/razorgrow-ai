def generate_growth_advice(data, question):
    """
    Rule-based AI advisor.

    This version works without an external AI API.
    It analyzes the merchant's real business data
    and generates a recommendation.
    """

    question_lower = question.lower()

    best_product = data["best_product"]
    best_category = data["best_category"]

    product_revenue = data["product_revenue"]
    category_revenue = data["category_revenue"]

    total_revenue = data["total_revenue"]

    # --------------------------------
    # Product questions
    # --------------------------------

    if "product" in question_lower or "sell" in question_lower:

        recommendation = (
            f"You should focus on promoting {best_product}. "
            f"It is currently your highest-revenue product. "
            f"A good next step is to create a promotion or bundle "
            f"around {best_product}."
        )

        action = f"Create a promotion for {best_product}"

    # --------------------------------
    # Category questions
    # --------------------------------

    elif "category" in question_lower:

        recommendation = (
            f"Your strongest category is {best_category}. "
            f"This category generates the most revenue, so you should "
            f"consider increasing promotions and inventory in this category."
        )

        action = f"Increase promotion for {best_category}"

    # --------------------------------
    # Revenue / growth questions
    # --------------------------------

    elif (
        "revenue" in question_lower
        or "increase" in question_lower
        or "grow" in question_lower
        or "growth" in question_lower
    ):

        recommendation = (
            f"Your current revenue is ₹{total_revenue:,}. "
            f"The best growth opportunity is to promote {best_product}, "
            f"your top-performing product, and use {best_category} "
            f"as your main growth category."
        )

        action = f"Promote {best_product} to increase revenue"

    # --------------------------------
    # General questions
    # --------------------------------

    else:

        recommendation = (
            f"Based on your current business data, {best_product} "
            f"is your strongest product and {best_category} is your "
            f"strongest category. Start by promoting your best product "
            f"and increasing visibility for your strongest category."
        )

        action = f"Promote {best_product}"

    return {
        "recommendation": recommendation,
        "recommended_product": best_product,
        "recommended_category": best_category,
        "action": action
    }