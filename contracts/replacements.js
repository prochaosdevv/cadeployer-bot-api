exports.TRADING_VARIABLES = `bool public tradingActive = false;
uint256 public tradingActiveBlock = 0; // 0 means trading is not active
`
exports.TRADING_ANTISNIPER = `uint256 public blockForPenaltyEnd;`;

exports.TRADING_FUNCTIONS = `function enableTrading(uint256 blocksForPenalty) external onlyOwner {
    require(initialized, "Not initialized");
    require(!tradingActive, "Cannot reenable trading");
    require(
        blocksForPenalty <= TRADING_BLOCK_LIMIT,
        "Cannot make penalty blocks more than 10"
    );
    tradingActive = true; 
    [AMM_UPDATE_11]
    tradingActiveBlock = block.number;
    blockForPenaltyEnd = tradingActiveBlock + blocksForPenalty;
    emit EnabledTrading();
}

function launch(uint256 blocksForPenalty) external onlyOwner {
    require(
    blocksForPenalty < 10,
    "Cannot make penalty blocks more than 10"
    )   ;
    [TRADING_CONDITIONS_3]
    [TRADING_VARIABLE_UPDATE_1]
    [AMM_UPDATE_11]
    
}
` ;


exports.TRADING_EVENTS = `event EnabledTrading();`



exports.TRADING_CONDITIONS_1 = `require(!tradingActive, "Cannot update after trading is functional");`

exports.TRADING_CONDITIONS_2 = ` if (!tradingActive) {
    require(
        _isExcludedFromFees[from] || _isExcludedFromFees[to],
        "Trading is not active."
    );
}

if ([ANTISNIPER_CONDITION_1]tradingActive) {
    require(
        [ANTISNIPER_CONDITION_3] to == owner() || to == address(0xdead),
        "Bots cannot transfer tokens in or out except to owner or dead address."
    );
}
`


exports.TRADING_CONDITIONS_3 = `require(!tradingActive, "Trading is already active, cannot relaunch.");
`
 
exports.TRADING_CONDITIONS_4  =`require(
    _token != address(this) || !tradingActive,
    "Can't withdraw native tokens while trading is active"
);`


exports.TRADING_VARIABLE_UPDATE_1 = `//standard enable trading
tradingActive = true;
tradingActiveBlock = block.number;
blockForPenaltyEnd = tradingActiveBlock + blocksForPenalty;
emit EnabledTrading();`



//TRANSFER_LIMIT_VARIABLES


exports.TRANSFER_LIMIT_VARIABLES = `// exlcude from fees and max transaction amount
bool public limitsInEffect = true;
uint256 public maxBuyAmount;
uint256 public maxSellAmount;
uint256 public maxWallet;
mapping(address => bool) public _isExcludedMaxTransactionAmount;` ;


exports.TRANSFER_LIMIT_EVENTS = `event UpdatedMaxSellAmount(uint256 newAmount);

event UpdatedMaxWalletAmount(uint256 newAmount);

event MaxTransactionExclusion(address _address, bool excluded);


event UpdatedMaxBuyAmount(uint256 newAmount);
`

exports.TRANSFER_LIMIT_UPDATE_1 = `_excludeFromMaxTransaction(newOwner, true);
_excludeFromMaxTransaction(address(this), true);
_excludeFromMaxTransaction(address(0xdead), true);
_excludeFromMaxTransaction(address(operationsAddress), true);
_excludeFromMaxTransaction(address(treasuryAddress), true);
_excludeFromMaxTransaction(address(dexRouter), true);
_excludeFromMaxTransaction(address(lpPair), true);
maxBuyAmount = (totalSupply * BUY_MAX) / 10000; // BUY_MAX%
maxSellAmount = (totalSupply * SELL_MAX) / 10000; // SELL_MAX%
maxWallet = (totalSupply * MAX_WALLET) / 10000; // MAX_WALLET%
`

