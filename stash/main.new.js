const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7NcguDr3Hx646jtX_5KvBZudmTkESZZpbZ8fODZYf-WRdsfHLpEJ2V0Ebu5tmttM/exec"


// Отправка данных
document.querySelectorAll('form')
  .forEach(form => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const resultOutput = form.querySelector(".result");
      resultOutput.textContent = 'Отправка...';

      try {
        const formData = new FormData(form);
        // const response = await fetch(APP_SCRIPT_URL, {
        //   method: 'POST',
        //   body: formData
        // });

        if (response.ok) {
          resultOutput.textContent = 'Заявка успешно отправлена!';
        } else {
          resultOutput.textContent = 'Ошибка сервера. Попробуйте позже.';
        }
      } catch (error) {
        resultOutput.textContent = 'Ошибка сети. Проверьте соединение.';
      }
    });
  })

function toggleHeaderMenu() {
  document.querySelectorAll("header nav, header .contacts").forEach(el => el.toggleAttribute("open"))
}

document.querySelectorAll("header nav a").forEach(el => el.addEventListener("click", toggleHeaderMenu))