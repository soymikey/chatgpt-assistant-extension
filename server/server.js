import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser'

import { ChatGPTAPI } from 'chatgpt'
import Stripe from 'stripe'

import db from './db.js'
const app = new Koa();

const stripe = new Stripe('sk_test_51Bq0KgHIArwfBLFuAX7eaDOiPgKILjlavaSlZA3pDhtgPpc44pagdCYbtL1riZlrNXJfERZWoiJ0cSKSrpNWF6sJ001BhtV4Zi');

const api = new ChatGPTAPI({
    apiKey: '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'
})

const mockApi = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            resolve({ text: '人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。人生的意义是什么？我想说的是，人生的意义就在于你自己，只要你坚持追求自己的目标，不断努力，不断实现自己的理想，那么你的人生才有意义。' })
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

//model
function successModel(data, message) {
    const obj = { errno: 0 };
    if (typeof data === "string") {
        obj.message = data;
        data = null;
        message = null;
    }
    if (data) {
        obj.data = data;
    }
    if (message) {
        obj.message = message;
    }
    return obj;
}
function errorModel(data, message) {
    const obj = { errno: -1 };
    if (typeof data === "string") {
        obj.message = data;
        data = null;
        message = null;
    }
    if (data) {
        obj.data = data;
    }
    if (message) {
        obj.message = message;
    }
    return obj;
}



// response

app.use(async ctx => {

    //请求
    if (ctx.request.path === '/api/getAnswer' && ctx.method === 'POST') {
        try {

            const { userInput = '', highlightContent = '' } = ctx.request.body

            const questionContent = `${userInput}\n${highlightContent}`
            console.log('问题:', questionContent);
            const res = await mockApi()
            // const res = await api.sendMessage(questionContent)
            ctx.body = successModel(res)
        } catch (error) {
            ctx.body = errorModel(error)
        }
    }
    //支付-二期的时候再弄
    else if (ctx.request.path === '/apipay' && ctx.method === 'POST') {
        try {
            const { amount } = ctx.query
            const result = await stripe.charges.create({
                amount: amount,
                currency: 'usd',
                source: 'tok_visa', // replace with a valid test card token
                description: 'Charge for $300'
            });
            ctx.body = result.amount;
        } catch (error) {
            console.log('error', error);
            ctx.body = 'Error, Try later';
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



    //测试接口
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