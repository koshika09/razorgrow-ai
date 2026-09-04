from fastapi import APIRouter
from httpx2 import request
from pydantic import BaseModel
from datetime import datetime

from backend.ai.agent import (
    create_growth_action,
    approve_growth_action,
    get_audit_log
)

router = APIRouter()


class GrowthActionRequest(BaseModel):
    product: str
    category: str


class ApprovalRequest(BaseModel):
    action_id: str


@router.post("/agent/propose")
def propose_action(request: GrowthActionRequest):

    action = create_growth_action(
        request.product,
        request.category
    )

    return action


@router.post("/agent/approve")
def approve_action(request: ApprovalRequest):

    action = approve_growth_action(
        request.action_id
    )

    if action is None:
        return {
            "error": "Action not found"
        }

    return action


@router.get("/agent/audit")
def audit_log():

    return {
        "actions": get_audit_log()
    }




# ================================
# RAZORPAY PAYMENT VERIFICATION
# ================================

from backend.services.razorpay_service import client
from backend.services.audit_service import save_action


class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


@router.post("/agent/payment/verify")
def verify_payment(request: PaymentVerificationRequest):

    try:

        client.utility.verify_payment_signature({
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_order_id": request.razorpay_order_id,
            "razorpay_signature": request.razorpay_signature
        })

        for action in get_audit_log():

            if action.get("razorpay_order_id") == request.razorpay_order_id:

                action["payment_status"] = "PAYMENT VERIFIED"
                action["razorpay_payment_id"] = request.razorpay_payment_id
                action["payment_verified_at"] = datetime.now().isoformat()

                action["message"] = (
                    f"Growth action approved and payment verified "
                        f"for {action['product']}."

        )
        save_action(action)

                

        return {
            "success": True,
            "status": "PAYMENT VERIFIED",
            "message": "Razorpay payment signature verified successfully.",
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_order_id": request.razorpay_order_id
        }

    except Exception as error:

        return {
            "status": "PAYMENT_VERIFICATION_FAILED",
            "message": "Payment signature verification failed.",
            "error": str(error)
        }