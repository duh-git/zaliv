// ======================== Вкладки (Кейсы) ========================
const caseTabs = document.querySelectorAll("#caseTabs .tab-btn");
const casePanes = {
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
    ".consult-trigger, #consultBtnHeader, #heroFormBtn, #footerCallBtnFooter, #partnerBtn"
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


/**
 * Отправляет данные формы в Google Apps Script
 * @param {Object} data - объект с данными формы (например, {name: 'Иван', phone: '123'})
 * @param {Function} callback - функция, которая получит результат {success, message}
 */
function sendToBroker(data, callback) {
  // Ваш URL из Apps Script
  const scriptURL = "https://script.google.com/macros/s/AKfycbxVs72rpF130_CR4YSt3rIAx5Ye-bc7fooW47vlS4F8J0--E8i42axSxoyHXEizPvU/exec"
  // Создаем FormData для отправки
  const formData = new FormData();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, data[key]);
    }
  }

  // Отправляем POST-запрос
  fetch(scriptURL, {
    method: 'POST',
    body: formData,
    // mode: 'no-cors' // НЕ добавляйте эту опцию, иначе не сможете прочитать ответ
  })
    .then(response => {
      console.log("1");

      // Проверяем, пришел ли JSON от сервера
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        // Если пришел не JSON (например, HTML), пробуем прочитать как текст
        return response.text().then(text => {
          throw new Error('Сервер вернул не JSON: ' + text.substring(0, 100));
        });
      }
    })
    .then(data => {
      console.log("2");
      // Успешно - вызываем callback с результатом от сервера
      callback({
        success: data.success || true,
        message: data.message || 'Заявка отправлена'
      });
    })
    .catch(error => {
      console.log("3", error);
      // Ошибка сети или обработки
      console.error('Ошибка отправки:', error);
      callback({
        success: false,
        message: 'Ошибка соединения. Попробуйте позже или свяжитесь с нами по телефону.'
      });
    });
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
  } else if (!normalized.startsWith("7")) {
    // если не начинается с 7 или 8, просто возвращаем как есть
    return value;
  }

  // Форматируем: +7 (XXX) XXX-XX-XX
  let formatted = "+7";

  if (normalized.length > 1) {
    formatted += " (" + normalized.slice(1, Math.min(4, normalized.length));
    if (normalized.length < 4) {
      return formatted; // Неполный код оператора
    }
  } else {
    return formatted;
  }

  if (normalized.length >= 4) {
    formatted += ") ";
    const remaining = normalized.slice(4);
    // Добавляем цифры с дефисами
    for (let i = 0; i < remaining.length; i++) {
      if (i === 3 || i === 5) {
        formatted += "-";
      }
      formatted += remaining[i];
    }
  }

  return formatted;
}

