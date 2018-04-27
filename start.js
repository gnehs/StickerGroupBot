var TelegramBot = require('node-telegram-bot-api'),
    token = process.env.TOKEN,
    bot = new TelegramBot(token, { polling: true });
var chineseConv = require('chinese-conv'); //簡轉繁
group_link = "t.me/StickerGroup"; // 群組連結
groupID = "-1001098976262"; //群組 ID
logChannel = -1001123393977
msgtodel = '';

//發送啟動成功通知
// 建立現在時間的物件
d = new Date();
// 取得 UTC time
utc = d.getTime() + (d.getTimezoneOffset() * 60000);
// 取得台北時間
nd = new Date(utc + (3600000 * 8));
var start_time = nd.getFullYear() + '/' + (nd.getMonth() + 1) + '/' + nd.getDate() + ' ' +
    (nd.getHours() < 10 ? '0' + nd.getHours() : nd.getHours()) + ':' + (nd.getMinutes() < 10 ? '0' + nd.getMinutes() : nd.getMinutes()) + ':' + nd.getSeconds(); // 機器人啟動時間
console.log("[系統]貼圖群小助手在 " + start_time + " 時啟動成功");

// 啟動時發給 Log 頻道說啟動成功
bot.sendMessage(logChannel, "`[系統]`貼圖群小助手在 " + start_time + " 時啟動成功", { parse_mode: "markdown" }).then((returnmsg) => {
    bot.pinChatMessage(logChannel, returnmsg.message_id, { disable_notification: true })
});


// 發送貼圖群通知
// 定時發送
var bulletin_send = function() {
    //如果有前一則公告，刪除他
    if (msgtodel) {
        bot.deleteMessage(groupID, msgtodel)
        msgtodel = '';
    }
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 取得台北時間
    nd = new Date(utc + (3600000 * 8));
    // 傳送的文字
    var text = "[公告]歡迎來到貼圖群，請詳細閱讀群規\n在詢問貼圖前，建議可以先搜尋看看\ntelegra.ph/Sticker-Group-Rule-03-22";
    //傳送公告
    bot.sendMessage(groupID, text).then((msgreturn) => {
        msgtodel = msgreturn.message_id
        console.log(msgtodel)
    })
};
setInterval(bulletin_send, 1000 * 60 * 60 * 2); //2hr

//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, function(msg) {
    var chatId = msg.chat.id; //用戶的ID
    var messageId = msg.message_id;

    if (msg.chat.id != "-1001098976262") {
        var callback = "嗨，這裡是貼圖群小助手！" +
            "\n聊天室ID：" + msg.chat.id +
            "\n訊息ID：" + messageId +
            "\n-----" +
            "\n加入貼圖群： " + group_link;
    } else {
        var callback = "嗨，" + msg.from.first_name + " 這裡是貼圖群小助手！" +
            "\n聊天室ID：" + msg.chat.id +
            "\n訊息ID：" + messageId;
    }
    bot.sendMessage(chatId, callback, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function(msg, match) {
    var resp = match[1];
    if (!match[1]) { var resp = "你沒傳訊息"; }
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
});

//  /echoToGroup 棒棒勝專用
bot.onText(/\/echognehs (.+)/, function(msg, match) {
    if (msg.from.username == "gnehs_OwO") {
        var sent_text = match[1].split(" ")
        bot.sendMessage(sent_text[0], sent_text[1], { parse_mode: "HTML", });
        bot.sendMessage("215616188", "不曉得發送有沒有成功喔", { reply_to_message_id: msg.message_id });
    } else {
        bot.sendMessage(msg.chat.id, "此功能棒棒勝專用！", { reply_to_message_id: msg.message_id });
    }
});
//  /leaveChat 棒棒勝專用
bot.onText(/\/leave (.+)/, function(msg, match) {
    if (msg.from.username == "gnehs_OwO") {
        bot.leaveChat(match[1]);
        bot.sendMessage("215616188", "不曉得有沒有成功喔", { reply_to_message_id: msg.message_id });
    } else {
        bot.sendMessage(msg.chat.id, "此功能棒棒勝專用！", { reply_to_message_id: msg.message_id });
    }
});

