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
const searchInput = document.getElementById("search");
const categoryButtons = document.querySelectorAll(".cat");
const year = document.getElementById("year");

let products = [];
let filteredProducts = [];

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

            products.push({
                id: item.id,
                ...item.data()
            });

        });

        filteredProducts = [...products];

        displayProducts(filteredProducts);

    } catch (error) {

        console.error(error);

        productsContainer.innerHTML =
            '<div class="no-products">تعذر تحميل العروض.</div>';

    }

}
// ===============================
// عرض المنتجات
// ===============================

function displayProducts(items) {

    if (!items.length) {

        productsContainer.innerHTML =
            '<div class="no-products">لا توجد عروض حالياً.</div>';

        return;

    }

    productsContainer.innerHTML = "";

    items.forEach(product => {

        productsContainer.innerHTML += `

<div class="product-card">

    <span class="discount">

        ${product.discount || ""}

    </span>

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

        <a
            class="buy-btn"
            target="_blank"
            href="https://wa.me/201119437427?text=${encodeURIComponent("أرغب في طلب " + product.name)}">

            اطلب عبر واتساب

        </a>

    </div>

</div>

`;

    });

    animateCards();

}

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
