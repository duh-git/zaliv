var SHEET_NAME = "Заявки"; // Название листа в гугл таблице
var EMAIL = "ВАША_ПОЧТА"
var BOT_TOKEN = 'ВАШ_ТОКЕН_ТГ_БОТА';
var CHAT_ID = 'ВАШ_ТГ_ID';

function doPost(e) {
    try {
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = doc.getSheetByName(SHEET_NAME);
        var formData = e.parameter; // Данные из формы

        var timestamp = new Date().toLocaleString(); // Временная отметка
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

        // Строим строку для сохранения
        var newRow = headers.map(function (header) {
            if (header.toLowerCase() === 'timestamp') {
                return timestamp;
            } else {
                return formData[header] || '';
            }
        });

        // Сохраняем в таблицу
        sheet.getRange(sheet.getLastRow() + 1, 1, 1, newRow.length).setValues([newRow]);

        // Отправляем уведомление
        MailApp.sendEmail(EMAIL, 'Новая заявка',
            'Данные: ' + JSON.stringify(formData));

        // Формирование телеграм сообщения
        var msg = '🔔 <b>Новая заявка!</b>\n\n';
        msg += '📞 <b>Телефон:</b> ' + (formData.phone || 'Не указан') + '\n';
        msg += '<b>via:</b> ' + (formData.form || 'None') + '\n';
        msg += '\n📅 ' + timestamp

        // Отправка сообщения в телеграм
        sendTelegramMessage(msg);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}


function sendTelegramMessage(message) {
    // Формируем URL для запроса к API Telegram
    var url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage';

    var payload = {
        'chat_id': CHAT_ID,
        'text': message,
        'parse_mode': 'HTML' // Опционально, позволяет использовать HTML-разметку в сообщении
    };

    var options = {
        'method': 'post',
        'payload': payload
    };

    // Отправляем запрос
    UrlFetchApp.fetch(url, options);
}