exports.TRANSFER_LIMIT_FUNCTIONS = `function updateMaxBuyAmount(uint256 newNum) external onlyOwner {
    uint256 _totalSupply = totalSupply();
    require(
        newNum >= ((_totalSupply * 5) / 1000) / 1e18,
        "Cannot set max buy amount lower than 0.5%"
    );
    require(
        newNum <= ((_totalSupply * 2) / 100) / 1e18,
        "Cannot set buy sell amount higher than 2%"
    );
    maxBuyAmount = newNum * (10**18);
    emit UpdatedMaxBuyAmount(maxBuyAmount);
}
function updateMaxSellAmount(uint256 newNum) external onlyOwner {
    uint256 _totalSupply = totalSupply();

    require(
        newNum >= ((_totalSupply * 5) / 1000) / 1e18,
        "Cannot set max sell amount lower than 0.5%"
    );
    require(
        newNum <= ((_totalSupply * 2) / 100) / 1e18,
        "Cannot set max sell amount higher than 2%"
    );
    maxSellAmount = newNum * (10**18);
    emit UpdatedMaxSellAmount(maxSellAmount);
}

function updateMaxWalletAmount(uint256 newNum) external onlyOwner {
    uint256 _totalSupply = totalSupply();

    require(
        newNum >= ((_totalSupply * 5) / 1000) / 1e18,
        "Cannot set max wallet amount lower than 0.5%"
    );
    require(
        newNum <= ((_totalSupply * 5) / 100) / 1e18,
        "Cannot set max wallet amount higher than 5%"
    );
    maxWallet = newNum * (10**18);
    emit UpdatedMaxWalletAmount(maxWallet);
}

function _excludeFromMaxTransaction(address updAds, bool isExcluded)
        private
    {
        _isExcludedMaxTransactionAmount[updAds] = isExcluded;
        emit MaxTransactionExclusion(updAds, isExcluded);
    }

    function excludeFromMaxTransaction(address updAds, bool isEx)
        external
        onlyOwner
    {
        if (!isEx) {
            require(
                updAds != lpPair,
                "Cannot remove uniswap pair from max txn"
            );
        }
        _isExcludedMaxTransactionAmount[updAds] = isEx;
    }
    // remove limits after token is stable
    function removeLimits() external onlyOwner {
        limitsInEffect = false;
    }`

exports.TRANSFER_LIMIT_CONDITION_1 = `_excludeFromMaxTransaction(pair, value);`

exports.TRANSFER_LIMIT_CONDITION_2 = ` if (limitsInEffect) {
    if (
        from != owner() &&
        to != owner() &&
        to != address(0xdead) &&
        !_isExcludedFromFees[from] &&
        !_isExcludedFromFees[to]
    ) {

        [TRANSFERDELAY_CONDITION]
        

        //when buy
        if (
            [AMM_UPDATE_5]
            !_isExcludedMaxTransactionAmount[to]
        ) {
            require(
                amount <= maxBuyAmount,
                "Buy transfer amount exceeds the max buy."
            );
            require(
                amount + balanceOf(to) <= maxWallet,
                "Max Wallet Exceeded"
            );
        }
        //when sell
        else if (
            [AMM_UPDATE_6]
            !_isExcludedMaxTransactionAmount[from]
        ) {
            require(
                amount <= maxSellAmount,
                "Sell transfer amount exceeds the max sell."
            );
        } else if (!_isExcludedMaxTransactionAmount[to]) {
            require(
                amount + balanceOf(to) <= maxWallet,
                "Max Wallet Exceeded"
            );
        }
    }
}`



// Anti-Bot

exports.ANTISNIPER_VARIABLES = ` // Anti-bot and anti-whale mappings and variables
 // to hold last Transfers temporarily during launch
bool public markBotsEnabled = true;
address[] public identifiedBots;
uint256 public botsCaught;`

exports.ANTISNIPER_EVENTS = `event BotBlocked(address sniper);`

// Anti-Sniper

exports.ANTISNIPER_FUNCTIONS = `
function getEarlyBuyers() external view returns (address[] memory) {
    return identifiedBots;
}

function earlyBuyPenaltyInEffect() public view returns (bool) {
    return block.number < blockForPenaltyEnd;
}

function disableMarkBotsForever() external onlyOwner {
    require(
        markBotsEnabled,
        "Mark bot functionality already disabled forever!!"
    );

    markBotsEnabled = false;
}`

exports.ANTISNIPER_CONDITION_1 = `!earlyBuyPenaltyInEffect() && `
exports.ANTISNIPER_CONDITION_2 = `(earlyBuyPenaltyInEffect()) && `
exports.ANTISNIPER_CONDITION_3 = `!blackListed[from] ||`

exports.ANTISNIPER_UPDATE_1 = `botsCaught += 1;
identifiedBots.push(to);
emit BotBlocked(to);`

exports.ANTISNIPER_UPDATE_2 = `if (
    [ANTISNIPER_CONDITION_2]
    [AMM_UPDATE_5]
    !_isExcludedFromFees[to] &&
    buyTotalFees > 0
) {
 
    [BLACKLISTED_FUNCTION_1]

    fees = (amount * 80) / 100;
    [AMM_UPDATE_9]
    tokensForOperations += (fees * buyOperationsFee) / buyTotalFees;
    tokensForTreasury += (fees * buyTreasuryFee) / buyTotalFees;
} else `


