// ======================== Вкладки (Кейсы) ========================
const caseTabs = document.querySelectorAll("#caseTabs .tab-btn");
const casePanes = {
  "case-zaliv": document.getElementById("case-zaliv-pane"),
  "case-uk": document.getElementById("case-uk-pane"),
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
    ".consult-trigger, #consultBtnHeader, #heroFormBtn, #footerCallBtnFooter",
  )
  .forEach((btn) => {
    btn.addEventListener("click", openModal);
  });
modalClose.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Таймер 20 секунд
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

// ======================== Функции для работы с телефоном ========================

// Очистка номера от всех нецифровых символов
function cleanPhoneNumber(value) {
  return value.replace(/\D/g, "");
}

// Валидация телефона: +79????????? или 89????????? (11 цифр после кода)
function validatePhone(phone, errorId) {
  const digits = cleanPhoneNumber(phone);

  // Проверяем, что номер начинается с 7 или 8 и имеет 11 цифр
  if (digits.length !== 11) {
    showFieldError(errorId, "Введите корректный номер телефона (11 цифр)");
    return false;
  }

  // Проверяем, что номер начинается с 7 или 8
  if (!digits.startsWith("7") && !digits.startsWith("8")) {
    showFieldError(errorId, "Номер должен начинаться с +7 или 8");
    return false;
  }

  showFieldError(errorId, "");
  return true;
}

// Автоформатирование номера телефона в формате +7 (9??) ???-??-??
function formatPhoneNumber(value) {
  const digits = cleanPhoneNumber(value);

  // Если номер пустой, возвращаем пустую строку
  if (digits.length === 0) return "";

  // Определяем код страны: если начинается с 8, заменяем на 7
  let normalized = digits;
  if (normalized.startsWith("8")) {
    normalized = "7" + normalized.slice(1);
  } else if (normalized.startsWith("7")) {
    // уже норм
  } else {
    // если не начинается с 7 или 8, просто возвращаем как есть
    return value;
  }

  // Форматируем: +7 (XXX) XXX-XX-XX
  let formatted = "+7";

  if (normalized.length > 1) {
    formatted += " (" + normalized.slice(1, 4);
  } else if (normalized.length === 1) {
    formatted += " ";
    return formatted;
  }

  if (normalized.length >= 4) {
    formatted += ") " + normalized.slice(4, 7);
  } else if (normalized.length > 1) {
    formatted += ")";
    return formatted;
  }

  if (normalized.length >= 7) {
    formatted += "-" + normalized.slice(7, 9);
  }

  if (normalized.length >= 9) {
    formatted += "-" + normalized.slice(9, 11);
  }

  return formatted;
}

// Автоформатирование при вводе
function setupPhoneFormatting(inputElement) {
  if (!inputElement) return;

  inputElement.addEventListener("input", function (e) {
    const cursorPosition = this.selectionStart;
    const rawValue = this.value;
    const digits = cleanPhoneNumber(rawValue);

    // Если ввели 8, автоматически меняем на +7
    if (digits.length === 1 && digits.startsWith("8")) {
      // Ничего не делаем, дадим пользователю ввести 8, потом заменим
    }

    // Форматируем
    const formatted = formatPhoneNumber(rawValue);

    // Обновляем значение, если оно изменилось
    if (formatted !== rawValue) {
      this.value = formatted;

      // Сохраняем позицию курсора
      const newCursorPos =
        cursorPosition + (formatted.length - rawValue.length);
      this.setSelectionRange(newCursorPos, newCursorPos);
    }
  });

  // При потере фокуса - финальное форматирование
  inputElement.addEventListener("blur", function () {
    const digits = cleanPhoneNumber(this.value);
    if (digits.length === 11) {
      this.value = formatPhoneNumber(this.value);
    }
  });
}

// Получение чистого номера для отправки (+7XXXXXXXXXX)
function getCleanPhoneForCRM(value) {
  const digits = cleanPhoneNumber(value);
  if (digits.startsWith("8")) {
    return "+7" + digits.slice(1);
  }
  if (digits.startsWith("7")) {
    return "+7" + digits.slice(1);
  }
  return digits;
}

// ======================== Инициализация автоформатирования ========================

// Настройка форматирования для всех полей телефона
document.addEventListener("DOMContentLoaded", function () {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    setupPhoneFormatting(input);
  });
});

// ======================== Форма модального окна ========================
const modalForm = document.getElementById("modalForm");
const modalMsg = document.getElementById("modalFormMsg");
modalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("modalName").value.trim();
  const phoneInput = document.getElementById("modalPhone");
  const phone = phoneInput.value.trim();
  const isNameValid = validateName(name, "modalName");
  const isPhoneValid = validatePhone(phone, "modalPhone");
  if (!isNameValid || !isPhoneValid) return;

  // Отправляем очищенный номер
  const cleanPhone = getCleanPhoneForCRM(phone);
  sendToCRM({ name, phone: cleanPhone, form: "modal" }, (res) => {
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
  const phoneInput = document.getElementById("footerPhone");
  const phone = phoneInput.value.trim();
  const isNameValid = validateName(name, "footerName");
  const isPhoneValid = validatePhone(phone, "footerPhone");
  const isConsentValid = validateConsent("footerConsent", "footerConsent");
  if (!isNameValid || !isPhoneValid || !isConsentValid) return;

  const cleanPhone = getCleanPhoneForCRM(phone);
  sendToCRM({ name, phone: cleanPhone, form: "footer" }, (res) => {
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

// ======================== Валидация чекбокса согласия ========================
function validateConsent(checkboxId, errorId) {
  const checkbox = document.getElementById(checkboxId);
  if (!checkbox || !checkbox.checked) {
    showFieldError(
      errorId,
      "Необходимо дать согласие на обработку персональных данных",
    );
    return false;
  }
  showFieldError(errorId, "");
  return true;
}

// ======================== Бургер-меню ========================
const burger = document.getElementById("burgerBtn");
const headerNav = document.getElementById("headerNav");
const headerRight = document.querySelector(".header-right");
burger.addEventListener("click", () => {
  headerNav.classList.toggle("mobile-open");
  headerRight.classList.toggle("mobile-open");
});

// ======================== Логотип (прокрутка вверх) ========================
// document.getElementById("logoLink")?.addEventListener("click", () => {
//   window.scrollTo({ top: 0, behavior: "smooth" });
// });

// ======================== Кнопка "Стать партнёром" ========================
document.getElementById("partnerBtn")?.addEventListener("click", () => {
  alert(
    "Спасибо за интерес! Скоро мы свяжемся с вами для оформления партнёрства.",
  );
});

// ======================== Заглушка для метрик ========================
console.log("Яндекс.Метрика и Google Analytics можно установить позже");
