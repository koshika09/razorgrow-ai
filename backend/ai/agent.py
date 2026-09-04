from datetime import datetime
import os

from backend.services.razorpay_service import create_test_order
from backend.services.audit_service import (
    save_action,
    get_actions
)


def create_growth_action(product, category):
    """
    Create a proposed growth action.

    IMPORTANT:
    This does NOT create a Razorpay order.
    Human approval is required first.
    """

    existing_actions = get_actions()

    action = {
        "action_id": f"action_{len(existing_actions) + 1}",
        "type": "promotion",
        "product": product,
        "category": category,
        "status": "PENDING_APPROVAL",
        "created_at": datetime.now().isoformat(),
        "message": (
            f"Create a promotional campaign for {product} "
            f"in the {category} category."
        )
    }

    save_action(action)

    return action


def approve_growth_action(action_id):
    """
    Approve a growth action and create a
    Razorpay Test Mode order.

    The order is created ONLY after approval.
    """

    actions = get_actions()

    for action in actions:

        if action["action_id"] == action_id:

            if action["status"] != "PENDING_APPROVAL":
                return action

            try:
                order = create_test_order(
                    action["product"],
                    100
                )

                action["status"] = "APPROVED"
                action["approved_at"] = datetime.now().isoformat()

                action["razorpay_order_id"] = order["id"]
                action["razorpay_amount"] = order["amount"]
                action["razorpay_currency"] = order["currency"]
                action["razorpay_status"] = order["status"]
                action["razorpay_key_id"] = os.getenv(
                    "RAZORPAY_KEY_ID"
                )

                action["message"] = (
                    f"Growth action approved for {action['product']}. "
                    f"Razorpay Test Mode order created successfully."
                )

            except Exception as error:

                action["status"] = "EXECUTION_FAILED"
                action["failed_at"] = datetime.now().isoformat()
                action["error"] = str(error)

            save_action(action)

            return action

    return None


def get_audit_log():
    return get_actions()