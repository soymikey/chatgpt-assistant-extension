import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser'
import onerror from 'koa-onerror'
import morgan from "koa-morgan";
import path from "path";

import { ChatGPTAPI } from 'chatgpt'
import fs from "fs";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

import config from './config.js'
import db from './db.js'
import { errorModel, successModel } from './tools.js';
const app = new Koa();


const api = new ChatGPTAPI({
    apiKey: config.chatGPTAPI
})

const mockApi = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ text: '人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。' })
        }, 1000);
    });

}

//跨域控制
// app.use(async (ctx, next) => {
//     ctx.set('Access-Control-Allow-Origin', 'https://streetmusicadmin.migaox.com');
//     await next();
//   });
app.use(cors());
// error handler
onerror(app);
// middlewares
app.use(
    bodyParser({
        enableTypes: ["json", "form", "text"],
        extendTypes: {
            text: ['text/xml', 'application/xml']
        }
    })
);

const logFileName = path.join(__dirname, "logs", "access.log");
const writeStream = fs.createWriteStream(logFileName, {
    flags: "a",
});
app.use(
    morgan("combined", {
        stream: writeStream,
    })
);


app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});




// response

app.use(async ctx => {

    //请求
    if (ctx.request.path === '/api/getAnswer' && ctx.method === 'POST') {
        try {
            const { userInput = '', highlightContent = '' } = ctx.request.body
            const questionContent = `${userInput}\n${highlightContent}`
            console.log('问题:==========================================',);
            console.log(questionContent);
            console.log("==========================================");
            // const res = await mockApi()
            const res = await api.sendMessage(questionContent)
            console.log("答案:", res.text);
            ctx.body = successModel(res)
        } catch (error) {
            console.log('error1:', error);
            console.log('error1 Object key:', Object.keys(error));
            ctx.body = errorModel(error)
        }
    }


    //  user数据结构
    // const mockDB = {
    //     123: {
    //         username: 'Michael',
    //         userId:123,
    //         shortcutList: [{
    //             id: "1",
    //             title: "Ant1Ant1",
    //         },
    //         {
    //             id: "2",
    //             title: "Ant Design Title 2",
    //         },
    //         { id: "3", title: "Ant Design Title 3" },
    //         { id: "4", title: "Ant Design Title 4" },]
    //     }
    // }



    //用户接口
    else if (ctx.request.path === '/api/getUser' && ctx.method === 'POST') {
        try {

            const { userId } = ctx.request.body
            const userInfoDB = db.get(userId)
            if (!userInfoDB) {
                ctx.body = errorModel('user not found')
                return
            }
            ctx.body = successModel(userInfoDB);
        } catch (error) {
            ctx.body = errorModel(error)
        }
    }
    else if (ctx.request.path === '/api/updateUser' && ctx.method === 'POST') {

        try {
            console.log('ctx.request.body', ctx.request.body);

            const body = ctx.request.body
            const { userId } = body
            const userInfoDB = db.get(userId)
            if (!userInfoDB) {
                ctx.body = errorModel('user not found')
                return
            }
            db.set(userId, { ...userInfoDB, ...body })
            ctx.body = successModel();
        } catch (error) {
            console.log('error', error);
            ctx.body = errorModel(error)

        }
    }
    else if (ctx.request.path === '/api/registerUser' && ctx.method === 'POST') {
        try {
            const body = ctx.request.body
            const userId = body.userId
            const userInfoDB = db.get(userId)
            if (userInfoDB) {
                ctx.body = errorModel('user already exist')
                return
            }
            db.set(userId, body)
            ctx.body = successModel();
        } catch (error) {
            ctx.body = errorModel(error)

        }
    }


    else {
        ctx.status = 404;
    }

});


app.listen(3001);