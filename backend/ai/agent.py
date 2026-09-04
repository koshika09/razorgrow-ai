from datetime import datetime, timezone
from uuid import uuid4

from backend.services.audit_service import get_actions, save_action
from backend.services.razorpay_service import RAZORPAY_KEY_ID, create_test_order


def _now(): return datetime.now(timezone.utc).isoformat()


def create_growth_action(product, category, title, recommendation, evidence, simulation):
    action = {"action_id": f"action_{uuid4().hex[:12]}", "type": "campaign", "product": product, "category": category,
              "title": title, "recommendation": recommendation, "evidence": evidence, "simulation": simulation,
              "status": "PENDING_APPROVAL", "created_at": _now(), "message": "Growth action is ready for merchant review."}
    save_action(action)
    return action


def find_action(action_id):
    return next((action for action in get_actions() if action["action_id"] == action_id), None)


def approve_growth_action(action_id):
    action = find_action(action_id)
    if action is None: return None, "not_found"
    if action["status"] != "PENDING_APPROVAL": return action, "invalid_state"
    action.update({"status": "APPROVED", "approved_at": _now(), "message": "Merchant approved the action. Creating a Test Mode order."})
    save_action(action)
    try:
        action["status"] = "EXECUTING"
        save_action(action)
        order = create_test_order(action["product"])
        action.update({"status": "AWAITING_PAYMENT", "executed_at": _now(), "razorpay_order_id": order["id"],
                       "razorpay_amount": order["amount"], "razorpay_currency": order["currency"],
                       "razorpay_status": order["status"], "razorpay_key_id": RAZORPAY_KEY_ID,
                       "message": "Test Mode order created. Awaiting checkout and server-side verification."})
    except Exception:
        action.update({"status": "EXECUTION_FAILED", "failed_at": _now(), "failure_reason": "Unable to create the Razorpay Test Mode order. Review configuration or retry."})
    save_action(action)
    return action, None


def mark_payment_verified(order_id, payment_id):
    action = next((item for item in get_actions() if item.get("razorpay_order_id") == order_id), None)
    if action is None: return None, "order_not_found"
    if action.get("status") != "AWAITING_PAYMENT": return action, "invalid_state"
    action.update({"status": "PAYMENT_VERIFIED", "payment_status": "PAYMENT VERIFIED", "razorpay_payment_id": payment_id,
                   "payment_verified_at": _now(), "message": "Test payment signature verified; the action is complete."})
    save_action(action)
    return action, None
