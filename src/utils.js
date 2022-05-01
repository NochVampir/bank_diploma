const {createMoney} = require("@easymoney/money");

module.exports.getMoneyObj = (money) => {
    return createMoney({
        amount: money,
        currency: "USD"
    })
}