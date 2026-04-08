const express = require("express");
const router = express.Router();
const mealkitModel = require("../models/mealkitModel");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

// Mailgun Setup
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.mailgun.net'
});

// Middleware to ensure only customers access the cart
const isCustomer = (req, res, next) => {
    if (req.session.user && req.session.role === "customer") {
        next();
    } else {
        res.redirect("/log-in"); // Adjusted to match generalController route
    }
};

// GET /cart - Display the shopping cart
router.get("/", isCustomer, (req, res) => {
    res.render("cart/shopping-cart", {
        title: "Your Shopping Cart",
        cart: req.session.cart || []
    });
});

// POST /cart/add/:id
router.post("/add/:id", isCustomer, (req, res) => {
    let cart = req.session.cart = req.session.cart || [];
    const kitId = req.params.id;
    let found = cart.find(item => item.id === kitId);

    if (found) {
        found.qty++;
        res.redirect("/cart");
    } else {
        mealkitModel.findById(kitId).lean()
            .then(kit => {
                cart.push({
                    id: kit._id.toString(), // Ensuring the ID is a string for easier comparison
                    title: kit.title,
                    price: kit.price,
                    imageUrl: kit.imageUrl,
                    includes: kit.includes, // Added to show in email/cart
                    qty: 1
                });
                res.redirect("/cart");
            })
            .catch(err => console.log("Error adding to cart:", err));
    }
});

// POST /cart/update-qty/:id
router.post("/update-qty/:id", isCustomer, (req, res) => {
    let cart = req.session.cart || [];
    const kitId = req.params.id;
    const newQty = parseInt(req.body.qty);

    let item = cart.find(item => item.id === kitId);

    if (item && newQty > 0) {
        item.qty = newQty;
    } else if (item && newQty <= 0) {
        req.session.cart = cart.filter(item => item.id !== kitId);
    }
    res.redirect("/cart");
});

// GET /cart/remove/:id
router.get("/remove/:id", isCustomer, (req, res) => {
    let cart = req.session.cart || [];
    const kitId = req.params.id;
    req.session.cart = cart.filter(item => item.id !== kitId);
    res.redirect("/cart");
});

// POST /cart/place-order
router.post("/place-order", isCustomer, (req, res) => {
    const cart = req.session.cart || [];
    const user = req.session.user;

    if (cart.length === 0) {
        return res.redirect("/cart");
    }

    // Building Table Rows for Email
    let subtotal = 0;
    let tableRows = "";

    cart.forEach(item => {
        let total = item.price * item.qty;
        subtotal += total;
        tableRows += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.title}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.qty}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">$${total.toFixed(2)}</td>
            </tr>`;
    });

    const tax = subtotal * 0.10;
    const grandTotal = subtotal + tax;

    // Building HTML Body - Used copilot to layout the email receipt
    const htmlEmail = `
        <h3>Order Confirmation for ${user.firstName} ${user.lastName}</h3>
        <p>Thank you for choosing Sarap MealKits!</p>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #eee;">
                    <th style="text-align: left; padding: 8px;">Item</th>
                    <th style="text-align: left; padding: 8px;">Qty</th>
                    <th style="text-align: left; padding: 8px;">Price</th>
                    <th style="text-align: left; padding: 8px;">Total</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}<br>
        <strong>Tax (10%):</strong> $${tax.toFixed(2)}<br>
        <strong>Grand Total: $${grandTotal.toFixed(2)}</strong></p>
    `;

    // 3. Send using my mailgun
    mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: `Sarap MealKits <postmaster@${process.env.MAILGUN_DOMAIN}>`,
        to: [user.email],
        subject: `Order Receipt - Sarap MealKits`,
        html: htmlEmail
    })
    .then(() => {
        // CLEAN THE CART & REDIRECT
        req.session.cart = [];
        res.render("cart/ordered", {
            title: "Success",
            message: "Your order has been placed! Please check your email for the receipt."
        });
    })
    .catch(err => {
        console.log("Mailgun Error:", err);
        res.redirect("/cart");
    });
});

module.exports = router;