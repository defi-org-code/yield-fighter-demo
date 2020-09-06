const {
    BN,
} = require('@openzeppelin/test-helpers');

const bn = n => new BN(n);

module.exports = {
    MIN_POWER_TOKEN_BALANCER_RESERVE: bn("10000000000000000000"),
    BALANCER_POWER_TOKEN_WEIGHT: bn("20000000000000000"),
    REWARDS_BASE: bn(100000).mul(bn(10).pow(bn(18))),

    STATE_FIGHTING: bn(1),
    STATE_FIGHTING_COMPLETE: bn(2),
    STATE_FARMING: bn(3)
}