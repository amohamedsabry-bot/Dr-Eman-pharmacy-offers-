// ======================================
// Dr Eman Pharmacy Offers
// app.js
// Firebase Modular v12
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const productsContainer = document.getElementById("products");
const featuredSection = document.getElementById("featuredSection");
const featuredContainer = document.getElementById("featuredProducts");
const searchInput = document.getElementById("search");
const categoryButtons = document.querySelectorAll(".cat");
const year = document.getElementById("year");

const WHATSAPP_NUMBER = "201119437427";
const CART_KEY = "drEmanCart";

const cartFab = document.getElementById("cartFab");
const cartBadge = document.getElementById("cartBadge");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartClearBtn = document.getElementById("cartClearBtn");
const cartSendBtn = document.getElementById("cartSendBtn");

let products = [];
let filteredProducts = [];
let cart = loadCart();

const productsRef = collection(db, "products");

// ===============================
// تحميل المنتجات من Firestore
// ===============================

async function loadProducts() {

    productsContainer.innerHTML =
        '<div class="loading">جارٍ تحميل العروض...</div>';

    try {

        const q = query(
            productsRef,
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        products = [];

        snapshot.forEach((item) => {

            const data = item.data();

            // إخفاء المنتجات المحددة كـ "غير متوفر" من الموقع الأمامي
            if (data.available === false) return;

            products.push({
                id: item.id,
                ...data
            });

        });

        filteredProducts = [...products];

        displayProducts(filteredProducts);
        renderFeatured(products);

    } catch (error) {

        console.error(error);

        productsContainer.innerHTML =
            '<div class="no-products">تعذر تحميل العروض.</div>';

    }

}
// ===============================
// عرض المنتجات
// ===============================

function buildProductCard(product) {

    const inCart = cart.some(item => item.id === product.id);

    return `

<div class="product-card${inCart ? " in-cart" : ""}" data-id="${product.id}">

    <span class="discount">

        ${product.discount || ""}

    </span>

    ${product.featured ? '<span class="featured-badge">⭐ مميز</span>' : ""}

    <img
        src="${product.image || 'images/no-image.png'}"
        alt="${product.name}"
        loading="lazy">

    <div class="product-info">

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <div class="price">

            <span class="old-price">

                ${product.oldPrice}

            </span>

            <span class="new-price">

                ${product.newPrice}

            </span>

        </div>

        <div class="card-actions">

            <a
                class="buy-btn"
                target="_blank"
                href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("أرغب في طلب " + product.name)}">

                طلب سريع

            </a>

            <button
                class="add-cart-btn${inCart ? " in-cart" : ""}"
                data-id="${product.id}">

                ${inCart ? "تمت الإضافة ✓" : "+ أضف للطلب"}

            </button>

        </div>

    </div>

</div>

`;

}

function displayProducts(items) {

    if (!items.length) {

        productsContainer.innerHTML =
            '<div class="no-products">لا توجد عروض حالياً.</div>';

        return;

    }

    productsContainer.innerHTML = items.map(buildProductCard).join("");

    animateCards();

}

// ===============================
// عرض المنتجات المميزة
// ===============================

function renderFeatured(items) {

    const featured = items.filter(product => product.featured);

    if (!featured.length) {

        featuredSection.classList.add("hidden");
        featuredContainer.innerHTML = "";

        return;

    }

    featuredContainer.innerHTML = featured.map(buildProductCard).join("");

    featuredSection.classList.remove("hidden");

    animateCards();

}

// ===============================
// السلة (اختيار أكثر من منتج)
// ===============================

function loadCart() {

    try {

        const saved = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(saved) ? saved : [];

    } catch (error) {

        return [];

    }

}

function saveCart() {

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

}

function toggleCartItem(productId) {

    const existing = cart.find(item => item.id === productId);

    if (existing) {

        cart = cart.filter(item => item.id !== productId);

    } else {

        const product = products.find(p => p.id === productId);

        if (!product) return;

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.newPrice) || 0,
            image: product.image || "images/no-image.png",
            qty: 1
        });

    }

    saveCart();
    updateCartUI();
    syncProductCards();

}

function changeQty(productId, delta) {

    const item = cart.find(i => i.id === productId);

    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {

        cart = cart.filter(i => i.id !== productId);

    }

    saveCart();
    updateCartUI();
    syncProductCards();

}

function removeFromCart(productId) {

    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    syncProductCards();

}

function clearCart() {

    cart = [];
    saveCart();
    updateCartUI();
    syncProductCards();

}

