# ================================
# RAZORPAY TEST MODE SERVICE
# ================================

import os
import uuid
import razorpay
from dotenv import load_dotenv


# Load variables from .env
load_dotenv()


RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


# Create Razorpay client
client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


def create_test_order(product, amount):
    """
    Create a Razorpay Test Mode order.

    Amount is provided in INR.
    Razorpay expects the amount in paise.
    """

    amount_paise = int(amount * 100)

    # Create a unique receipt for every order
    receipt = f"rg_{uuid.uuid4().hex[:20]}"

    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": {
            "product": product,
            "source": "RazorGrow AI",
            "environment": "test"
        }
    }

    order = client.order.create(
        data=order_data
    )

    return order