// ОБНОВЛЕННАЯ: Автоформатирование при вводе
function setupPhoneFormatting(inputElement) {
  if (!inputElement) return;

  let previousValue = '';

  inputElement.addEventListener("input", function (e) {
    const cursorPosition = this.selectionStart;
    const rawValue = this.value;
    const digits = cleanPhoneNumber(rawValue);

    // Определяем, было ли это удаление (backspace или delete)
    const isDeletion = rawValue.length < previousValue.length;
    previousValue = rawValue;

    // Если удаление - не форматируем, чтобы не мешать
    if (isDeletion) {
      // Но всё равно нужно проверить, не осталось ли лишних символов
      const cleanDigits = cleanPhoneNumber(rawValue);
      // Если после удаления остались только цифры и +7 (но без пробелов) - оставляем как есть
      if (cleanDigits.length > 0) {
        // Проверяем, не нужно ли просто убрать лишние символы форматирования
        const onlyDigits = cleanPhoneNumber(rawValue);
        // Если пользователь удалил цифру, просто оставляем значение как есть
        // (оно уже содержит правильное форматирование)
        return;
      }
      return;
    }

    // Если ввели 8, автоматически меняем на +7
    if (digits.length === 1 && digits.startsWith("8")) {
      // Ничего не делаем, дадим пользователю ввести 8, потом заменим
    }

    // Форматируем только при вводе новых символов
    const formatted = formatPhoneNumber(rawValue);

    // Обновляем значение, если оно изменилось
    if (formatted !== rawValue) {
      this.value = formatted;

      // Сохраняем позицию курсора
      const newCursorPos = cursorPosition + (formatted.length - rawValue.length);
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
  const phoneInput = document.getElementById("modalPhone");
  const phone = phoneInput.value.trim();
  const isPhoneValid = validatePhone(phone, "modalPhone");
  if (!isPhoneValid) return;

  // Отправляем очищенный номер
  const cleanPhone = getCleanPhoneForCRM(phone);
  sendToBroker({ phone: cleanPhone, form: "modal" }, (res) => {
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
  const phoneInput = document.getElementById("footerPhone");
  const phone = phoneInput.value.trim();
  const isPhoneValid = validatePhone(phone, "footerPhone");
  const isConsentValid = validateConsent("footerConsent", "footerConsent");
  if (!isPhoneValid || !isConsentValid) return;

  const cleanPhone = getCleanPhoneForCRM(phone);
  sendToBroker({ phone: cleanPhone, form: "footer" }, (res) => {
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

// ======================== Автоматическая отправка при вводе 11 цифр ========================

// Функция для автоматической отправки формы
function autoSubmitForm(form, phoneInput, messageElement, errorId) {
  if (!form || !phoneInput) return;

  const phone = phoneInput.value.trim();
  const digits = cleanPhoneNumber(phone);

  if (digits.length === 11) {
    const isValid = validatePhone(phone, errorId);

    if (isValid) {
      clearErrors(form);

      const cleanPhone = getCleanPhoneForCRM(phone);
      sendToBroker({ phone: cleanPhone, form: 'auto-submit' },
        (res) => {
          return
          // if (messageElement) {
          //   messageElement.textContent = res.message;
          //   messageElement.className = 'form-message ' + (res.success ? 'success' : 'error');
          // }
          // if (res.success) {
          //   form.reset();
          //   setTimeout(() => {
          //     if (messageElement) {
          //       messageElement.textContent = '';
          //       messageElement.className = 'form-message';
          //     }
          //     if (form.id === 'modalForm') {
          //       closeModal();
          //     }
          //   }, 2000);
          // }
        }
      );

      return true;
    }
  }
  return false;
}

// Настройка автоотправки для модальной формы
const modalPhoneInput = document.getElementById('modalPhone');
if (modalPhoneInput) {
  modalPhoneInput.addEventListener('input', function () {
    const digits = cleanPhoneNumber(this.value);
    if (digits.length === 11) {
      autoSubmitForm(
        document.getElementById('modalForm'),
        this,
        document.getElementById('modalFormMsg'),
        'modalPhone'
      );
    }
  });
}

// Настройка автоотправки для футера
const footerPhoneInput = document.getElementById('footerPhone');
if (footerPhoneInput) {
  footerPhoneInput.addEventListener('input', function () {
    const digits = cleanPhoneNumber(this.value);
    if (digits.length === 11) {
      // const isConsentValid = validateConsent('footerConsent', 'footerConsent');
      // if (true) {
      autoSubmitForm(
        document.getElementById('contactFormFooter'),
        this,
        document.getElementById('footerFormMsg'),
        'footerPhone'
      );
      // }
    }
  });
}

// ======================== Форма чек-листа (email) ========================
const checklistForm = document.getElementById("checklistForm");
const checklistMsg = document.getElementById("checklistMsg");
if (checklistForm) {
  checklistForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("checklistEmail").value.trim();
    const isValid = validateEmail(email, "checklistEmail");
    if (!isValid) return;

    sendToBroker({ email, form: "checklist" }, (res) => {
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

// ======================== Заглушка для метрик ========================
console.log("Яндекс.Метрика и Google Analytics можно установить позже");

// ======================== Вспомогательная функция validateEmail ========================
function validateEmail(email, errorId) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError(errorId, "Введите корректный email адрес");
    return false;
  }
  showFieldError(errorId, "");
  return true;
}