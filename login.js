// ======================================
// Dr Eman Pharmacy Offers
// login.js
// ======================================

// عناصر الصفحة
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

// ======================================
// إظهار رسالة خطأ
// ======================================

function showError(message) {

    errorMessage.style.display = "block";

    errorMessage.textContent = message;

}

// ======================================
// إخفاء رسالة الخطأ
// ======================================

function hideError() {

    errorMessage.style.display = "none";

    errorMessage.textContent = "";

}

// ======================================
// تسجيل الدخول
// ======================================

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    hideError();

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    try {

        await firebase.auth().signInWithEmailAndPassword(
            email,
            password
        );

        // نجاح تسجيل الدخول
        window.location.href = "admin.html";

    } catch (error) {

        switch (error.code) {

            case "auth/user-not-found":
                showError("هذا البريد الإلكتروني غير مسجل.");
                break;

            case "auth/wrong-password":
                showError("كلمة المرور غير صحيحة.");
                break;

            case "auth/invalid-email":
                showError("البريد الإلكتروني غير صحيح.");
                break;

            case "auth/too-many-requests":
                showError("تم إيقاف المحاولات مؤقتًا، حاول لاحقًا.");
                break;

            default:
                showError("فشل تسجيل الدخول، تحقق من البيانات.");
        }

        console.error(error);

    }

});
