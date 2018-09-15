const fs = require('fs'),
    TelegramBot = require('node-telegram-bot-api'),
    token = process.env.TOKEN,
    bot = new TelegramBot(token, { polling: true }),
    chineseConv = require('chinese-conv'),
    jsonfile = require('jsonfile')
var botData = jsonfile.readFileSync('botData.json'),
    group_link = "t.me/StickerGroup", // 群組連結
    groupID = process.env.GROUPID || -1001098976262, //群組 ID
    logChannel = -1001123393977;

if (!botData.msgtodel) {
    botData.msgtodel = {};
    console.log('已自動建立 botData.msgtodel')
    jsonfile.writeFileSync('botData.json', botData);
}
if (!botData.tips) {
    botData.tips = [
        '↔️ 使用 「#询问」 或 「!转繁体」 可以让传送的讯息变成繁体',
        '🔡 如果是英文標籤，在單字間加底線\n例如：#Cute_Cat',
        '🔍 在詢問貼圖前，可以先搜尋看看',
        '🔞 本群禁止限制級(R18)貼圖之詢問、發佈和討論',
    ];
    console.log('已自動建立 botData.tips')
    jsonfile.writeFileSync('botData.json', botData);
}

bot.getMe().then(function(me) {
    //發送啟動成功通知
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 取得台北時間
    nd = new Date(utc + (3600000 * 8));
    var start_time = nd.getFullYear() + '/' + (nd.getMonth() + 1) + '/' + nd.getDate() + ' ' +
        (nd.getHours() < 10 ? '0' + nd.getHours() : nd.getHours()) + ':' + (nd.getMinutes() < 10 ? '0' + nd.getMinutes() : nd.getMinutes()) + ':' + nd.getSeconds(); // 機器人啟動時間
    console.log("[系統]" + me.first_name + ' @' + me.username + " 在 " + start_time + " 時啟動成功");
    // 啟動時發給 Log 頻道說啟動成功
    bot.sendMessage(logChannel, "`[系統]`" + me.first_name + ' @' + me.username + " 在 " + start_time + " 時啟動成功", { parse_mode: "markdown" }).then((returnmsg) => {
        //bot.pinChatMessage(logChannel, returnmsg.message_id, { disable_notification: true })
    });
});


// 發送貼圖群通知
// 定時發送
var bulletin_send = function() {
    //如果有前一則公告，刪除他
    if (botData.msgtodel.tip)
        bot.deleteMessage(groupID, botData.msgtodel.tip)
    if (botData.msgtodel.msg)
        bot.deleteMessage(groupID, botData.msgtodel.msg)
    botData.msgtodel = {};
    // 傳送小提示
    var tip = botData.tips[Math.floor(Math.random() * botData.tips.length)].message;
    var pic = "https://placem.at/things?w=600&h=200&txt=小提示&random=" + Math.random().toString(36).substr(2);
    bot.sendPhoto(groupID, pic, { caption: tip }).then((msgreturn) => {
        botData.msgtodel.tip = msgreturn.message_id
        jsonfile.writeFileSync('botData.json', botData);
    });
    //傳送公告
    var text = "[公告]歡迎來到貼圖群，請詳細閱讀群規\ntelegra.ph/Sticker-Group-Rule-03-22";
    bot.sendMessage(groupID, text).then((msgreturn) => {
        botData.msgtodel.msg = msgreturn.message_id
        jsonfile.writeFileSync('botData.json', botData);
    })

};
setInterval(bulletin_send, 1000 * 60 * 60 * 2); //2hr

//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, function(msg) {
    var chatId = msg.chat.id; //用戶的ID
    var messageId = msg.message_id;
    let userLink = '[' + msg.from.first_name + '](tg://user?id=' + msg.from.id + ')：'
    if (msg.chat.id != "-1001098976262") {
        var callback = "嗨，這裡是貼圖群小助手！" +
            "\n聊天室ID：" + msg.chat.id +
            "\n訊息ID：" + messageId +
            "\n-----" +
            "\n加入貼圖群： " + group_link;
    } else {
        var callback = "嗨，" + userLink + " 這裡是貼圖群小助手！" +
            "\n聊天室ID：" + msg.chat.id +
            "\n訊息ID：" + messageId;
    }
    bot.sendMessage(chatId, callback, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
});