function syncProductCards() {

    document.querySelectorAll(".product-card").forEach(card => {

        const id = card.dataset.id;
        const inCart = cart.some(item => item.id === id);
        const btn = card.querySelector(".add-cart-btn");

        card.classList.toggle("in-cart", inCart);

        if (btn) {

            btn.classList.toggle("in-cart", inCart);
            btn.textContent = inCart ? "تمت الإضافة ✓" : "+ أضف للطلب";

        }

    });

}

function cartTotal() {

    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

}

function buildWhatsAppMessage() {

    let message = "مرحباً، أرغب في طلب المنتجات التالية:\n\n";

    cart.forEach((item, index) => {

        message += `${index + 1}. ${item.name} - الكمية: ${item.qty} - السعر: ${item.price} ج.م\n`;

    });

    message += `\nالإجمالي: ${cartTotal()} ج.م`;

    return message;

}

function updateCartUI() {

    const count = cart.reduce((sum, item) => sum + item.qty, 0);

    cartBadge.textContent = count;
    cartBadge.classList.toggle("hidden", count === 0);

    if (!cart.length) {

        cartItemsEl.innerHTML = '<div class="cart-empty">لم تختر أي منتجات بعد.</div>';

    } else {

        cartItemsEl.innerHTML = cart.map(item => `

<div class="cart-item" data-id="${item.id}">

    <img src="${item.image}" alt="${item.name}">

    <div class="cart-item-info">

        <h4>${item.name}</h4>

        <span class="cart-item-price">${item.price} ج.م</span>

    </div>

    <div class="cart-qty">

        <button class="qty-minus" data-id="${item.id}">−</button>

        <span>${item.qty}</span>

        <button class="qty-plus" data-id="${item.id}">+</button>

    </div>

    <button class="cart-item-remove" data-id="${item.id}" aria-label="إزالة">🗑</button>

</div>

`).join("");

    }

    cartTotalEl.textContent = `${cartTotal()} ج.م`;

    if (cart.length) {

        cartSendBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
        cartSendBtn.classList.remove("disabled");

    } else {

        cartSendBtn.removeAttribute("href");
        cartSendBtn.classList.add("disabled");

    }

}

function openCart() {

    cartOverlay.classList.remove("hidden");
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");

}

function closeCart() {

    cartOverlay.classList.add("hidden");
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");

}

productsContainer.addEventListener("click", (e) => {

    const btn = e.target.closest(".add-cart-btn");

    if (btn) {

        toggleCartItem(btn.dataset.id);

    }

});

featuredContainer.addEventListener("click", (e) => {

    const btn = e.target.closest(".add-cart-btn");

    if (btn) {

        toggleCartItem(btn.dataset.id);

    }

});

cartItemsEl.addEventListener("click", (e) => {

    const plusBtn = e.target.closest(".qty-plus");
    const minusBtn = e.target.closest(".qty-minus");
    const removeBtn = e.target.closest(".cart-item-remove");

    if (plusBtn) changeQty(plusBtn.dataset.id, 1);
    if (minusBtn) changeQty(minusBtn.dataset.id, -1);
    if (removeBtn) removeFromCart(removeBtn.dataset.id);

});

cartFab.addEventListener("click", openCart);
cartCloseBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
cartClearBtn.addEventListener("click", clearCart);

updateCartUI();

// ===============================
// البحث
// ===============================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    filteredProducts = products.filter(product =>

        product.name.toLowerCase().includes(keyword) ||

        product.description.toLowerCase().includes(keyword)

    );

    displayProducts(filteredProducts);

});

// ===============================
// التصفية حسب التصنيف
// ===============================

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        const category = button.textContent.trim();

        if (category === "الكل") {

            filteredProducts = [...products];

        } else {

            filteredProducts = products.filter(product =>

                product.category === category

            );

        }

        displayProducts(filteredProducts);

    });

});
// ===============================
// تأثير ظهور البطاقات
// ===============================

function animateCards() {

    const cards = document.querySelectorAll(".product-card");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: 0.15

    });

    cards.forEach(card => observer.observe(card));

}

// ===============================
// السنة الحالية
// ===============================

if (year) {

    year.textContent = new Date().getFullYear();

}

// ===============================
// تغيير شكل الهيدر أثناء التمرير
// ===============================

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if (window.scrollY > 50) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});

// ===============================
// قائمة الموبايل
// ===============================

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {

    navToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
        });
    });

}

// ===============================
// بدء تشغيل الموقع
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});

// ===============================
// التقاط الأخطاء
// ===============================

window.addEventListener("error", (e) => {

    console.error("Application Error:", e.message);

});
