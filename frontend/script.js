const $ = (id) => document.getElementById(id);
const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
let opportunities = [];
let selectedOpportunity = null;
let currentCampaign = null;

function showError(message) { $("notice").innerHTML = `<div class="notice">${message}</div>`; }
function showNotice(message) {
  const notice = $("notice");
  notice.innerHTML = `<div class="notice success">${message}</div>`;
  setTimeout(() => { if (notice.textContent.includes(message)) notice.textContent = ""; }, 3000);
}
async function api(path, options = {}) {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(body.detail || "Something went wrong. Please try again.");
  return body;
}
function bars(values, format = money) {
  const max = Math.max(...Object.values(values));
  return Object.entries(values).map(([name, value]) => `<div class="bar"><span>${name}</span><span>${format(value)}</span><i style="--width:${(value / max) * 100}%"></i></div>`).join("");
}

async function loadDashboard() {
  try {
    const data = await api("/analytics");
    $("revenue").textContent = money(data.total_revenue);
    $("transactions").textContent = data.total_transactions;
    $("units").textContent = data.total_items_sold;
    $("aov").textContent = money(data.average_transaction_value);
    $("best-product").textContent = data.best_product;
    $("best-category").textContent = data.best_category;
    $("best-product-evidence").textContent = `${data.best_product} generates ${money(data.product_revenue[data.best_product])}, the strongest product revenue.`;
    $("category-bars").innerHTML = bars(data.category_revenue);
    $("payment-mix").innerHTML = bars(data.payment_method_distribution, (value) => `${value} transactions`);
  } catch (error) { showError(`Unable to load merchant analytics. ${error.message}`); }
}

async function loadOpportunities() {
  try {
    const data = await api("/ai/opportunities");
    opportunities = data.opportunities;
    $("opportunity-list").innerHTML = opportunities.map((item) => `
      <article class="opportunity"><span class="tag">${item.type}</span><h3>${item.title}</h3>
      <p><b>Evidence:</b> ${item.evidence}</p><p>${item.recommendation}</p>
      <p class="confidence">${item.confidence} confidence · ${item.risk_level} risk</p>
      <button data-opportunity="${item.opportunity_id}">Simulate & propose →</button></article>`).join("");
    $("cross-sell").textContent = data.cross_sell_message || data.cross_sell.map((item) => `${item.product_a} + ${item.product_b}: ${item.reason}`).join(" ");
  } catch (error) { $("opportunity-list").innerHTML = `<p class="loading">Unable to load opportunities. ${error.message}</p>`; }
}

function renderProposal(item) {
  selectedOpportunity = item;
  currentCampaign = null;
  $("advice").classList.remove("empty");
  $("advice").innerHTML = `<h3>${item.title}</h3><p>${item.recommendation}</p>
    <div class="advice-grid"><div><small>Evidence</small><b>${item.evidence}</b></div>
    <div><small>Goal</small><b>${item.expected_goal}</b></div><div><small>Risk</small><b>${item.risk_level}</b></div></div>
    <button id="campaign">Generate campaign brief ✦</button>`;
}

async function simulateAndPropose(item, button) {
  if (!item) return showError("This opportunity is unavailable. Please refresh and try again.");
  button.disabled = true;
  const label = button.textContent;
  button.textContent = "Creating simulation…";
  renderProposal(item);
  $("copilot").scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    const action = await api("/agent/propose", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: item.recommended_product, category: item.recommended_category, title: item.title, recommendation: item.recommendation, evidence: item.evidence, campaign: currentCampaign })
    });
    $("advice").insertAdjacentHTML("beforeend", `<div class="sim"><b>Simulation / Estimate:</b> ${money(action.simulation.impact_low)}–${money(action.simulation.impact_high)} potential revenue impact.<br>${action.simulation.formula}</div><button data-approve="${action.action_id}">Approve this action</button>`);
    await loadAudit();
  } catch (error) { showError(error.message); }
  finally { button.disabled = false; button.textContent = label; }
}

