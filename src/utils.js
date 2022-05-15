const {createMoney} = require("@easymoney/money");

module.exports.getMoneyObj = (money) => {
    return createMoney({
        amount: Math.floor(money),
        currency: "USD"
    })
}
