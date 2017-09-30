//var TelegramBot = require('node-telegram-bot-api');
//var token = '111:22:333';
//var bot = new TelegramBot(token, { polling: true });
/**
 * This example demonstrates setting up webhook
 * on the OpenShift platform.
 */

const TOKEN = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');
// See https://developers.openshift.com/en/node-js-environment-variables.html
const options = {
    webHook: {
        port: process.env.OPENSHIFT_NODEJS_PORT,
        host: process.env.OPENSHIFT_NODEJS_IP,
        // you do NOT need to set up certificates since OpenShift provides
        // the SSL certs already (https://<app-name>.rhcloud.com)
    },
};
// OpenShift routes from port :443 to OPENSHIFT_NODEJS_PORT
const domain = process.env.OPENSHIFT_APP_DNS;
const url = `${domain}:8080`;
const bot = new TelegramBot(TOKEN, options);


// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${TOKEN}`);

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
// 啟動時先執行一次
bot.sendMessage("-1001098976262", "歡迎來到貼圖群，發訊息前，記得先閱讀群規\ntelegra.ph/Sticker-Group-Rule-03-22");
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
        var callback = "嗨，這裡是貼圖群小助手！" +
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
    var userInfo =
        "<code>[Message]" +
        "\nFirstName：" + msg.from.first_name +
        "\nLastName：" + msg.from.last_name +
        "\nUserID：" + msg.from.id +
        "\nUsername：" + "@" + msg.from.username +
        "\nLanguageCode：" + msg.from.language_code + "</code>";
    if (msg.chat.type === "supergroup") { var chatType = "超級群組"; var chatTitle = msg.chat.title; }
    if (msg.chat.type === "private") { var chatType = "私訊"; var chatTitle = msg.from.first_name + " " + msg.from.last_name; }
    if (msg.chat.type === "group") { var chatType = "群組"; var chatTitle = msg.chat.title; }
    var chatInfo =
        "\n<code>ChatTitle：" + chatTitle +
        "\nChatID：" + msg.chat.id +
        "\nType：" + chatType +
        "\nMessageId：" + msg.message_id +
        "\nText" + msg.text + "</code>";
    var SendLog2Ch = userInfo + "\n---" + chatInfo
    bot.sendMessage("-1001123393977", SendLog2Ch, { parse_mode: "HTML" });
    // 當有讀到文字時
    if (msg.text != undefined) {
        // 發 Ping 的時候回復
        if (msg.text.toLowerCase().indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("喵") === 0) {
            bot.sendMessage(msg.chat.id, "`HTTP /1.1 200 OK.`", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
        // 辨識是否 Tag 正確
        if (msg.text.indexOf("#") === 0) {
            if (msg.text.match(/#/ig).length !== msg.entities.reduce((n, i) => (i.type === 'hashtag') ? n + 1 : n, 0)) {
                var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                    "\n<a href='http://telegra.ph/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A2%BA%E7%9A%84-Tag-07-25'>查看正確的 #Tag 方式</a>";
                if (msg.entities.reduce((n, i) => (i.type === 'bold') ? n + 1 : n, 0) > 0) {
                    var send = "<b>錯誤 - Tag 因為粗體而無法被正常偵測</b>" +
                        "\n若您是 iOS 使用者，可能是粗體尚未關閉導致的" +
                        "\n<a href='https://gnehs.com.tw/telegram-ios-tag/'>查看如何解決 iOS Tag 失敗的問題</a>";
                }
                bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id, disable_web_page_preview: true })
            }
        }
        if (msg.text.toLowerCase().indexOf("#询问") === 0) {
            bot.sendMessage(msg.chat.id, "#詢問", { reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("#詢問#") === 0) {
            var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                "\n<a href='http://telegra.ph/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A2%BA%E7%9A%84-Tag-07-25'>查看正確的 #Tag 方式</a>";
            bot.sendMessage(msg.chat.id, send, { reply_to_message_id: msg.message_id });
        }
    }
});