//鍵盤新增跟移除
bot.onText(/\/addKeyboard/, function(msg) {
    if (msg.from.username == "gnehs_OwO") {
        const opts = {
            reply_markup: JSON.stringify({
                keyboard: [
                    ['歡迎光臨貼圖群']
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
                reply_to_message_id: msg.message_id
            })
        };
        bot.sendMessage(msg.chat.id, '鍵盤已新增', opts);
    } else {
        bot.sendMessage(msg.chat.id, "此功能棒棒勝專用！", { reply_to_message_id: msg.message_id });
    }
});

bot.onText(/\/removeKeyboard/, function(msg) {
    if (msg.from.username == "gnehs_OwO") {
        const opts = {
            reply_markup: JSON.stringify({
                remove_keyboard: true,
                reply_to_message_id: msg.message_id
            })
        };
        bot.sendMessage(msg.chat.id, '鍵盤已移除', opts);
    } else {
        bot.sendMessage(msg.chat.id, "此功能棒棒勝專用！", { reply_to_message_id: msg.message_id });
    }
});

bot.on('message', (msg) => {
    // 將所有傳給機器人的訊息轉到頻道
    var msgtext = msg.text
    if (msg.text == undefined) {
        var msgtext = "❓無法辨識之訊息"
    }
    if (msg.sticker) {
        var msgtext = msg.sticker.emoji + "️貼圖 " + msg.sticker.set_name
    }
    if (msg.new_chat_members) {
        var msgtext = "➕新成員"
    }
    if (msg.document) {
        var msgtext = "📄文件 " + msg.document.file_name
    }
    if (msg.audio) {
        var msgtext = "🎵音樂 " + msg.audio.title
    }
    if (msg.video) {
        var msgtext = "🎬影片 " + msg.video.mime_type
    }
    if (msg.contact) {
        var msgtext = "👤聯絡人 " + msg.contact.first_name + '\n 號碼：' + msg.contact.phone_number
    }
    if (msg.chat.id == -1001098976262) {
        var opt = {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '前往訊息',
                        // we shall check for this value when we listen
                        // for "callback_query"
                        url: 'https://t.me/StickerGroup/' + msg.message_id
                    }]
                ]
            }
        }
    } else {
        var opt = { parse_mode: "HTML", disable_web_page_preview: true }
    }
    var SendLog2Ch = "<code>[訊息]</code>" +
        "<code>" +
        "\n 用戶：" + msg.from.first_name + " @" + msg.from.username +
        "\n 聊天：" + msg.chat.title + " | " + msg.chat.id + " | " + msg.chat.type +
        "\n 編號：" + msg.message_id +
        "\n 時間：" + msg.date +
        "\n 訊息：" + msgtext + "</code>" +
        "\n<a href='tg://user?id=" + msg.from.id + "'>#UserName_" + msg.from.username + "</a> #Name_" + msg.from.first_name + " #UserID_" + msg.from.id
    bot.sendMessage("-1001123393977", SendLog2Ch, opt).then((returnmsg) => {
        if (msg.sticker) {
            bot.sendSticker("-1001123393977", msg.sticker.file_id, { reply_to_message_id: returnmsg.message_id })
        }
    });
    // 當有讀到文字時
    if (msg.text != undefined) {
        // 發 Ping 的時候回復
        if (msg.text.toLowerCase().indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        if (msg.text.indexOf("貼圖") > -1) {
            if (msg.text.indexOf("請問") > -1 || msg.text.indexOf("求") > -1 || msg.text.indexOf("有") > -1) {
                bot.sendMessage(msg.chat.id, "詢問或發佈貼圖時請使用標籤，這樣才能被正確索引\n像是 `#詢問 #妖嬌美麗的恐龍 #會飛的`\n*＊本功能測試中，誤報請私* [@gnehs_OwO](https://t.me/gnehs_OwO) ＊", {
                    parse_mode: "markdown",
                    reply_to_message_id: msg.message_id,
                    disable_web_page_preview: true
                });
            }
        }
        if (msg.text.toLowerCase().indexOf("喵") === 0) {
            bot.sendMessage(msg.chat.id, "`HTTP/1.1 200 OK`", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("始春") === 0) {
            bot.sendMessage(msg.chat.id, "延期", { reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("汪") === 0) {
            bot.sendMessage(msg.chat.id, "(摸摸", { reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("!转繁体") > -1) {
            var userLink = '[' + msg.from.first_name + '](tg://user?id=' + msg.from.id + ')：'
            var text = userLink + chineseConv.tify(msg.text);
            bot.sendMessage(msg.chat.id, text, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
        // 辨識是否 Tag 正確
        if (msg.text.toLowerCase().indexOf("询问") > -1 || msg.text.toLowerCase().indexOf("詢問") > -1) {
            var text = 'owo'
            if (msg.text.toLowerCase().indexOf("#询问#") > -1 || msg.text.toLowerCase().indexOf("#詢問#") > -1 || msg.text.toLowerCase().indexOf("＃") > -1) {
                var text = "**錯誤 - Tag 無法被正常偵測**\n[查看正確的 #Tag 方式](https://telegra.ph/How-to-Use-Hashtags-on-Telegram-04-25)";
            } else if (msg.text.toLowerCase().indexOf("询问") > -1) {
                var userLink = '[' + msg.from.first_name + '](tg://user?id=' + msg.from.id + ')：'
                var text = userLink + chineseConv.tify(msg.text);
            }
            if (text != 'owo')
                bot.sendMessage(msg.chat.id, text, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
        if (msg.text.indexOf("#") === 0) {
            if (msg.text.match(/#/ig).length !== msg.entities.reduce((n, i) => (i.type === 'hashtag') ? n + 1 : n, 0)) {
                var text = "**錯誤 - Tag 無法被正常偵測**\n[查看正確的 #Tag 方式](https://telegra.ph/How-to-Use-Hashtags-on-Telegram-04-25)";
                if (msg.entities.reduce((n, i) => (i.type === 'bold') ? n + 1 : n, 0) > 0) {
                    var text = "**錯誤 - Tag 因為粗體而無法被正常偵測**\n若您是 iOS 使用者，可能是粗體尚未關閉導致的\n[查看如何解決 iOS Tag 失敗的問題](https://blog.gnehs.net/telegram-ios-tag)";
                }
                bot.sendMessage(msg.chat.id, text, { parse_mode: "markdown", reply_to_message_id: msg.message_id })
            }
        }
    }
});