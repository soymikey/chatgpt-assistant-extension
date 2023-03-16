import Sequelize from 'sequelize';
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
        console.log('连接数据库成功.');
    } catch (error) {
        console.error('连接数据库失败：:', error);
    }
}
// 调用测试连接函数
testConnection();


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
// 定义 question 模型
const Question = sequelize.define('Question', {
    content: Sequelize.STRING,
    sub: { type: Sequelize.STRING, primaryKey: true },

}, {
    tableName: 'questions'
})

export { User, Shortcut, Question }