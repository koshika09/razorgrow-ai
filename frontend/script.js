// ================================
// RAZORGROW AI - FRONTEND
// ================================


// ================================
// GLOBAL VARIABLES
// ================================

let categoryChart;
let categoryDoughnut;
let productChart;


// ================================
// CURRENCY FORMATTER
// ================================

function formatCurrency(value) {

    return "₹" + Number(value).toLocaleString("en-IN");
}


// ================================
// LOAD ANALYTICS
// ================================

async function loadAnalytics() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/analytics"
        );

        if (!response.ok) {
            throw new Error("Failed to load analytics");
        }

        const data = await response.json();


        // ================================
        // DASHBOARD KPI VALUES
        // ================================

        const totalTransactions =
            document.getElementById("totalTransactions");

        if (totalTransactions) {
            totalTransactions.textContent =
                data.total_transactions;
        }


        const totalItems =
            document.getElementById("totalItems");

        if (totalItems) {
            totalItems.textContent =
                data.total_items_sold;
        }


        const totalRevenue =
            document.getElementById("totalRevenue");

        if (totalRevenue) {
            totalRevenue.textContent =
                formatCurrency(data.total_revenue);
        }


        const averageTransaction =
            document.getElementById("averageTransaction");

        if (averageTransaction) {
            averageTransaction.textContent =
                formatCurrency(data.average_transaction_value);
        }


        // ================================
        // BEST PERFORMERS
        // ================================

        const bestCategory =
            document.getElementById("bestCategory");

        if (bestCategory) {
            bestCategory.textContent =
                data.best_category;
        }


        const bestProduct =
            document.getElementById("bestProduct");

        if (bestProduct) {
            bestProduct.textContent =
                data.best_product;
        }


        // ================================
        // REVENUE BY CATEGORY
        // ================================

        const categoryRevenue =
            document.getElementById("categoryRevenue");

        if (categoryRevenue) {

            categoryRevenue.innerHTML = "";

            const categories =
                Object.entries(data.category_revenue);

            categories.forEach(
                ([category, revenue]) => {

                    const item =
                        document.createElement("div");

                    item.className =
                        "revenue-item";

                    item.innerHTML = `
                        <span class="revenue-name">
                            ${category}
                        </span>

                        <span class="revenue-value">
                            ${formatCurrency(revenue)}
                        </span>
                    `;

                    categoryRevenue.appendChild(item);
                }
            );
        }


        // ================================
        // REVENUE BY PRODUCT
        // ================================

        const productRevenue =
            document.getElementById("productRevenue");

        if (productRevenue) {

            productRevenue.innerHTML = "";

            const products =
                Object.entries(data.product_revenue);

            products.sort(
                (a, b) => b[1] - a[1]
            );

            products.forEach(
                ([product, revenue]) => {

                    const item =
                        document.createElement("div");

                    item.className =
                        "revenue-item";

                    item.innerHTML = `
                        <span class="revenue-name">
                            ${product}
                        </span>

                        <span class="revenue-value">
                            ${formatCurrency(revenue)}
                        </span>
                    `;

                    productRevenue.appendChild(item);
                }
            );
        }


        // ================================
        // AI INSIGHTS
        // ================================

        const insightBestCategory =
            document.getElementById(
                "insightBestCategory"
            );

        if (insightBestCategory) {

            insightBestCategory.textContent =
                data.best_category;
        }


        const insightBestProduct =
            document.getElementById(
                "insightBestProduct"
            );

        if (insightBestProduct) {

            insightBestProduct.textContent =
                data.best_product;
        }


        const categoryInsight =
            document.getElementById(
                "categoryInsight"
            );

        if (categoryInsight) {

            categoryInsight.textContent =
                data.category_insight;
        }


        const productInsight =
            document.getElementById(
                "productInsight"
            );

        if (productInsight) {

            productInsight.textContent =
                data.product_insight;
        }


        // ================================
        // CREATE CHARTS
        // ================================

        createAnalyticsCharts(data);


        // ================================
        // LOAD PRODUCTS
        // ================================

        loadProducts(data);


    } catch (error) {

        console.error(
            "Analytics Error:",
            error
        );

    }
}


// ================================
// ANALYTICS CHARTS
// ================================

