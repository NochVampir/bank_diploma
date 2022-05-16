import {createMoney} from "@easymoney/money";

export const getMoneyObj = (money) => {
    return createMoney({
        amount: Math.floor(money),
        currency: "USD"
    })
}
