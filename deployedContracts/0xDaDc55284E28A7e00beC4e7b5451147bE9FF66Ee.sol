// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

interface IERC20 {
   
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function _createInitialSupply(address account, uint256 amount)
        internal
        virtual
    {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}

contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership(bool confirmRenounce)
        external
        virtual
        onlyOwner
    {
        require(confirmRenounce, "Please confirm renounce!");
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

interface ILpPair {
    function sync() external;
}

interface IDexRouter {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);
}

interface IDexFactory {
    function createPair(address tokenA, address tokenB)
        external
        returns (address pair);
}

contract TEST_TOKEN105 is ERC20, Ownable {
    

    
    
bool private swapping;
uint256 public swapTokensAtAmount;
bool public swapEnabled = false; 

uint256 public buyLiquidityFee;
uint256 public sellLiquidityFee;
uint256 public tokensForLiquidity;
mapping(address => bool) public automatedMarketMakerPairs;

    
    IDexRouter public dexRouter;
    address public lpPair;
    bool public initialized;
    mapping(address => uint256) private _holderLastTransferTimestamp;
    
    
     
    

    
    
    
    

    


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

bool private taxFree = true; 
    

    
     

    


    
event UpdatedOperationsAddress(address indexed newWallet);

event ExcludeFromFees(address indexed account, bool isExcluded);
event UpdatedTreasuryAddress(address indexed newWallet);

    

    
    
    event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);

event SwapAndLiquify(
    uint256 tokensSwapped,
    uint256 ethReceived,
    uint256 tokensIntoLiquidity
);     

    event TransferForeignToken(address token, uint256 amount);
 
    event OwnerForcedSwapBack(uint256 timestamp);


    constructor() ERC20("TEST_TOKEN 105", "TTK105")  {  
        uint256 totalSupply = 1000000 * 1e18; // 100 million
        address newOwner = 0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F ; 
        _createInitialSupply(newOwner, totalSupply); 
        transferOwnership(0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F); 

    }
 
    receive() external payable {}
    
    
     

    function initialize() external onlyOwner() {
        require(!initialized, "Already initialized"); 
        address newOwner = 0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F ; 

        uint256 totalSupply = 1000000 * 1e18; // 100 million
        
        

        
 

        
address _dexRouter = 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3; 

        // initialize router
        dexRouter = IDexRouter(_dexRouter);

        // create pair
        lpPair = IDexFactory(dexRouter.factory()).createPair(
            address(this),
            dexRouter.WETH()
        );

        _setAutomatedMarketMakerPair(address(lpPair), true);

swapTokensAtAmount = (totalSupply * 100) / 10000; // 100_PER %


buyLiquidityFee = 1;
sellLiquidityFee = 2;

        
buyOperationsFee = 1;
buyTreasuryFee = 1;
buyTotalFees = buyOperationsFee + buyLiquidityFee + buyTreasuryFee;

sellOperationsFee = 2;
sellTreasuryFee = 2;
sellTotalFees = sellOperationsFee + sellLiquidityFee + sellTreasuryFee;

operationsAddress = address(0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F);
treasuryAddress = address(0xDa1F73bC73D6CF230a3DC16630Ef0b3825D80C9F);


 
        
 
        
    }

    
    


    

  
    

    
   

    
    

    function setTaxFree(bool set) external onlyOwner {
    taxFree = set; 
}

function updateBuyFees(
    uint256 _operationsFee,
    uint256 _liquidityFee,
    uint256 _treasuryFee
) external onlyOwner {
    buyOperationsFee = _operationsFee;
    buyLiquidityFee = _liquidityFee;
    buyTreasuryFee = _treasuryFee;
    buyTotalFees = buyOperationsFee + buyLiquidityFee + buyTreasuryFee;
    require(buyTotalFees <= 100, "Must keep fees at 20% or less");
}

function updateSellFees(
    uint256 _operationsFee,
    uint256 _liquidityFee,
    uint256 _treasuryFee
) external onlyOwner {
    sellOperationsFee = _operationsFee;
    sellLiquidityFee = _liquidityFee;
    sellTreasuryFee = _treasuryFee;
    sellTotalFees = sellOperationsFee + sellLiquidityFee + sellTreasuryFee;
    require(sellTotalFees <= 100, "Must keep fees at 30% or less");
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


    
    
    

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "amount must be greater than 0");

        
        
        

       
        uint256 contractTokenBalance = balanceOf(address(this));

bool canSwap = contractTokenBalance >= swapTokensAtAmount;

if (
    canSwap && swapEnabled && !swapping && automatedMarketMakerPairs[to]
) {
    swapping = true;
    swapBack();
    swapping = false;
}



        
bool takeFee = true;
// if any account belongs to _isExcludedFromFee account then remove the fee
if (_isExcludedFromFees[from] || _isExcludedFromFees[to]) {
    takeFee = false;
}
uint256 fees = 0;
// only take fees on buys/sells, do not take on wallet transfers
if (takeFee) {
    // bot/sniper penalty.
    
    
 
     if (automatedMarketMakerPairs[to] &&  sellTotalFees > 0) {
        fees = (amount * sellTotalFees) / 10000;
        tokensForLiquidity += (fees * buyLiquidityFee) / buyTotalFees;
        tokensForOperations +=
            (fees * sellOperationsFee) /
            sellTotalFees;
        tokensForTreasury += (fees * sellTreasuryFee) / sellTotalFees;
    }
    // on buy
    else if (automatedMarketMakerPairs[from] &&  buyTotalFees > 0) {
        fees = (amount * buyTotalFees) / 10000;
        tokensForLiquidity += (fees * sellLiquidityFee) / sellTotalFees;
        
        tokensForOperations += (fees * buyOperationsFee) / buyTotalFees;
        tokensForTreasury += (fees * buyTreasuryFee) / buyTotalFees;
    }
    
    if(!taxFree) {

        if (fees > 0) {
            super._transfer(from, address(this), fees);
        }

        amount -= fees;
    }
}

        super._transfer(from, to, amount);
    }

    
    


    function swapTokensForEth(uint256 tokenAmount) private {
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
    
    


    emit SetAutomatedMarketMakerPair(pair, value);
}

function emergencyUpdateRouter(address router, bool _swapEnabled) external onlyOwner {        
    

    dexRouter = IDexRouter(router);
    swapEnabled = _swapEnabled; 
}


    function transferForeignToken(address _token, address _to)
        external
        onlyOwner
        returns (bool _sent)
    {
        require(_token != address(0), "_token address cannot be 0");
        
        uint256 _contractBalance = IERC20(_token).balanceOf(address(this));
        _sent = IERC20(_token).transfer(_to, _contractBalance);
        emit TransferForeignToken(_token, _contractBalance);
    }

    // withdraw ETH if stuck or someone sends to the address
    function withdrawStuckETH() external onlyOwner {
        bool success;
        (success, ) = address(msg.sender).call{value: address(this).balance}(
            ""
        );
    }


    


    
}