$("ask").onclick = async () => {
  const question = $("question").value.trim();
  if (question.length < 2) return showError("Please enter a question of at least two characters.");
  $("ask").disabled = true;
  try { renderProposal(await api("/ai/advice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) })); }
  catch (error) { showError(error.message); }
  finally { $("ask").disabled = false; }
};

document.addEventListener("click", async (event) => {
  const opportunityId = event.target.dataset.opportunity;
  if (opportunityId) return simulateAndPropose(opportunities.find((item) => item.opportunity_id === opportunityId), event.target);
  if (event.target.id === "campaign") {
    if (!selectedOpportunity) return showError("Choose a growth opportunity first.");
    event.target.disabled = true;
    try {
      currentCampaign = await api("/ai/campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: selectedOpportunity.recommended_product }) });
      $("advice").insertAdjacentHTML("beforeend", `<div class="sim"><b>AI Campaign Brief · Proposal only</b><br><b>${currentCampaign.campaign_name}</b><br>${currentCampaign.promotional_message}<br><b>Offer:</b> ${currentCampaign.suggested_offer}<br><b>Duration:</b> ${currentCampaign.suggested_duration}<br>${currentCampaign.guardrail}</div>`);
    } catch (error) { showError(error.message); }
    finally { event.target.disabled = false; }
  }
  if (event.target.dataset.approve) {
    event.target.disabled = true;
    try {
      const action = await api("/agent/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action_id: event.target.dataset.approve }) });
      if (action.status === "AWAITING_PAYMENT") openCheckout(action); else showError(action.failure_reason || "The action could not be executed.");
      await loadAudit();
    } catch (error) { showError(error.message); event.target.disabled = false; }
  }
});

function openCheckout(action) {
  if (!window.Razorpay) return showError("Razorpay Checkout could not be loaded.");
  new Razorpay({ key: action.razorpay_key_id, amount: action.razorpay_amount, currency: action.razorpay_currency, name: "RazorGrow AI", description: "Test Mode — no real money charged", order_id: action.razorpay_order_id,
    handler: async (payment) => { try { await api("/agent/payment/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment) }); await loadAudit(); showNotice("✓ Payment verified server-side and recorded in the audit trail."); } catch (error) { showError(error.message); } } }).open();
}

async function loadAudit() {
  try {
    const status = $("status-filter").value;
    const data = await api(`/agent/audit${status ? `?status=${encodeURIComponent(status)}` : ""}`);
    $("audit").innerHTML = data.actions.length ? data.actions.map((action) => {
      const title = action.title || (action.type === "promotion" ? "Promotion campaign" : action.type || "Growth action");
      const timestamp = new Date(action.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
      return `<article class="audit-item"><div class="audit-summary"><div class="audit-title-row"><h3>${title}</h3><span class="badge ${action.status}">${action.status.replaceAll("_", " ")}</span></div><p class="audit-meta"><span>◉ ${action.product || "No product"}</span><span>▣ ${action.category || "No category"}</span><span>◷ ${timestamp}</span></p><p class="audit-message">${action.message}</p>${action.failure_reason ? `<p class="audit-failure">${action.failure_reason}</p>` : ""}</div></article>`;
    }).join("") : "<p class=\"loading\">No growth actions match this filter.</p>";
    updateNextStep(data.actions);
  } catch (error) { $("audit").innerHTML = `<p class="loading">Unable to load audit trail. ${error.message}</p>`; }
}

function updateNextStep(actions) {
  const pending = actions.find((action) => action.status === "PENDING_APPROVAL");
  const awaitingPayment = actions.find((action) => action.status === "AWAITING_PAYMENT");
  if (awaitingPayment) {
    $("next-step-title").textContent = `Complete Test Mode checkout for ${awaitingPayment.product}`;
    $("next-step-copy").textContent = "Your action is approved. Complete the Test Mode checkout to let RazorGrow verify it server-side.";
    $("next-step-link").textContent = "View activity →"; $("next-step-link").href = "#activity";
  } else if (pending) {
    $("next-step-title").textContent = `Review your proposed ${pending.product} action`;
    $("next-step-copy").textContent = "The AI created a draft using merchant data. Review its estimate, then approve only if it matches your business judgment.";
    $("next-step-link").textContent = "Review activity →"; $("next-step-link").href = "#activity";
  } else {
    $("next-step-title").textContent = "Choose a data-backed growth opportunity";
    $("next-step-copy").textContent = "Start with a recommendation, inspect the evidence, and create a safe draft when you are ready.";
    $("next-step-link").textContent = "Explore opportunities →"; $("next-step-link").href = "#opportunities";
  }
}

async function refreshDashboard() {
  const button = $("refresh"), original = button.textContent;
  button.disabled = true; button.textContent = "↻ Refreshing…"; $("notice").textContent = "";
  try { await Promise.all([loadDashboard(), loadOpportunities(), loadAudit()]); showNotice("✓ Dashboard refreshed with the latest merchant data."); }
  catch (error) { showError(`Unable to refresh dashboard. ${error.message}`); }
  finally { button.disabled = false; button.textContent = original; }
}
$("refresh").addEventListener("click", refreshDashboard);
$("status-filter").onchange = loadAudit;
refreshDashboard();
