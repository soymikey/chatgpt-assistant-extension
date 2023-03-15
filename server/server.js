import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser'
import onerror from 'koa-onerror'
import morgan from "koa-morgan";
import path from "path";
import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

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

// 初始化 Sequelize 实例
const sequelize = new Sequelize('chatgpt-assistant', 'root', 'yoursecurepassword', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});
// 测试数据库连接
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// 调用测试连接函数
testConnection();

// 定义 test 模型
// const Test = sequelize.define('Test', {
//     name: Sequelize.STRING
// }, {
//     tableName: 'tests'
// })
// 定义 User 模型
const User = sequelize.define('User', {
    id: Sequelize.STRING,
    email: Sequelize.STRING,
    email_verified: Sequelize.BOOLEAN,
    family_name: Sequelize.STRING,
    given_name: Sequelize.STRING,
    locale: Sequelize.STRING,
    name: Sequelize.STRING,
    picture: Sequelize.STRING,
    sub: { type: Sequelize.STRING, primaryKey: true }
}, {
    tableName: 'users'
})
// 定义 Shortcut 模型
const Shortcut = sequelize.define('Shortcut', {
    content: Sequelize.STRING,
    sub: { type: Sequelize.STRING, primaryKey: true },

}, {
    tableName: 'shortcuts'
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
            const res = await mockApi()
            // const res = await api.sendMessage(questionContent)
            console.log("答案:", res.text);
            ctx.body = successModel(res)
        } catch (error) {
            console.log('获取答案Error:', error);
            ctx.body = errorModel(error)
        }
    }

    //===============================用户接口===============================
    //查找用户
    else if (ctx.request.path === '/api/user/get' && ctx.method === 'POST') {
        try {

            const { sub } = ctx.request.body
            const user = await User.findOne({ where: { sub } });
            if (!user) {
                ctx.body = errorModel('User does not exist.')
                return
            }
            ctx.body = successModel(user);
        } catch (error) {
            console.log('查找用户Error:', error);
            ctx.body = errorModel(error)
        }
    }
    // 更新用户
    else if (ctx.request.path === '/api/user/update' && ctx.method === 'POST') {

        try {
            const { sub, name } = ctx.request.body
            const user = await User.findOne({ where: { sub } });
            user.name = name;
            await user.save();
            ctx.body = successModel();
        } catch (error) {
            console.log('更新用户Error:', error);
            ctx.body = errorModel(error)

        }
    }
    //删除用户
    else if (ctx.request.path === '/api/user/delete' && ctx.method === 'POST') {

        try {
            const { sub } = ctx.request.body
            await User.destroy({ where: { sub } });

            ctx.body = successModel();
        } catch (error) {
            console.log('删除用户Error:', error);

            ctx.body = errorModel(error)

        }
    }
    //插入用户
    else if (ctx.request.path === '/api/user/create' && ctx.method === 'POST') {
        try {
            const {
                sub,
                name,
                given_name,
                family_name,
                picture,
                email,
                locale, email_verified
            } = ctx.request.body
            const userExist = await User.findOne({ where: { sub } });
            if (!userExist) {

                await User.create({
                    email,
                    email_verified: email_verified ? 1 : 0,
                    family_name,
                    given_name,
                    locale,
                    name,
                    picture,
                    sub,
                    id: uuidv4(),
                })
            }
            ctx.body = successModel();
        } catch (error) {
            console.log('插入用户Error:', error);

            ctx.body = errorModel(error)

        }
    }
    //===============================shortcut接口===============================
    //查找shortcut
    else if (ctx.request.path === '/api/shortcut/get' && ctx.method === 'POST') {
        try {

            const { sub } = ctx.request.body
            const shortcut = await Shortcut.findOne({ where: { sub } });
            if (!shortcut) {
                ctx.body = successModel([]);
                return
            }
            ctx.body = successModel(JSON.parse(shortcut.content));
        } catch (error) {
            console.log('查找shortcutError:', error);
            ctx.body = errorModel(error)
        }
    }
    // 更新shortcut
    else if (ctx.request.path === '/api/shortcut/update' && ctx.method === 'POST') {
        try {
            const { content, sub } = ctx.request.body
            const shortcut = await Shortcut.findOne({ where: { sub } });
            if (!shortcut) {
                await Shortcut.create({
                    sub,
                    content
                })
            } else {
                shortcut.content = content;
                await shortcut.save();
            }

            ctx.body = successModel();
        } catch (error) {
            console.log('更新用户Error:', error);
            ctx.body = errorModel(error)

        }
    }

    else {
        ctx.status = 404;
    }

});


app.listen(3001);