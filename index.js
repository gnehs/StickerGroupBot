var TelegramBot = require('node-telegram-bot-api'),
    token = 'BotToken:Here',
    bot = new TelegramBot(token, { polling: true });

var OpenCC = require('./opencc'); //簡轉繁
var opencc = new OpenCC('s2t.json');

var group_link = "t.me/StickerGroup"; // 群組連結

//發送啟動成功通知
// 建立現在時間的物件
d = new Date();
// 取得 UTC time
utc = d.getTime() + (d.getTimezoneOffset() * 60000);
// 取得台北時間
nd = new Date(utc + (3600000 * 8));
var start_time = nd.getHours() + ":" + nd.getMinutes() + ":" + nd.getSeconds(); // 機器人啟動時間
console.log("[系統]貼圖群小助手在 " + start_time + " 時啟動成功");

// 啟動時發給 Log 頻道說啟動成功
bot.sendMessage("-1001123393977", "`[系統]`貼圖群小助手在 " + start_time + " 時啟動成功", { parse_mode: "markdown" });
// 發送貼圖群通知
// 定時發送
var func = function() {
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 取得台北時間
    nd = new Date(utc + (3600000 * 8));
    // 傳送的文字
    var text = "歡迎來到貼圖群，請詳細閱讀群規\ntelegra.ph/Sticker-Group-Rule-03-22";
    // 凌晨不發
    if (nd.getHours() > 6) {
        bot.sendMessage("-1001098976262", text);
    }
};
setInterval(func, 7200000);

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
    if (msg.text == undefined && msg.sticker != undefined) {
        msgtext = msg.sticker.set_name
    } else if (msg.text == undefined && new_chat_members != undefined) {
        msgtext = "新成員: @" + msg.new_chat_members.username + " " + msg.new_chat_members.first_name
    } else if (msg.text == undefined) {
        msgtext = "無法辨識之訊息"
    }
    var SendLog2Ch = "<code>[訊息]</code>" +
        "<code>" +
        "\n 使用者　：" + msg.from.first_name + " @" + msg.from.username +
        "\n 聊天室　：" + msg.chat.title + " | " + msg.chat.id + " | " + msg.chat.type +
        "\n 訊息編號：" + msg.message_id +
        "\n 發送時間：" + msg.date +
        "\n 訊息文字：" + msg.text + "</code>" +
        "\n#UserName_" + msg.from.username + " #Name_" + msg.from.first_name + " #UserID_" + msg.from.id
    msg.from.id
    bot.sendMessage("-1001123393977", SendLog2Ch, { parse_mode: "HTML" });
    // 當有讀到文字時
    if (msg.text != undefined) {
        // 發 Ping 的時候回復
        if (msg.text.toLowerCase().indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        if (msgText.indexOf("貼圖") > -1) {
            if (msgText.indexOf("請問") > -1 || msgText.indexOf("求") > -1 || msgText.indexOf("有") > -1) {
                bot.sendMessage(msg.chat.id, "詢問或發佈貼圖時請使用標籤，這樣才能被正確索引\n像是 `#詢問 #妖嬌美麗的恐龍 #會飛的`\n*＊本功能測試中，誤報請私* [@gnehs_OwO](https://t.me/gnehs_OwO) ＊", { parse_mode: "markdown", reply_to_message_id: msg.message_id, disable_web_page_preview: true });
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
        // 辨識是否 Tag 正確
        if (msg.text.toLowerCase().indexOf("#询问") === 0) {
            var text = opencc.convertSync(msg.text);
            bot.sendMessage(msg.chat.id, text, { reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("#詢問#") === 0) {
            var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                "\n<a href='http://telegra.ph/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A2%BA%E7%9A%84-Tag-07-25'>查看正確的 #Tag 方式</a>";
            bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id });
        }
        if (msg.text.indexOf("＃詢問") > -1) {
            var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                "\n您的輸入設定似乎被設為全形，請換成半形後再試試";
            bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id });
        }
        if (msg.text.indexOf("#") === 0) {
            if (msg.text.match(/#/ig).length !== msg.entities.reduce((n, i) => (i.type === 'hashtag') ? n + 1 : n, 0)) {
                var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                    "\n<a href='http://telegra.ph/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A2%BA%E7%9A%84-Tag-07-25'>查看正確的 #Tag 方式</a>";
                if (msg.entities.reduce((n, i) => (i.type === 'bold') ? n + 1 : n, 0) > 0) {
                    var send = "<b>錯誤 - Tag 因為粗體而無法被正常偵測</b>" +
                        "\n若您是 iOS 使用者，可能是粗體尚未關閉導致的" +
                        "\n<a href='https://blog.gnehs.net/telegram-ios-tag'>查看如何解決 iOS Tag 失敗的問題</a>";
                }
                bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id })
            }
        }
    }
});