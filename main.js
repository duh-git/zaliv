// ======================== Вкладки (Услуги) ========================
const servicesTabs = document.querySelectorAll("#servicesTabs .tab-btn");
const panes = {
  fiz: document.getElementById("fiz-pane"),
  ur: document.getElementById("ur-pane"),
};
servicesTabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    servicesTabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    Object.values(panes).forEach((p) => p.classList.remove("active-pane"));
    panes[tabId].classList.add("active-pane");
  });
});

// ======================== Вкладки (Кейсы) ========================
const caseTabs = document.querySelectorAll("#caseTabs .tab-btn");
const casePanes = {
  "case-zaliv": document.getElementById("case-zaliv-pane"),
  "case-uk": document.getElementById("case-uk-pane"),
  "case-bankrot": document.getElementById("case-bankrot-pane"),
};
caseTabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    caseTabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const caseId = btn.getAttribute("data-case");
    Object.values(casePanes).forEach((p) => p.classList.remove("active-pane"));
    casePanes[caseId].classList.add("active-pane");
  });
});

// ======================== Аккордеон (одиночное раскрытие) ========================
const accordionItems = document.querySelectorAll(".accordion-item");
accordionItems.forEach((item) => {
  const question = item.querySelector(".accordion-question");
  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    // Закрываем все
    accordionItems.forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

// ======================== Модальное окно с анимацией ========================
const modal = document.getElementById("consultModal");
const modalClose = document.querySelector(".close-modal");
function openModal() {
  modal.classList.add("show");
}
function closeModal() {
  modal.classList.remove("show");
}
document
  .querySelectorAll(
    ".consult-trigger, #consultBtnHeader, #heroFormBtn, #footerCallBtn",
  )
  .forEach((btn) => {
    btn.addEventListener("click", openModal);
  });
modalClose.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Таймер 20 секунд (ТЗ)
setTimeout(() => {
  openModal();
}, 20000);

// ======================== Общая функция отправки (имитация Битрикс) ========================
function sendToCRM(data, callback) {
  console.log("Отправка в Битрикс24:", data);
  setTimeout(
    () =>
      callback({
        success: true,
        message: "Заявка принята, мы свяжемся в течение 5 минут",
      }),
    500,
  );
}

// Вспомогательная очистка ошибок
function clearErrors(formContainer) {
  formContainer
    .querySelectorAll(".field-error")
    .forEach((el) => (el.textContent = ""));
}

function showFieldError(inputId, message) {
  const errorDiv = document.getElementById(inputId + "Error");
  if (errorDiv) errorDiv.textContent = message;
}

// Валидация имени
function validateName(name, errorId) {
  if (!name || name.length < 2) {
    showFieldError(errorId, "Имя должно содержать не менее 2 символов");
    return false;
  }
  showFieldError(errorId, "");
  return true;
}

// Валидация телефона (минимум 10 цифр)
function validatePhone(phone, errorId) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    showFieldError(
      errorId,
      "Введите корректный номер телефона (не менее 10 цифр)",
    );
    return false;
  }
  showFieldError(errorId, "");
  return true;
}

// Валидация email
function validateEmail(email, errorId) {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!email || !re.test(email)) {
    showFieldError(errorId, "Введите корректный email");
    return false;
  }
  showFieldError(errorId, "");
  return true;
}

// ======================== Форма модального окна ========================
const modalForm = document.getElementById("modalForm");
const modalMsg = document.getElementById("modalFormMsg");
modalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("modalName").value.trim();
  const phone = document.getElementById("modalPhone").value.trim();
  const isNameValid = validateName(name, "modalName");
  const isPhoneValid = validatePhone(phone, "modalPhone");
  if (!isNameValid || !isPhoneValid) return;

  sendToCRM({ name, phone, form: "modal" }, (res) => {
    modalMsg.textContent = res.message;
    modalMsg.className = "form-message " + (res.success ? "success" : "error");
    if (res.success) {
      modalForm.reset();
      clearErrors(modalForm);
      setTimeout(() => {
        modalMsg.textContent = "";
        modalMsg.className = "form-message";
        closeModal();
      }, 2000);
    }
  });
});

// ======================== Форма футера (контакты) ========================
const footerForm = document.getElementById("contactFormFooter");
const footerMsg = document.getElementById("footerFormMsg");
footerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("footerName").value.trim();
  const phone = document.getElementById("footerPhone").value.trim();
  const isNameValid = validateName(name, "footerName");
  const isPhoneValid = validatePhone(phone, "footerPhone");
  if (!isNameValid || !isPhoneValid) return;

  sendToCRM({ name, phone, form: "footer" }, (res) => {
    footerMsg.textContent = res.message;
    footerMsg.className = "form-message " + (res.success ? "success" : "error");
    if (res.success) {
      footerForm.reset();
      clearErrors(footerForm);
      setTimeout(() => {
        footerMsg.textContent = "";
        footerMsg.className = "form-message";
      }, 3000);
    }
  });
});

// ======================== Форма чек-листа (email) ========================
const checklistForm = document.getElementById("checklistForm");
const checklistMsg = document.getElementById("checklistMsg");
if (checklistForm) {
  checklistForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("checklistEmail").value.trim();
    const isValid = validateEmail(email, "checklistEmail");
    if (!isValid) return;

    sendToCRM({ email, form: "checklist" }, (res) => {
      checklistMsg.textContent =
        res.message + " Ссылка на скачивание отправлена на email.";
      checklistMsg.className = "form-message success";
      checklistForm.reset();
      setTimeout(() => {
        checklistMsg.textContent = "";
        checklistMsg.className = "form-message";
      }, 4000);
    });
  });
}

// ======================== Бургер-меню ========================
const burger = document.getElementById("burgerBtn");
const headerContact = document.getElementById("headerContact");
burger.addEventListener("click", () => {
  headerContact.classList.toggle("mobile-open");
});

// ======================== Логотип (прокрутка вверх) ========================
document.getElementById("logoLink")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ======================== Заглушка для метрик ========================
console.log("Яндекс.Метрика и Google Analytics можно установить позже");
