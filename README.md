# RazorGrow AI

## AI-powered growth operating system for merchants

RazorGrow AI turns transaction data into an explainable, safe next action for merchants. It was built for the Razorpay AI Builder Internship 2026 Buildathon under **AI Growth & Agentic Commerce**.

> AI recommends. The merchant decides. The system executes only within approved Test Mode boundaries.

## Features

- Real-data analytics: revenue, transactions, units, AOV, product/category performance, and payment mix.
- Explainable rule-based AI with evidence, goal, confidence, and risk level; no OpenAI credits are required.
- AI campaign briefs with target product/category, audience idea, message, offer guardrails, duration, and an explicit merchant-approval requirement.
- Best-seller, AOV, and low-performing-product opportunities.
- Honest cross-sell intelligence: it only reports pairs supported by multi-product basket data.
- Transparent **Simulation / Estimate** before approval: 3–8% of target-product revenue, never presented as a forecast.
- Human-controlled state flow: `PENDING_APPROVAL → APPROVED → EXECUTING → AWAITING_PAYMENT → PAYMENT_VERIFIED`, with `EXECUTION_FAILED` fallback.
- Server-side Razorpay Test Mode order creation and signature verification.
- Persistent SQLite audit activity with status filters and clear failures.

## Architecture

```text
transactions.csv → validated analytics → explainable AI → opportunity / simulation
merchant review → Razorpay Test Mode order → server verification → SQLite audit trail
```

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: FastAPI, Pydantic, Pandas
- Persistence: SQLite
- Payments: Razorpay Test Mode

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

Create a local `.env` (never commit it):

```text
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
OPENAI_API_KEY=optional
```

Use Test Mode credentials only; no real money is charged.

## Demo flow

1. Inspect the merchant snapshot.
2. Review evidence-backed AI opportunities.
3. Ask the copilot or select an opportunity.
4. View the simulation estimate and formula.
5. Explicitly approve the action.
6. Complete Razorpay Test Checkout.
7. See the server-verified result in the audit trail.

## Safety

- Razorpay secret keys stay server-side.
- Products/categories are validated against merchant data.
- A payment must match a known action in `AWAITING_PAYMENT` state before completion is recorded.
- Raw provider errors are not sent to the browser.
- `.env` and SQLite databases are Git-ignored.

## Tests

```bash
python -m unittest discover -s tests -v
```

The suite covers analytics, AI evidence, approval flow, and invalid API input.