// Matches /echo [any]
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
//  /addtip 棒棒勝專用
bot.onText(/\/addtip (.+)/, function(msg, match) {
    if (msg.from.username == "gnehs_OwO") {
        botData.tips[botData.tips.length] = match[1]
        bot.sendMessage("215616188", '已添加', { reply_to_message_id: msg.message_id });
        jsonfile.writeFileSync('botData.json', botData);
    } else {
        bot.sendMessage(msg.chat.id, "此功能棒棒勝專用！", { reply_to_message_id: msg.message_id });
    }
});
//  /rmtip 棒棒勝專用
bot.onText(/\/rmtip (.+)/, function(msg, match) {
    if (msg.from.username == "gnehs_OwO") {
        botData.tips.splice(match[1], 1);
        bot.sendMessage("215616188", '已移除', { reply_to_message_id: msg.message_id });
        jsonfile.writeFileSync('botData.json', botData);
    } else {
        bot.sendMessage(msg.chat.id, "此功能棒棒勝專用！", { reply_to_message_id: msg.message_id });
    }
});
//  /viewtip 棒棒勝專用
bot.onText(/\/viewtip/, function(msg, match) {
    if (msg.from.username == "gnehs_OwO") {
        let resp = '';
        for (i in botData.tips) {
            resp += i + ':' + botData.tips[i].message + '\n'
        }
        bot.sendMessage("215616188", resp, { reply_to_message_id: msg.message_id, disable_web_page_preview: true });
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
    if (msg.text == undefined)
        var msgtext = "❓無法辨識之訊息"
    if (msg.sticker)
        var msgtext = msg.sticker.emoji + "️貼圖 " + msg.sticker.set_name
    if (msg.document)
        var msgtext = "📄檔案 " + msg.document.file_name
    if (msg.photo)
        var msgtext = "🖼圖片"
    if (msg.audio)
        var msgtext = "🎵音訊"
    if (msg.new_chat_members)
        var msgtext = "➕新成員"

    if (msg.chat.id == groupID) {
        var opt = {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '前往訊息',
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
    if (msg.from.username == "gnehs_OwO" && msg.chat.type == "private") {} else {
        bot.sendMessage(logChannel, SendLog2Ch, opt).then((returnmsg) => {
            if (msg.sticker)
                bot.sendSticker(logChannel, msg.sticker.file_id, { reply_to_message_id: returnmsg.message_id })
            if (msg.document)
                bot.sendSticker(logChannel, msg.document.file_id, { reply_to_message_id: returnmsg.message_id })
            if (msg.photo)
                bot.sendPhoto(logChannel, msg.photo.file_id, { reply_to_message_id: returnmsg.message_id })
            if (msg.audio)
                bot.sendAudio(logChannel, msg.audio.file_id, { reply_to_message_id: returnmsg.message_id })
            if (msgtext == "❓無法辨識之訊息")
                bot.forwardMessage(logChannel, msg.chat.id, msg.message_id)

        });
    }
    // 當有讀到文字時
    if (msg.text != undefined) {
        // 發 Ping 的時候回復
        if (msg.text.toLowerCase().indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
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
        if (msg.text.match(/询问|詢問/)) {
            let text;
            if (msg.text.match(/#询问#|#詢問#/)) {
                text = "**錯誤 - Tag 無法被正常偵測**\n兩個 tag 中間需有一個空格間隔！\n[查看正確的 #Tag 方式](https://telegra.ph/How-to-Use-Hashtags-on-Telegram-04-25)";
            } else if (msg.text.match("询问")) {
                let userLink = '[' + msg.from.first_name + '](tg://user?id=' + msg.from.id + ')：'
                text = userLink + chineseConv.tify(msg.text);
            }
            if (text)
                bot.sendMessage(msg.chat.id, text, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        } else if (msg.text.match("!转繁体")) {
            let userLink = '[' + msg.from.first_name + '](tg://user?id=' + msg.from.id + ')：'
            let text = userLink + chineseConv.tify(msg.text);
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
