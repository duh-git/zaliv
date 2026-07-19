// APP_SCRIPT_URL = "asd"
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7NcguDr3Hx646jtX_5KvBZudmTkESZZpbZ8fODZYf-WRdsfHLpEJ2V0Ebu5tmttM/exec"


// window.addEventListener('scroll', () => {
//   const headerClassList = document.querySelector('header').classList;
//   window.scrollY > 400 ? headerClassList.add("sticky") : headerClassList.remove("sticky");
// });


// Отправка данных
const forms = document.querySelectorAll('form');

forms.forEach(form => {
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