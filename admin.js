// ======================================
// Dr Eman Pharmacy Offers
// admin.js
// ======================================

// عناصر الصفحة
const productForm = document.getElementById("productForm");
const productsTable = document.getElementById("productsTable");
const previewImage = document.getElementById("previewImage");

const imageInput = document.getElementById("image");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const oldPriceInput = document.getElementById("oldPrice");
const newPriceInput = document.getElementById("newPrice");
const discountInput = document.getElementById("discount");

// سيتم ربطها لاحقاً مع Firebase
let db = null;
let storage = null;

// متغير لحفظ المنتج الجاري تعديله
let editId = null;


// ======================================
// معاينة الصورة
// ======================================

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

    };

    reader.readAsDataURL(file);

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

        featured: false,

        available: true,

        createdAt: new Date()

    };

}
// ======================================
// رفع الصورة إلى Firebase Storage
// ======================================

async function uploadImage(file) {

    if (!file) return "";

    const fileName = Date.now() + "_" + file.name;

    const storageRef = firebase.storage().ref();

    const imageRef = storageRef.child("products/" + fileName);

    await imageRef.put(file);

    const imageUrl = await imageRef.getDownloadURL();

    return imageUrl;

}


// ======================================
// حفظ المنتج
// ======================================

productForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    try {

        let imageUrl = "";

        if (imageInput.files.length > 0) {

            imageUrl = await uploadImage(imageInput.files[0]);

        }

        const product = buildProduct(imageUrl);

        if (editId) {

            await firebase.firestore()
                .collection("products")
                .doc(editId)
                .update(product);

            alert("تم تعديل المنتج بنجاح");

        } else {

            await firebase.firestore()
                .collection("products")
                .add(product);

            alert("تم إضافة المنتج بنجاح");

        }

        clearForm();

        loadProducts();

    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء الحفظ");

    }

});


// ======================================
// حذف المنتج
// ======================================

async function deleteProduct(id) {

    const ok = confirm("هل تريد حذف هذا المنتج؟");

    if (!ok) return;

    await firebase.firestore()
        .collection("products")
        .doc(id)
        .delete();

    loadProducts();

}


// ======================================
// تعديل المنتج
// ======================================

async function editProduct(id) {

    const doc = await firebase.firestore()
        .collection("products")
        .doc(id)
        .get();

    if (!doc.exists) return;

    const product = doc.data();

    editId = id;

    nameInput.value = product.name;

    categoryInput.value = product.category;

    descriptionInput.value = product.description;

    oldPriceInput.value = product.oldPrice;

    newPriceInput.value = product.newPrice;

    discountInput.value = product.discount;

    previewImage.src = product.image;

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}
// ======================================
// تحميل المنتجات من Firestore
// ======================================

async function loadProducts() {

    productsTable.innerHTML = "";

    try {

        const snapshot = await firebase
            .firestore()
            .collection("products")
            .orderBy("createdAt", "desc")
            .get();

        snapshot.forEach((doc, index) => {

            const product = doc.data();

            productsTable.innerHTML += `

<tr>

<td>${index + 1}</td>

<td>

<img src="${product.image}" alt="${product.name}">

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
onclick="editProduct('${doc.id}')">

✏️ تعديل

</button>

<button
class="delete-btn"
onclick="deleteProduct('${doc.id}')">

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
// تشغيل الصفحة
// ======================================

window.addEventListener("DOMContentLoaded", () => {

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