// FEE

exports.FEE_VARIABLE = `


address public operationsAddress;
address public treasuryAddress;

uint256 public buyTotalFees;
uint256 public buyOperationsFee;
uint256 public buyTreasuryFee;

uint256 public sellTotalFees;
uint256 public sellOperationsFee;
uint256 public sellTreasuryFee;
mapping(address => bool) private _isExcludedFromFees;

uint256 public tokensForOperations;
uint256 public tokensForTreasury;

bool private taxFree = true; `


exports.FEE_EVENTS = `
event UpdatedOperationsAddress(address indexed newWallet);

event ExcludeFromFees(address indexed account, bool isExcluded);
event UpdatedTreasuryAddress(address indexed newWallet);`

exports.FEE_UPDATE_1 = `
buyOperationsFee = BUY_OP_FEE;
buyTreasuryFee = BUY_TREASURY_FEE;
buyTotalFees = buyOperationsFee [AMM_UPDATE_1] + buyTreasuryFee;

sellOperationsFee = SELL_OP_FEE;
sellTreasuryFee = SELL_TREASURY_FEE;
sellTotalFees = sellOperationsFee [AMM_UPDATE_2] + sellTreasuryFee;

operationsAddress = address(OPERATING_ADDRESS);
treasuryAddress = address(TREASURY_ADDRESS);`




exports.FEE_FUNCTIONS = `function setTaxFree(bool set) external onlyOwner {
    taxFree = set; 
}

function updateBuyFees(
    uint256 _operationsFee,
    [AMM_INPUT_1]
    uint256 _treasuryFee
) external onlyOwner {
    buyOperationsFee = _operationsFee;
    [AMM_UPDATE_3]
    buyTreasuryFee = _treasuryFee;
    buyTotalFees = buyOperationsFee [AMM_UPDATE_1] + buyTreasuryFee;
    require(buyTotalFees <= BUY_LIMIT, "Must keep fees at 20% or less");
}

function updateSellFees(
    uint256 _operationsFee,
    [AMM_INPUT_1]
    uint256 _treasuryFee
) external onlyOwner {
    sellOperationsFee = _operationsFee;
    [AMM_UPDATE_4]
    sellTreasuryFee = _treasuryFee;
    sellTotalFees = sellOperationsFee [AMM_UPDATE_2] + sellTreasuryFee;
    require(sellTotalFees <= SELL_LIMIT, "Must keep fees at 30% or less");
}

function excludeFromFees(address account, bool excluded) public onlyOwner {
    _isExcludedFromFees[account] = excluded;
    emit ExcludeFromFees(account, excluded);
}

function setOperationsAddress(address _operationsAddress)
        external
        onlyOwner
    {
        require(
            _operationsAddress != address(0),
            "_operationsAddress address cannot be 0"
        );
        operationsAddress = payable(_operationsAddress);
        emit UpdatedOperationsAddress(_operationsAddress);
    }

    function setTreasuryAddress(address _treasuryAddress) external onlyOwner {
        require(
            _treasuryAddress != address(0),
            "_operationsAddress address cannot be 0"
        );
        treasuryAddress = payable(_treasuryAddress);
        emit UpdatedTreasuryAddress(_treasuryAddress);
    }
`

exports.FEE_UPDATE_2 = `
bool takeFee = true;
// if any account belongs to _isExcludedFromFee account then remove the fee
if (_isExcludedFromFees[from] || _isExcludedFromFees[to]) {
    takeFee = false;
}
uint256 fees = 0;
// only take fees on buys/sells, do not take on wallet transfers
if (takeFee) {
    // bot/sniper penalty.
    
    
 
    [ANTISNIPER_UPDATE_2] if ([AMM_UPDATE_6] sellTotalFees > 0) {
        fees = (amount * sellTotalFees) / 10000;
        [AMM_UPDATE_8]
        tokensForOperations +=
            (fees * sellOperationsFee) /
            sellTotalFees;
        tokensForTreasury += (fees * sellTreasuryFee) / sellTotalFees;
    }
    // on buy
    else if ([AMM_UPDATE_7] buyTotalFees > 0) {
        fees = (amount * buyTotalFees) / 10000;
        [AMM_UPDATE_9]
        
        tokensForOperations += (fees * buyOperationsFee) / buyTotalFees;
        tokensForTreasury += (fees * buyTreasuryFee) / buyTotalFees;
    }
    
    if(!taxFree) {

        if (fees > 0) {
            super._transfer(from, address(this), fees);
        }

        amount -= fees;
    }
}`


