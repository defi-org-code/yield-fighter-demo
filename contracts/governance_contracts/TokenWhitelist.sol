pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";

import "./ITokenWhitelist.sol";

contract TokenWhitelist is ITokenWhitelist, Ownable {

    event TokenAdded(address token);

    struct TokenEntry {
        address addr;
    }

    mapping(address => TokenEntry) public whitelist;

    constructor() public {
        address[] memory initialTokens = new address[](165);
        initialTokens[0] = 0x946551DD05C5Abd7CC808927480225ce36D8c475;  // BigONE Token
        initialTokens[1] = 0x1FCdcE58959f536621d76f5b7FfB955baa5A672F;  // The Force Token
        initialTokens[2] = 0x04abEdA201850aC0124161F037Efd70c74ddC74C;  // NEST
        initialTokens[3] = 0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0;  // DForce
        initialTokens[4] = 0x45f24BaEef268BB6d63AEe5129015d69702BCDfa;  // YFValue
        initialTokens[5] = 0xa1d0E215a23d7030842FC67cE582a6aFa3CCaB83;  // YFII.finance
        initialTokens[6] = 0xAba8cAc6866B83Ae4eec97DD07ED254282f6aD8A;  // YAMv2
        initialTokens[7] = 0xfffffffFf15AbF397dA76f1dcc1A1604F45126DB;  // FalconSwap Token
        initialTokens[8] = 0xc75F15AdA581219c95485c578E124df3985e4CE0;  // zzz.finance
        initialTokens[9] = 0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2;  // Meta
        initialTokens[10] = 0x2ba592F78dB6436527729929AAf6c908497cB200;  // Cream
        initialTokens[11] = 0x68A118Ef45063051Eac49c7e647CE5Ace48a68a5;  // $BASED
        initialTokens[12] = 0x28cb7e841ee97947a86B06fA4090C8451f64c0be;  // YFLink
        initialTokens[13] = 0x6B3595068778DD592e39A122f4f5a5cF09C90fE2;  // SushiToken
        initialTokens[14] = 0xa66Daa57432024023DB65477BA87D4E7F5f95213;  // HuobiPoolToken
        initialTokens[15] = 0xcAaa93712BDAc37f736C323C93D4D5fDEFCc31CC;  // CryptalDash
        initialTokens[16] = 0x2AF5D2aD76741191D15Dfe7bF6aC92d4Bd912Ca3;  // Bitfinex LEO Token
        initialTokens[17] = 0xD45247c07379d94904E0A87b4481F0a1DDfa0C64;  // Buggyra Coin Zero
        initialTokens[18] = 0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828;  // UMA Voting Token v1
        initialTokens[19] = 0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B;  // NXM
        initialTokens[20] = 0xb683D83a532e2Cb7DFa5275eED3698436371cc9f;  // BTU Protocol
        initialTokens[21] = 0x0d438F3b5175Bebc262bF23753C1E53d03432bDE;  // Wrapped NXM
        initialTokens[22] = 0xF1290473E210b2108A85237fbCd7b6eb42Cc654F;  // HEDG
        initialTokens[23] = 0x476c5E26a75bd202a9683ffD34359C0CC15be0fF;  // Serum
        initialTokens[24] = 0x0Ae055097C6d159879521C384F1D2123D1f195e6;  // STAKE
        initialTokens[25] = 0xB91318F35Bdb262E9423Bc7c7c2A3A93DD93C92C;  // Nuls
        initialTokens[26] = 0xcfb98637bcae43C13323EAa1731cED2B716962fD;  // NimiqNetwork
        initialTokens[27] = 0x221657776846890989a759BA2973e427DfF5C9bB;  // Reputation
        initialTokens[28] = 0x1602af2C782cC03F9241992E243290Fccf73Bb13;  // Qubitica
        initialTokens[29] = 0xB4EFd85c19999D84251304bDA99E90B92300Bd93;  // Rocket Pool
        initialTokens[30] = 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892;  // Melon Token
        initialTokens[31] = 0xc9859fccC876e6b4B3C749C5D29EA04F48aCb74F;  // Ino Coin
        initialTokens[32] = 0x8c15Ef5b4B21951d50E53E4fbdA8298FFAD25057;  // Function X
        initialTokens[33] = 0x6781a0F84c7E9e846DCb84A9a5bd49333067b104;  // ZAP TOKEN
        initialTokens[34] = 0xD01DB73E047855Efb414e6202098C4Be4Cd2423B;  // Uquid Coin
        initialTokens[35] = 0x4F9254C83EB525f9FCf346490bbb3ed28a81C667;  // CelerToken
        initialTokens[36] = 0xE65ee7c03Bbb3C950Cfd4895c24989afA233EF01;  // Zynecoin
        initialTokens[37] = 0x32d74896f05204D1b6Ae7B0a3CEBd7FC0Cd8F9C7;  // Kcash
        initialTokens[38] = 0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5;  // Tellor Tributes
        initialTokens[39] = 0x56d811088235F11C8920698a204A5010a788f4b3;  // bZx Protocol Token
        initialTokens[40] = 0x445f51299Ef3307dBD75036dd896565F5B4BF7A5;  // V-ID Token
        initialTokens[41] = 0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7;  // Akropolis
        initialTokens[42] = 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e;  // yearn.finance
        initialTokens[43] = 0x5Ca381bBfb58f0092df149bD3D243b08B9a8386e;  // MXCToken
        initialTokens[44] = 0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA;  // Orbs
        initialTokens[45] = 0x915044526758533dfB918ecEb6e44bc21632060D;  // Chroma
        initialTokens[46] = 0xD533a949740bb3306d119CC777fa900bA034cd52;  // Curve DAO Token
        initialTokens[47] = 0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d;  // Celsius
        initialTokens[48] = 0xaAAf91D9b90dF800Df4F55c205fd6989c977E73a;  // Monolith
        initialTokens[49] = 0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d;  // Pinakion
        initialTokens[50] = 0x41AB1b6fcbB2fA9DCEd81aCbdeC13Ea6315F2Bf2;  // XinFin XDCE
        initialTokens[51] = 0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4;  // Ankr Network
        initialTokens[52] = 0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD;  // pNetwork Token
        initialTokens[53] = 0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf;  // DAOstack
        initialTokens[54] = 0x1D287CC25dAD7cCaF76a26bc660c5F7C8E2a05BD;  // Fetch
        initialTokens[55] = 0x4a220E6096B25EADb88358cb44068A3248254675;  // Quant
        initialTokens[56] = 0x0A913beaD80F321E7Ac35285Ee10d9d922659cB7;  // DOS Network Token
        initialTokens[57] = 0xEd91879919B71bB6905f23af0A68d231EcF87b14;  // DMM: Governance
        initialTokens[58] = 0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55;  // BandToken
        initialTokens[59] = 0x4CC19356f2D37338b9802aa8E8fc58B0373296E7;  // SelfKey
        initialTokens[60] = 0x26E75307Fc0C021472fEb8F727839531F112f317;  // Crypto20
        initialTokens[61] = 0xC80c5E40220172B36aDee2c951f26F2a577810C5;  // Banker Token
        initialTokens[62] = 0x973e52691176d36453868D9d86572788d27041A9;  // DxChain Token
        initialTokens[63] = 0xF433089366899D83a9f26A773D59ec7eCF30355e;  // Metal
        initialTokens[64] = 0xD0352a019e9AB9d757776F532377aAEbd36Fd541;  // Fusion
        initialTokens[65] = 0xE884cc2795b9c45bEeac0607DA9539Fd571cCF85;  // Ultiledger
        initialTokens[66] = 0x4E15361FD6b4BB609Fa63C81A2be19d873717870;  // Fantom Token
        initialTokens[67] = 0x27054b13b1B798B345b591a4d22e6562d47eA75a;  // AirSwap
        initialTokens[68] = 0x6810e776880C02933D47DB1b9fc05908e5386b96;  // Gnosis
        initialTokens[69] = 0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419;  // DIAToken
        initialTokens[70] = 0x1122B6a0E00DCe0563082b6e2953f3A943855c1F;  // Centrality Token
        initialTokens[71] = 0x7AFeBBB46fDb47ed17b22ed075Cde2447694fB9e;  // Ocean Token
        initialTokens[72] = 0x6f259637dcD74C767781E37Bc6133cd6A68aa161;  // HuobiToken
        initialTokens[73] = 0xba100000625a3754423978a60c9317c58a424e3D;  // Balancer
        initialTokens[74] = 0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69;  // IoTeX Network
        initialTokens[75] = 0x4CEdA7906a5Ed2179785Cd3A40A69ee8bc99C466;  // AION
        initialTokens[76] = 0xaA7a9CA87d3694B5755f213B5D04094b8d0F0A6F;  // Trace
        initialTokens[77] = 0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0;  // Loom
        initialTokens[78] = 0x3506424F91fD33084466F402d5D97f05F8e3b4AF;  // chiliZ
        initialTokens[79] = 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0;  // Matic Token
        initialTokens[80] = 0x1C83501478f1320977047008496DACBD60Bb15ef;  // DigitexFutures
        initialTokens[81] = 0x8762db106B2c2A0bccB3A80d1Ed41273552616E8;  // Reserve Rights
        initialTokens[82] = 0x888666CA69E0f178DED6D75b5726Cee99A87D698;  // ICONOMI
        initialTokens[83] = 0x940a2dB1B7008B6C776d4faaCa729d6d4A4AA551;  // Dusk Network
        initialTokens[84] = 0x5d65D971895Edc438f465c17DB6992698a52318D;  // Nebulas
        initialTokens[85] = 0x8971f9fd7196e5cEE2C1032B50F656855af7Dd26;  // Lambda
        initialTokens[86] = 0x255Aa6DF07540Cb5d3d297f0D0D4D84cb52bc8e6;  // Raiden
        initialTokens[87] = 0x8eB24319393716668D768dCEC29356ae9CfFe285;  // SingularityNET
        initialTokens[88] = 0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e;  // UniBright
        initialTokens[89] = 0x39Bb259F66E1C59d5ABEF88375979b4D20D98022;  // WAX Token
        initialTokens[90] = 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F;  // Synthetix Network Token
        initialTokens[91] = 0x5B2e4a700dfBc560061e957edec8F6EeEb74a320;  // Insolar
        initialTokens[92] = 0x607F4C5BB672230e8672085532f7e901544a7375;  // RLC
        initialTokens[93] = 0x4575f41308EC1483f3d399aa9a2826d74Da13Deb;  // Orchid
        initialTokens[94] = 0x408e41876cCCDC0F92210600ef50372656052a38;  // Republic
        initialTokens[95] = 0xD46bA6D942050d489DBd938a2C909A5d5039A161;  // Ampleforth
        initialTokens[96] = 0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9;  // Swipe
        initialTokens[97] = 0x70a72833d6bF7F508C8224CE59ea1Ef3d0Ea3A38;  // UTRUST
        initialTokens[98] = 0xf0Ee6b27b759C9893Ce4f094b49ad28fd15A23e4;  // Enigma
        initialTokens[99] = 0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6;  // RipioCreditNetwork
        initialTokens[100] = 0xBd0793332e9fB844A52a205A233EF27a5b34B927;  // ZBToken
        initialTokens[101] = 0xA974c709cFb4566686553a20790685A47acEAA33;  // Mixin
        initialTokens[102] = 0xEa11755Ae41D889CeEc39A63E6FF75a02Bc1C00d;  // Cortex Coin
        initialTokens[103] = 0xba9d4199faB4f26eFE3551D490E3821486f135Ba;  // SwissBorg
        initialTokens[104] = 0xDF2C7238198Ad8B389666574f2d8bc411A4b7428;  // Mainframe Token
        initialTokens[105] = 0xbE9375C6a420D2eEB258962efB95551A5b722803;  // StormX
        initialTokens[106] = 0x5732046A883704404F284Ce41FfADd5b007FD668;  // Bluzelle
        initialTokens[107] = 0x05f4a42e251f2d52b8ed15E9FEdAacFcEF1FAD27;  // Zilliqa
        initialTokens[108] = 0xd4c435F5B09F855C3317c8524Cb1F586E42795fa;  // Cindicator
        initialTokens[109] = 0x960b236A07cf122663c4303350609A66A7B288C0;  // Aragon
        initialTokens[110] = 0xb7cB1C96dB6B22b0D3d9536E0108d062BD488F74;  // Walton
        initialTokens[111] = 0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671;  // Numeraire
        initialTokens[112] = 0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26;  // OriginToken
        initialTokens[113] = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;  // Maker
        initialTokens[114] = 0x3883f5e181fccaF8410FA61e12b59BAd963fb645;  // Theta Token
        initialTokens[115] = 0x5Af2Be193a6ABCa9c8817001F45744777Db30756;  // Voyager
        initialTokens[116] = 0xd4fa1460F537bb9085d22C7bcCB5DD450Ef28e3a;  // Populous
        initialTokens[117] = 0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C;  // Bancor
        initialTokens[118] = 0x37F04d2C3AE075Fad5483bB918491F656B12BDB6;  // Vestchain
        initialTokens[119] = 0xc00e94Cb662C3520282E6f5717214004A7f26888;  // Compound
        initialTokens[120] = 0xB63B606Ac810a52cCa15e44bB630fd42D8d1d83d;  // MCO
        initialTokens[121] = 0xfe5F141Bf94fE84bC28deD0AB966c16B17490657;  // LibraToken
        initialTokens[122] = 0x3597bfD533a99c9aa083587B074434E61Eb0A258;  // DENT
        initialTokens[123] = 0x8f8221aFbB33998d8584A2B05749bA73c37a938a;  // Request
        initialTokens[124] = 0x6c6EE5e31d828De241282B9606C8e98Ea48526E2;  // HoloToken
        initialTokens[125] = 0x4f878C0852722b0976A955d68B376E4Cd4Ae99E5;  // WaykiCoin
        initialTokens[126] = 0x419c4dB4B9e25d6Db2AD9691ccb832C8D9fDA05E;  // Dragon
        initialTokens[127] = 0xFA1a856Cfa3409CFa145Fa4e20Eb270dF3EB21ab;  // IOSToken
        initialTokens[128] = 0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b;  // Crypto.com Coin
        initialTokens[129] = 0x75231F58b43240C9718Dd58B4967c5114342a86c;  // OKB
        initialTokens[130] = 0x99ea4dB9EE77ACD40B119BD1dC4E33e1C070b80d;  // Quantstamp
        initialTokens[131] = 0x17Aa18A4B64A55aBEd7FA543F2Ba4E91f2dcE482;  // Insight Chain
        initialTokens[132] = 0xBe428c3867F05deA2A89Fc76a102b544eaC7f772;  // CyberVeinToken
        initialTokens[133] = 0x0F5D2fB29fb7d3CFeE444a200298f468908cC942;  // Decentraland
        initialTokens[134] = 0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206;  // Nexo
        initialTokens[135] = 0xD850942eF8811f2A866692A623011bDE52a462C1;  // VeChain
        initialTokens[136] = 0x41e5560054824eA6B0732E656E3Ad64E20e94E45;  // Civic
        initialTokens[137] = 0xcB97e65F07DA24D46BcDD078EBebd7C6E6E3d750;  // Bytom
        initialTokens[138] = 0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e;  // ELF
        initialTokens[139] = 0x595832F8FC6BF59c85C527fEC3740A1b7a361269;  // PowerLedger
        initialTokens[140] = 0x1410434b0346f5bE678d0FB554E5c7ab620f8f4a;  // KAN
        initialTokens[141] = 0x2ef52Ed7De8c5ce03a4eF0efbe9B7450F2D7Edc9;  // Revain
        initialTokens[142] = 0x653430560bE843C4a3D143d0110e896c2Ab8ac0D;  // Molecular Future
        initialTokens[143] = 0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c;  // EnjinCoin
        initialTokens[144] = 0x039B5649A59967e3e936D7471f9c3700100Ee1ab;  // Kucoin Shares
        initialTokens[145] = 0x80A7E048F37A50500351C204Cb407766fA3baE7f;  // Crypterium
        initialTokens[146] = 0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD;  // LoopringCoin V2
        initialTokens[147] = 0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC;  // Storj
        initialTokens[148] = 0x58a4884182d9E835597f405e5F258290E46ae7C2;  // NOAHCOIN
        initialTokens[149] = 0xA15C7Ebe1f07CaF6bFF097D8a589fb8AC49Ae5B3;  // Pundi X Token
        initialTokens[150] = 0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b;  // FunFair
        initialTokens[151] = 0xdd974D5C2e2928deA5F71b9825b8b646686BD200;  // KyberNetwork
        initialTokens[152] = 0x744d70FDBE2Ba4CF95131626614a1763DF805B9E;  // StatusNetwork
        initialTokens[153] = 0x21aB6c9fAC80C59D401b37cB43F81ea9DDe7Fe34;  // Baer Chain
        initialTokens[154] = 0x9992eC3cF6A55b00978cdDF2b27BC6882d88D1eC;  // Polymath
        initialTokens[155] = 0x9ab165D795019b6d8B3e971DdA91071421305e5a;  // Aurora
        initialTokens[156] = 0xa74476443119A942dE498590Fe1f2454d7D4aC0d;  // Golem
        initialTokens[157] = 0xE41d2489571d322189246DaFA5ebDe1F4699F498;  // ZRX
        initialTokens[158] = 0x80fB784B7eD66730e8b1DBd9820aFD29931aab03;  // EthLend
        initialTokens[159] = 0x514910771AF9Ca656af840dff83E8264EcF986CA;  // ChainLink Token
        initialTokens[160] = 0xB8c77482e45F1F44dE1745F52C74426C631bDD52;  // BNB
        initialTokens[161] = 0x0D8775F648430679A709E98d2b0Cb6250d2887EF;  // BAT
        initialTokens[162] = 0x0Cf0Ee63788A0849fE5297F3407f701E122cC023;  // DATAcoin
        initialTokens[163] = 0xd26114cd6EE289AccF82350c8d8487fedB8A0C07;  // OMG Network
        initialTokens[164] = 0x58b6A8A3302369DAEc383334672404Ee733aB239;  // Livepeer Token
        _addToWhitelist(initialTokens);

    }

    function addToWhitelist(address[] calldata tokens) external onlyOwner {
        _addToWhitelist(tokens);
    }

    function _addToWhitelist(address[] memory tokens) private {
        for (uint i = 0; i < tokens.length; i++) {
            whitelist[tokens[i]] = TokenEntry({
                addr : tokens[i]
                });
            emit TokenAdded(tokens[i]);
        }
    }


    function isWhitelisted(address token) public view returns (bool){
        return whitelist[token].addr != address(0);
    }

}