function createAnalyticsCharts(data) {


    // Destroy previous charts

    if (categoryChart) {
        categoryChart.destroy();
    }

    if (categoryDoughnut) {
        categoryDoughnut.destroy();
    }

    if (productChart) {
        productChart.destroy();
    }


    // ================================
    // CATEGORY DATA
    // ================================

    const categoryNames =
        Object.keys(
            data.category_revenue
        );

    const categoryValues =
        Object.values(
            data.category_revenue
        );


    // ================================
    // CATEGORY BAR CHART
    // ================================

    const categoryCanvas =
        document.getElementById(
            "categoryChart"
        );

    if (categoryCanvas) {

        categoryChart =
            new Chart(
                categoryCanvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            categoryNames,

                        datasets: [

                            {
                                label:
                                    "Revenue (₹)",

                                data:
                                    categoryValues
                            }

                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {
                                display: false
                            }

                        },

                        scales: {

                            y: {
                                beginAtZero: true
                            }

                        }
                    }
                }
            );
    }


    // ================================
    // CATEGORY DOUGHNUT CHART
    // ================================

    const doughnutCanvas =
        document.getElementById(
            "categoryDoughnut"
        );

    if (doughnutCanvas) {

        categoryDoughnut =
            new Chart(
                doughnutCanvas,
                {
                    type: "doughnut",

                    data: {

                        labels:
                            categoryNames,

                        datasets: [

                            {
                                data:
                                    categoryValues
                            }

                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {
                                position: "bottom"
                            }

                        }
                    }
                }
            );
    }


    // ================================
    // PRODUCT DATA
    // ================================

    const productNames =
        Object.keys(
            data.product_revenue
        );

    const productValues =
        Object.values(
            data.product_revenue
        );


    // ================================
    // PRODUCT BAR CHART
    // ================================

    const productCanvas =
        document.getElementById(
            "productChart"
        );

    if (productCanvas) {

        productChart =
            new Chart(
                productCanvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            productNames,

                        datasets: [

                            {
                                label:
                                    "Revenue (₹)",

                                data:
                                    productValues
                            }

                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        indexAxis: "y",

                        scales: {

                            x: {
                                beginAtZero: true
                            }

                        }
                    }
                }
            );
    }
}


// ================================
// PRODUCTS PAGE
// ================================

function loadProducts(data) {

    const products =
        Object.entries(
            data.product_revenue
        );


    // Sort products by revenue

    products.sort(
        (a, b) => b[1] - a[1]
    );


    const productsList =
        document.getElementById(
            "productsList"
        );


    if (productsList) {

        productsList.innerHTML = "";


        products.forEach(
            ([product, revenue], index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "revenue-item";

                item.innerHTML = `
                    <span class="revenue-name">
                        ${index + 1}. ${product}
                    </span>

                    <span class="revenue-value">
                        ${formatCurrency(revenue)}
                    </span>
                `;

                productsList.appendChild(item);
            }
        );
    }


    // ================================
    // BEST / WORST PRODUCT
    // ================================

    if (products.length > 0) {

        const bestProduct =
            document.getElementById(
                "productsBestProduct"
            );

        if (bestProduct) {

            bestProduct.textContent =
                products[0][0];
        }


        const worstProduct =
            document.getElementById(
                "worstProduct"
            );

        if (worstProduct) {

            worstProduct.textContent =
                products[
                    products.length - 1
                ][0];
        }
    }
}


// ================================
// AI ADVISOR
// ================================

const askAiBtn =
    document.getElementById(
        "askAiBtn"
    );


if (askAiBtn) {

    askAiBtn.addEventListener(
        "click",
        async function () {


            const question =
                document.getElementById(
                    "aiQuestion"
                ).value.trim();


            const responseBox =
                document.getElementById(
                    "aiResponse"
                );


            if (!question) {

                responseBox.textContent =
                    "Please enter a question first.";

                return;
            }


            responseBox.textContent =
                "🤔 RazorGrow AI is thinking...";


            askAiBtn.disabled =
                true;

            askAiBtn.textContent =
                "Thinking...";


            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/ai/advice",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                question:
                                    question
                            })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "AI request failed"
                    );
                }


                const data =
                    await response.json();


                responseBox.innerHTML = `

                    <div class="ai-result">

                        <div class="ai-result-main">

                            <strong>
                                🤖 Recommendation
                            </strong>

                            <p>
                                ${data.recommendation}
                            </p>

                        </div>


                        <div class="ai-result-details">

                            <div>

                                <span>
                                    🎯 Recommended Product
                                </span>

                                <strong>
                                    ${data.recommended_product}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    📂 Recommended Category
                                </span>

                                <strong>
                                    ${data.recommended_category}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    ⚡ Suggested Action
                                </span>

                                <strong>
                                    ${data.action}
                                </strong>

                            </div>

                        </div>


                        <button
                            class="create-action-btn"
                            id="createGrowthActionBtn"
                        >
                            🚀 Create Growth Action
                        </button>


                        <div
                            id="agentActionResponse"
                            class="agent-action-response"
                        ></div>

                    </div>

                `;

            } catch (error) {

                console.error(
                    "AI Error:",
                    error
                );


                responseBox.textContent =
                    "Unable to get AI advice. Please make sure the backend is running.";

            } finally {

                askAiBtn.disabled =
                    false;

                askAiBtn.textContent =
                    "Ask AI";
            }

        }
    );
}