// AMM 

exports.AMM_FUNCTION = `function swapTokensForEth(uint256 tokenAmount) private {
    // generate the uniswap pair path of token -> weth
    address[] memory path = new address[](2);
    path[0] = address(this);
    path[1] = dexRouter.WETH();

    _approve(address(this), address(dexRouter), tokenAmount);

    // make the swap
    dexRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
        tokenAmount,
        0, // accept any amount of ETH
        path,
        address(this),
        block.timestamp
    );
}

function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
    // approve token transfer to cover all possible scenarios
    _approve(address(this), address(dexRouter), tokenAmount);

    // add the liquidity
    dexRouter.addLiquidityETH{value: ethAmount}(
        address(this),
        tokenAmount,
        0, // slippage is unavoidable
        0, // slippage is unavoidable
        address(0xdead),
        block.timestamp
    );
}

function swapBack() private {
    uint256 contractBalance = balanceOf(address(this));

    uint256 totalTokensToSwap = tokensForLiquidity +
        tokensForOperations +
        tokensForTreasury;

    uint256 trueTokensToSwap = contractBalance < totalTokensToSwap ? contractBalance : totalTokensToSwap; 

    if (trueTokensToSwap == 0) {
        return;
    }

    if (trueTokensToSwap > swapTokensAtAmount * 30) {
        trueTokensToSwap = swapTokensAtAmount * 30;
    }

    bool success;

    // Halve the amount of liquidity tokens
    uint256 liquidityTokens = (trueTokensToSwap * tokensForLiquidity) /
        totalTokensToSwap /
        2;

    swapTokensForEth(trueTokensToSwap - liquidityTokens);

    uint256 ethBalance = address(this).balance;
    uint256 ethForLiquidity = ethBalance;

    uint256 ethForOperations = (ethBalance * tokensForOperations) /
        (totalTokensToSwap - (tokensForLiquidity / 2));
    uint256 ethForTreasury = (ethBalance * tokensForTreasury) /
        (totalTokensToSwap - (tokensForLiquidity / 2));

    ethForLiquidity -= ethForOperations + ethForTreasury;

    tokensForLiquidity = 0;
    tokensForOperations = 0;
    tokensForTreasury = 0;

    if (liquidityTokens > 0 && ethForLiquidity > 0) {
        addLiquidity(liquidityTokens, ethForLiquidity);
    }

    (success, ) = address(treasuryAddress).call{value: ethForTreasury}("");
    (success, ) = address(operationsAddress).call{
        value: address(this).balance
    }("");
}




// force Swap back if slippage issues.
function forceSwapBack() external onlyOwner {
    require(
        balanceOf(address(this)) >= swapTokensAtAmount,
        "Can only swap when token amount is at or higher than restriction"
    );
    swapping = true;
    swapBack();
    swapping = false;
    emit OwnerForcedSwapBack(block.timestamp);
}


    

// change the minimum amount of tokens to sell from fees
function updateSwapTokensAtAmount(uint256 newAmount) external onlyOwner {
    uint256 _totalSupply = totalSupply();
    require(
        newAmount >= (_totalSupply * 1) / 100000,
        "Swap amount cannot be lower than 0.001% total supply."
    );
    require(
        newAmount <= (_totalSupply * 1) / 1000,
        "Swap amount cannot be higher than 0.1% total supply."
    );
    swapTokensAtAmount = newAmount;
}



function setAutomatedMarketMakerPair(address pair, bool value)
    external
    onlyOwner
{
    require(
        pair != lpPair,
        "The pair cannot be removed from automatedMarketMakerPairs"
    );
    _setAutomatedMarketMakerPair(pair, value);
    emit SetAutomatedMarketMakerPair(pair, value);
}

function _setAutomatedMarketMakerPair(address pair, bool value) private {
    automatedMarketMakerPairs[pair] = value;
    
    [TRANSFER_LIMIT_CONDITION_1]


    emit SetAutomatedMarketMakerPair(pair, value);
}

function emergencyUpdateRouter(address router, bool _swapEnabled) external onlyOwner {        
    [TRADING_CONDITIONS_1]

    dexRouter = IDexRouter(router);
    swapEnabled = _swapEnabled; 
}
`


exports.AMM_CONDITION_1 = `require(lpPair != address(0), "Pair not created");`

exports.AMM_VARIABLES = `
bool private swapping;
uint256 public swapTokensAtAmount;
bool public swapEnabled = false; 

uint256 public buyLiquidityFee;
uint256 public sellLiquidityFee;
uint256 public tokensForLiquidity;
mapping(address => bool) public automatedMarketMakerPairs;`

