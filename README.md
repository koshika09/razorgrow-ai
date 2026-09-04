# RazorGrow AI

## AI-Powered Growth & Agentic Commerce

RazorGrow AI is an AI-powered merchant growth platform built for the Razorpay AI Builder Buildathon.

It analyzes merchant transaction data, identifies high-performing products and categories, recommends growth opportunities, and allows merchants to approve AI-generated growth actions.

The platform integrates Razorpay Test Mode to demonstrate a complete, explainable, and human-approved commerce flow.

---

## Key Features

- 📊 Merchant sales analytics from transaction data
- 🤖 AI-powered growth recommendations
- 🚀 AI-generated promotional actions
- 👤 Human approval before executing growth actions
- 💳 Razorpay Test Mode payment integration
- 🔐 Server-side payment signature verification
- 🛡️ Persistent agent audit trail
- ⚠️ Failure handling for unsuccessful actions
- 📈 Revenue and product performance insights

---

## System Architecture

```text
Merchant Transaction Data
          │
          ▼
   Analytics Engine
          │
          ▼
   AI Growth Advisor
          │
          ▼
   Growth Action Proposal
          │
          ▼
    Human Approval
          │
          ▼
 Razorpay Test Mode Order
          │
          ▼
   Test Payment Checkout
          │
          ▼
 Server-Side Verification
          │
          ▼
   Persistent Audit Trail
```

---

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, FastAPI
- **Data Processing:** Pandas
- **Database:** SQLite
- **Payments:** Razorpay Test Mode
- **AI Advisor:** Rule-based growth intelligence
- **Charts:** Chart.js

---

## Project Structure

```text
razorgrow-ai/
├── backend/
│   ├── ai/
│   │   ├── advisor.py
│   │   └── agent.py
│   ├── data/
│   │   └── transactions.csv
│   ├── routes/
│   │   ├── analytics.py
│   │   ├── ai.py
│   │   └── agent.py
│   ├── services/
│   │   ├── analytics.py
│   │   ├── audit_service.py
│   │   └── razorpay_service.py
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .env
├── .gitignore
└── README.md
```

---

## How to Run

### 1. Open the project

Open the `razorgrow-ai` project folder in VS Code.

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

Windows:

```bash
.venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file:

```text
OPENAI_API_KEY=your_key_here
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

**Security:** Never expose the Razorpay secret key in frontend code or commit the `.env` file to a public repository.

### 6. Start the application

```bash
uvicorn backend.main:app --reload
```

Open the application in your browser:

```text
http://127.0.0.1:8000
```

---

## Application Flow

### 1. Analyze Merchant Data

The platform analyzes transaction data to identify:

- Top-performing products
- Top-performing categories
- Revenue trends
- Average transaction value
- Product and category opportunities

### 2. Generate Growth Recommendation

The AI Growth Advisor analyzes the merchant's performance and recommends a growth opportunity.

Example:

```text
Promote Headphones to increase revenue.
```

### 3. Create Growth Action

The merchant can convert the recommendation into a proposed growth action.

The action starts with:

```text
PENDING_APPROVAL
```

### 4. Human Approval

The merchant must explicitly approve the action before any payment-related execution occurs.

This creates a human-in-the-loop safety boundary.

### 5. Razorpay Test Mode

After approval, RazorGrow AI creates a Razorpay Test Mode order.

No real money is involved.

### 6. Payment Verification

After the test payment, the Razorpay payment signature is verified on the server.

The system records:

- Razorpay Order ID
- Razorpay Payment ID
- Payment verification status
- Verification timestamp

### 7. Persistent Audit Trail

All growth actions and payment verification events are stored in SQLite.

The audit trail allows the merchant to see what the AI proposed, what was approved, and what happened during execution.

---

## Safety & Explainability

RazorGrow AI follows a human-approved execution model.

The AI does not directly execute a money-related action.

Instead:

```text
AI Recommendation
       ↓
Growth Action Proposal
       ↓
Human Approval
       ↓
Razorpay Test Mode Order
       ↓
Payment Verification
```

This makes the growth workflow explainable, bounded, and auditable.

---

## Test Mode

RazorGrow AI uses **Razorpay Test Mode** for demonstration.

Test Mode is used to simulate payment transactions without deducting real money.

The project should always use Razorpay Test Mode credentials during development and demonstration.

---

## Failure Handling

The platform handles unsuccessful execution attempts and records them in the audit trail.

Example statuses include:

```text
PENDING_APPROVAL
APPROVED
EXECUTION_FAILED
PAYMENT VERIFIED
```

Failed actions are visually distinguished in the audit trail so that successful and unsuccessful operations are easy to identify.

---

## Demo Flow

A complete demonstration can follow this sequence:

```text
Open RazorGrow AI
       ↓
View Merchant Analytics
       ↓
Ask AI Growth Advisor
       ↓
Review Recommendation
       ↓
Create Growth Action
       ↓
Approve Action
       ↓
Open Razorpay Test Checkout
       ↓
Complete Test Payment
       ↓
Verify Payment Signature
       ↓
View Persistent Audit Trail
       ↓
Refresh Page
       ↓
Verify Payment History Persists
```

---

## Project Goal

RazorGrow AI demonstrates how AI can help merchants identify growth opportunities while keeping important commerce actions:

- Explainable
- Human-approved
- Auditable
- Testable
- Secure
The project is designed around the **AI Growth & Agentic Commerce** use case for the Razorpay AI Builder Buildathon.