// ================================
// GROWTH ACTION
// ================================

document.addEventListener(
    "click",
    function (event) {


        // Only respond to our button

        if (
            event.target.id !==
            "createGrowthActionBtn"
        ) {

            return;
        }


        const responseBox =
            document.getElementById(
                "agentActionResponse"
            );


        // Find recommended product

        const productElement =
            document.querySelector(
                ".ai-result-details > div:first-child strong"
            );


        // Find recommended category

        const categoryElement =
            document.querySelector(
                ".ai-result-details > div:nth-child(2) strong"
            );


        if (
            !productElement ||
            !categoryElement
        ) {

            responseBox.textContent =
                "Unable to find the AI recommendation.";

            return;
        }


        const productName =
            productElement.textContent.trim();


        const categoryName =
            categoryElement.textContent.trim();


        // Disable button while creating

        event.target.disabled =
            true;

        event.target.textContent =
            "Creating...";


        // ================================
        // CALL AGENT
        // ================================

        fetch(
            "http://127.0.0.1:8000/agent/propose",
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    product:
                        productName,

                    category:
                        categoryName

                })
            }
        )


        .then(
            response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to create action"
                    );
                }

                return response.json();
            }
        )


        .then(
            data => {

                responseBox.innerHTML = `

                    <div class="agent-success">

                        <strong>
                            ✅ Growth Action Created
                        </strong>

                        <p>
                            ${data.message}
                        </p>

                        <p>
                            Status:
                            <strong>
                                ${data.status}
                            </strong>
                        </p>

                        <p>
                            Action ID:
                            <strong>
                                ${data.action_id}
                            </strong>
                        </p>

                        <button
                            class="approve-action-btn"
                            data-action-id="${data.action_id}"
                        >
                            ✅ Approve Action
                        </button>
                    </div>

                `;


                event.target.textContent =
                    "✅ Action Created";
            }
        )


        .catch(
            error => {

                console.error(
                    "Agent Error:",
                    error
                );


                responseBox.textContent =
                    "Unable to create growth action.";


                event.target.disabled =
                    false;


                event.target.textContent =
                    "🚀 Create Growth Action";
            }
        );

    }
);
// ================================
// APPROVE GROWTH ACTION
// ================================

document.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "approve-action-btn"
            )
        ) {
            return;
        }

        const button = event.target;

        const actionId =
            button.dataset.actionId;

        const responseBox =
            document.getElementById(
                "agentActionResponse"
            );

        if (!actionId) {
            responseBox.textContent =
                "Action ID not found.";
            return;
        }

        button.disabled = true;
        button.textContent = "Approving...";

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/agent/approve",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        action_id: actionId
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Approval request failed"
                );
            }

            const data =
                await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            responseBox.innerHTML = `

                <div class="agent-success">

                    <strong>
                        ✅ Growth Action Approved
                    </strong>

                    <p>
                        The AI-recommended growth action
                        has been approved successfully.
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${data.status}
                        </strong>
                    </p>

                    <p>
                        Action ID:
                        <strong>
                            ${data.action_id}
                        </strong>
                    </p>
                    <p>
                        Razorpay Order ID:
                        <strong>
                            ${data.razorpay_order_id}
                        </strong>
                    </p>

                    <p>
                        Test Amount:
                        <strong>
                            ₹${data.razorpay_amount / 100}
                        </strong>
                    </p>
                    <button class="pay-razorpay-btn"
                        onclick='openRazorpayCheckout(${JSON.stringify(data)})'>
                  
                        💳 Pay with Razorpay
                    </button>

                    <p>
                        Approved at:
                        <strong>
                            ${data.approved_at}
                        </strong>
                    </p>

                </div>

            `;

            button.textContent =
                "✅ Action Approved";

        } catch (error) {

            console.error(
                "Approval Error:",
                error
            );

            responseBox.textContent =
                "Unable to approve the growth action.";

            button.disabled = false;

            button.textContent =
                "✅ Approve Action";
        }

    }
);

// ================================
// REFRESH BUTTON
// ================================

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );


if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        function () {

            loadAnalytics();

        }
    );
}


// ================================
// NAVIGATION
// ================================

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const pageSections =
    document.querySelectorAll(
        ".page-section"
    );


navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const sectionId =
                    this.dataset.section;


                // Remove active state

                navLinks.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                // Add active state

                this.classList.add(
                    "active"
                );


                // Hide all sections

                pageSections.forEach(
                    section => {

                        section.classList.remove(
                            "active-section"
                        );

                    }
                );


                // Show selected section

                const selectedSection =
                    document.getElementById(
                        sectionId
                    );


                if (selectedSection) {

                    selectedSection.classList.add(
                        "active-section"
                    );

                }

            }
        );

    }
);


// ================================
// LOAD AUDIT TRAIL
// ================================

async function loadAuditLog() {

    const auditLog =
        document.getElementById("auditLog");

    if (!auditLog) {
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/agent/audit"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load audit log"
            );
        }

        const data =
            await response.json();

        const actions =
            data.actions || [];


        // No actions yet

        if (actions.length === 0) {

            auditLog.innerHTML = `
                <p>
                    No agent activity yet.
                </p>
            `;

            return;
        }


        // Display newest action first

        const reversedActions =
            [...actions].reverse();


        auditLog.innerHTML = "";


        reversedActions.forEach(
            action => {

                const item =
                    document.createElement("div");

                item.className =
                    "audit-item";


                let statusIcon = "⏳";

                if (
                    action.status ===
                    "APPROVED"
                ) {
                    statusIcon = "✅";
                }


                item.innerHTML = `

                    <div class="audit-item-header">

                        <strong>
                            ${statusIcon}
                            ${action.type}
                        </strong>

                        <span class="status-badge ${action.status.toLowerCase().replaceAll("_",   "-")}">
                            ${action.status}
                        </span>

                    </div>


                    <p>
                        Product:
                        <strong>
                            ${action.product}
                        </strong>
                    </p>


                    <p>
                        Category:
                        <strong>
                            ${action.category}
                        </strong>
                    </p>


                    <p>
                        Action ID:
                        <strong>
                            ${action.action_id}
                        </strong>
                    </p>
                        ${action.razorpay_order_id
                            ? `
                            <p>
                                Razorpay Order ID:
                                <strong>${action.razorpay_order_id}</strong>
                            </p>
                            `
                            : ""
                        }


                    <small>
                        Created:
                        ${action.created_at}
                    </small>

                    ${
                        action.approved_at
                        ? `
                            <small>
                                Approved:
                                ${action.approved_at}
                            </small>
                        `
                        : ""
                    }
                    ${
                        action.payment_status
                        ? `
                        <p>
                            Payment Status:
                            <strong>${action.payment_status}</strong>
                        </p>

                        <p>
                            Payment ID:
                            <strong>${action.razorpay_payment_id}</strong>
                        </p>

                        <small>
                            Payment Verified:
                            ${action.payment_verified_at}
                        </small>
                    `
                    : ""
                    }
                `;


                auditLog.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Audit Log Error:",
            error
        );


        auditLog.innerHTML = `
            <p>
                Unable to load agent activity.
            </p>
        `;

    }

}


// ================================
// INITIAL LOAD
// ================================

loadAnalytics();

loadAuditLog();  

// ================================
// RAZORPAY TEST MODE CHECKOUT
// ================================

function openRazorpayCheckout(action) {

    if (!action.razorpay_order_id) {
        alert("Razorpay order was not created.");
        return;
    }

    if (!action.razorpay_key_id) {
        alert("Razorpay Key ID is missing.");
        return;
    }

    const options = {

        key: action.razorpay_key_id,

        amount: action.razorpay_amount,

        currency: action.razorpay_currency,

        name: "RazorGrow AI",

        description: `AI Growth Action - ${action.product}`,

        order_id: action.razorpay_order_id,

        handler: async function (response) {

            try {

                const verificationResponse = await fetch(
                    "/agent/payment/verify",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            razorpay_payment_id:
                                response.razorpay_payment_id,

                            razorpay_order_id:
                                response.razorpay_order_id,

                            razorpay_signature:
                                response.razorpay_signature
                        })
                    }
                );

                const data = await verificationResponse.json();

                if (data.success) {

                    alert(
                        "✅ Payment verified successfully!\n\n" +
                        "Payment ID: " +
                        response.razorpay_payment_id
                    );

                    console.log(
                        "Razorpay payment verified:",
                        data
                    );

                    loadAuditLog();

                } else {

                    alert(
                        "❌ Payment verification failed.\n\n" +
                        data.message
                    );
                }

            } catch (error) {

                console.error(
                    "Payment verification error:",
                    error
                );

                alert(
                    "❌ Could not verify payment."
                );
            }
        },

        theme: {
            color: "#3399cc"
        }
    };

    const razorpay = new Razorpay(options);

    razorpay.open();
}