exports.AMM_EVENTS = `event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);

event SwapAndLiquify(
    uint256 tokensSwapped,
    uint256 ethReceived,
    uint256 tokensIntoLiquidity
);`

exports.AMM_INPUT_1 = `uint256 _liquidityFee,` ; 
exports.AMM_UPDATE_1 = `+ buyLiquidityFee`;
exports.AMM_UPDATE_2 = `+ sellLiquidityFee`;
exports.AMM_UPDATE_3 = `buyLiquidityFee = _liquidityFee;`;
exports.AMM_UPDATE_4 = `sellLiquidityFee = _liquidityFee;`;
exports.AMM_UPDATE_5 = `automatedMarketMakerPairs[from] &&
!automatedMarketMakerPairs[to] &&`
exports.AMM_UPDATE_6 = `automatedMarketMakerPairs[to] && `;
exports.AMM_UPDATE_7 = `automatedMarketMakerPairs[from] && `;
exports.AMM_UPDATE_8 = `tokensForLiquidity += (fees * buyLiquidityFee) / buyTotalFees;`;
exports.AMM_UPDATE_9 = `tokensForLiquidity += (fees * sellLiquidityFee) / sellTotalFees;`;

exports.AMM_UPDATE_10 = `uint256 contractTokenBalance = balanceOf(address(this));

bool canSwap = contractTokenBalance >= swapTokensAtAmount;

if (
    canSwap && swapEnabled && !swapping && automatedMarketMakerPairs[to]
) {
    swapping = true;
    swapBack();
    swapping = false;
}` ;


exports.AMM_UPDATE_11 = `swapEnabled = true;`;


exports.AMM_UPDATE_12 = `
address _dexRouter = ROUTER_ADDRESS; 

        // initialize router
        dexRouter = IDexRouter(_dexRouter);

        // create pair
        lpPair = IDexFactory(dexRouter.factory()).createPair(
            address(this),
            dexRouter.WETH()
        );

        _setAutomatedMarketMakerPair(address(lpPair), true);

swapTokensAtAmount = (totalSupply * SWAP_TOKENS_AT) / 10000; // SWAP_TOKENS_AT_PER %


buyLiquidityFee = BUY_LIQ_FEE;
sellLiquidityFee = SELL_LIQ_FEE;` ;
 
exports.AMM_UPDATE_13 = `  if (to != address(dexRouter) && to != address(lpPair)) {
`  ; 

exports.AMM_UPDATE_14 = `  }`


// Blacklist

exports.BLACKLISTED_FUNCTION_1 = `if (!blackListed[to]) {
    blackListed[to] = true;
    [ANTISNIPER_UPDATE_1]
}
`

exports.BLACKLIST_VARIABLES = `mapping(address => bool) public blackListed;`

exports.BLACKLIST_FUNCTIONS = `
function markblackListed(address wallet) external onlyOwner {
        
    require(!blackListed[wallet], "Wallet is already flagged.");
    blackListed[wallet] = true;
}

function removeblackListed(address wallet) external onlyOwner {
    require(blackListed[wallet], "Wallet is already not flagged.");
    blackListed[wallet] = false;
}
`
//Transfer Delay
exports.TRANSFERDELAY_FUNCTION = ` // disable Transfer delay - cannot be reenabled
function disableTransferDelay() external onlyOwner {
    transferDelayEnabled = false;
}`

exports.TRANSFER_DELAY_VARIABLES = `bool public transferDelayEnabled = true;`

exports.TRANSFERDELAY_CONDITION = `if (transferDelayEnabled) {
  
        [AMM_UPDATE_13]
        require(
            _holderLastTransferTimestamp[tx.origin] <
                block.number - 2 &&
                _holderLastTransferTimestamp[to] <
                block.number - 2,
            "_transfer:: Transfer Delay enabled.  Try again later."
        );
        _holderLastTransferTimestamp[tx.origin] = block.number;
        _holderLastTransferTimestamp[to] = block.number;
        [AMM_UPDATE_14]
    
}`

// CA Clock
exports.CA_CLOCK_CONDTION = `_createInitialSupply(newOwner, (totalSupply * (100 - CA_CLOCK_PER)) / 100); // Tokens for liquidity 
_createInitialSupply(address(this), (totalSupply * (CA_CLOCK_PER)) / 100); // Special fee system`

exports.CA_CLOCK_DEFAULT = `_createInitialSupply(newOwner, totalSupply);`