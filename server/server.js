import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser'

import { ChatGPTAPI } from 'chatgpt'

import db from './db.js'
const app = new Koa();

const api = new ChatGPTAPI({
    apiKey: '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'
})

const mockApi = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            resolve({ text: '人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。' })
        }, 1000);
    });

}


app.use(cors());
app.use(bodyParser());

// logger

app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// response

app.use(async ctx => {

    if (ctx.url === '/' && ctx.method === 'GET') {
        try {
            const { input = '', content = '' } = ctx.query
            const question = `${input}\n${content}`
            const res = await mockApi()
            // const res = await api.sendMessage(question)
            ctx.body = res.text;
        } catch (error) {
            ctx.body = 'Error, Try later';
        }
    } else if (ctx.url === '/update' && ctx.method === 'POST') {
        console.log('ctx.request.body', ctx.request.body);
        db.set("shortcutList", ctx.request.body.shortcutList)
        ctx.body = 'ok';
    }


    else {
        ctx.status = 404;
    }

});


app.listen(3001);