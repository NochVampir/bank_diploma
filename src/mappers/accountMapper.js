export const accountMapper = (dbAccount) => ({
    id: dbAccount.id,
    amount: dbAccount.amount,
    nickname: dbAccount.nickname,
    operationNumber: dbAccount.operationNumber,
    createdAt: dbAccount.createdAt,
    updatedAt: dbAccount.updatedAt
})
