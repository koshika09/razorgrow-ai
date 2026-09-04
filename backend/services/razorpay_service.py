"""Small, server-only Razorpay Test Mode boundary."""
import os
import uuid
import razorpay
from dotenv import load_dotenv

load_dotenv()
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None


class PaymentConfigurationError(RuntimeError):
    pass


def _configured_client():
    if client is None:
        raise PaymentConfigurationError("Razorpay Test Mode is not configured. Add test credentials to .env.")
    return client


def create_test_order(product, amount=100):
    order = _configured_client().order.create(data={"amount": int(amount * 100), "currency": "INR",
        "receipt": f"rg_{uuid.uuid4().hex[:20]}", "notes": {"product": product, "source": "RazorGrow AI", "environment": "test"}})
    return order


def verify_test_payment(payload):
    _configured_client().utility.verify_payment_signature(payload)
