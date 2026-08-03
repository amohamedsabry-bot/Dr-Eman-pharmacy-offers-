// ======================================
// Dr Eman Pharmacy Offers
// admin.js
// Firebase Modular v12
// ======================================

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// عناصر الصفحة
const productForm = document.getElementById("productForm");
const productsTable = document.getElementById("productsTable");
const previewImage = document.getElementById("previewImage");
const logoutBtn = document.getElementById("logoutBtn");

const imageInput = document.getElementById("image");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const oldPriceInput = document.getElementById("oldPrice");
const newPriceInput = document.getElementById("newPrice");
const discountInput = document.getElementById("discount");
const availableInput = document.getElementById("available");
const featuredInput = document.getElementById("featured");

const productsRef = collection(db, "products");

// متغير لحفظ المنتج الجاري تعديله
let editId = null;


// ======================================
// حماية الصفحة: لازم تسجيل دخول
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
    }

});


// ======================================
// تسجيل الخروج
// ======================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);
        window.location.href = "login.html";

    });

}


// ======================================
// مسار الصورة
// الصورة بقت متخزنة كملف عادي جوه GitHub
// (مجلد images/products/) بدل Firebase Storage،
// فمفيش داعي لأي ترقية أو صلاحيات إضافية.
// ======================================

function resolveImagePath(value) {

    const v = (value || "").trim();

    if (!v) return "";

    if (/^https?:\/\//i.test(v) || v.startsWith("images/")) {
        return v;
    }

    return "images/products/" + v;

}

function toDisplayValue(path) {

    if (!path) return "";

    if (path.startsWith("images/products/")) {
        return path.slice("images/products/".length);
    }

    return path;

}


// ======================================
// معاينة الصورة
// ======================================

imageInput.addEventListener("input", function () {

    const path = resolveImagePath(this.value);

    previewImage.src = path || "images/no-image.png";

});

previewImage.addEventListener("error", function () {

    this.src = "images/no-image.png";

});


// ======================================
// تنظيف النموذج
// ======================================

function clearForm() {

    productForm.reset();

    previewImage.src = "images/no-image.png";

    editId = null;

}


// ======================================
// إنشاء كائن المنتج
// ======================================

function buildProduct(imageUrl = "") {

    return {

        name: nameInput.value.trim(),

        category: categoryInput.value,

        description: descriptionInput.value.trim(),

        oldPrice: Number(oldPriceInput.value),

        newPrice: Number(newPriceInput.value),

        discount: discountInput.value.trim(),

        image: imageUrl,

        featured: featuredInput.value === "true",

        available: availableInput.value === "true",

        createdAt: new Date()

    };

}

// ======================================
// حفظ المنتج
// ======================================

productForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    try {

        const imageUrl = resolveImagePath(imageInput.value);

        const product = buildProduct(imageUrl);

        if (editId) {

            await updateDoc(doc(db, "products", editId), product);

            alert("تم تعديل المنتج بنجاح");

        } else {

            const ref = await addDoc(productsRef, product);

            alert("تمت الإضافة بنجاح\nID = " + ref.id);

        }

        clearForm();

        loadProducts();

    } catch (error) {

        alert(
            "ERROR CODE:\n" + error.code +
            "\n\nMESSAGE:\n" + error.message +
            "\n\nFULL:\n" + JSON.stringify(error)
        );

    }

});
// ======================================
// حذف المنتج
// ======================================

async function deleteProduct(id) {

    const ok = confirm("هل تريد حذف هذا المنتج؟");

    if (!ok) return;

    await deleteDoc(doc(db, "products", id));

    loadProducts();

}


// ======================================
// تعديل المنتج
// ======================================

async function editProduct(id) {

    const snap = await getDoc(doc(db, "products", id));

    if (!snap.exists()) return;

    const product = snap.data();

    editId = id;

    nameInput.value = product.name;

    categoryInput.value = product.category;

    descriptionInput.value = product.description;

    oldPriceInput.value = product.oldPrice;

    newPriceInput.value = product.newPrice;

    discountInput.value = product.discount;

    if (availableInput) availableInput.value = String(!!product.available);

    if (featuredInput) featuredInput.value = String(!!product.featured);

    imageInput.value = toDisplayValue(product.image);

    previewImage.src = product.image || "images/no-image.png";

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// الدوال دي بتتنادى من onclick داخل جدول المنتجات، وبما إن الملف
// ده ES module فلازم نعلّقها على window يدويًا عشان الـ HTML يشوفها
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// ======================================
// تحميل المنتجات من Firestore
// ======================================

async function loadProducts() {

    productsTable.innerHTML = "";

    try {

        const q = query(productsRef, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);

        let index = 0;

        snapshot.forEach((docSnap) => {

            const product = docSnap.data();

            index++;

            productsTable.innerHTML += `

<tr>

<td>${index}</td>

<td>

<img src="${product.image || 'images/no-image.png'}" alt="${product.name}">

</td>

<td>${product.name}</td>

<td>${product.category}</td>

<td>${product.newPrice} ج.م</td>

<td>${product.discount}</td>

<td>

<span class="status ${product.available ? "available" : "unavailable"}">

${product.available ? "متوفر" : "غير متوفر"}

</span>

</td>

<td>

<button
class="edit-btn"
onclick="editProduct('${docSnap.id}')">

✏️ تعديل

</button>

<button
class="delete-btn"
onclick="deleteProduct('${docSnap.id}')">

🗑 حذف

</button>

</td>

</tr>

`;

        });

    } catch (error) {

        console.error(error);

        alert("تعذر تحميل المنتجات.");

    }

}


// ======================================
// نسخة احتياطية (تنزيل كل المنتجات كملف JSON)
// ======================================

const downloadBackupBtn = document.getElementById("downloadBackup");

if (downloadBackupBtn) {

    downloadBackupBtn.addEventListener("click", async () => {

        try {

            const snapshot = await getDocs(productsRef);

            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            const blob = new Blob(
                [JSON.stringify(data, null, 2)],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `products-backup-${Date.now()}.json`;
            a.click();

            URL.revokeObjectURL(url);

        } catch (error) {

            console.error(error);
            alert("تعذر إنشاء النسخة الاحتياطية.");

        }

    });

}


// ======================================
// حذف كل المنتجات
// ======================================

const clearAllBtn = document.getElementById("clearAll");

if (clearAllBtn) {

    clearAllBtn.addEventListener("click", async () => {

        const ok = confirm("هل أنت متأكد من حذف جميع المنتجات؟ لا يمكن التراجع عن هذا الإجراء.");

        if (!ok) return;

        try {

            const snapshot = await getDocs(productsRef);

            await Promise.all(
                snapshot.docs.map(d => deleteDoc(doc(db, "products", d.id)))
            );

            loadProducts();

        } catch (error) {

            console.error(error);
            alert("تعذر حذف المنتجات.");

        }

    });

}


// ======================================
// تشغيل الصفحة
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

});


// ======================================
// تحديث السنة في الفوتر
// ======================================

const year = document.getElementById("year");

if (year) {

    year.textContent = new Date().getFullYear();

}


// ======================================
// نهاية الملف
// ======================================
