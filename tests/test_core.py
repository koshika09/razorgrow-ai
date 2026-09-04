import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.ai.advisor import generate_growth_advice
from backend.main import app
from backend.services import audit_service
from backend.services.analytics import get_cross_sell_opportunities, get_merchant_analytics


class RazorGrowCoreTests(unittest.TestCase):
    def setUp(self):
        self.original_db = audit_service.DB_PATH
        self.temp_dir = tempfile.TemporaryDirectory()
        audit_service.DB_PATH = Path(self.temp_dir.name) / "audit.db"
        audit_service.initialize_database()

    def tearDown(self):
        audit_service.DB_PATH = self.original_db
        self.temp_dir.cleanup()

    def test_analytics_uses_real_dataset(self):
        data = get_merchant_analytics()
        self.assertEqual(data["total_revenue"], 30855.0)
        self.assertEqual(data["best_product"], "Headphones")
        self.assertFalse(data["data_quality"]["has_transaction_baskets"])
        self.assertEqual(get_cross_sell_opportunities(), [])

    def test_advisor_returns_evidence_and_goal(self):
        advice = generate_growth_advice(get_merchant_analytics(), "How can I increase average order value?")
        self.assertIn("evidence", advice)
        self.assertTrue(advice["expected_goal"])
        self.assertEqual(advice["recommended_product"], "Headphones")

    def test_action_approval_reaches_awaiting_payment(self):
        from backend.ai.agent import approve_growth_action, create_growth_action
        action = create_growth_action("Headphones", "Electronics", "Promote Headphones", "Test", "Evidence", {})
        with patch("backend.ai.agent.create_test_order", return_value={"id": "order_test", "amount": 10000, "currency": "INR", "status": "created"}):
            approved, error = approve_growth_action(action["action_id"])
        self.assertIsNone(error)
        self.assertEqual(approved["status"], "AWAITING_PAYMENT")
        self.assertEqual(approved["razorpay_order_id"], "order_test")

    def test_invalid_api_input_returns_validation_error(self):
        response = TestClient(app).post("/ai/advice", json={"question": ""})
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
