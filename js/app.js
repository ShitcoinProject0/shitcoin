const Web3 = require("web3");

var countDownDate = new Date("February 01, 2022 00:00:00").getTime();

window.addEventListener("load", function(event) {
    if (typeof window.ethereum !== 'undefined') { //MetaMask
        App.init();
      }else{ //No MetaMask
        if((countDownDate - new Date().getTime()) > 0){
            timeInfo();
        }else{
            var setup = $('#setup'); //All interface
            var preSetup = $('#preSetup'); //All interface
            var noSetup = $('#noSetup'); //All interface
            var loading = $('#loading'); //Loading
            
            preSetup.hide();
            setup.hide();
            loading.hide();
            noSetup.show();
        }
      }
  });

window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
});
window.ethereum.on('chainChanged', function (accounts) {
    window.location.reload();
});
window.ethereum.on('connect', function (accounts) {

});
window.ethereum.on('disconnect', function (accounts) {
    //window.location.reload();
});
window.addEventListener("resize", onResize);

function timeInfo(){
    var setup = $('#setup'); //All interface
    var preSetup = $('#preSetup'); //All interface
    var noSetup = $('#noSetup'); //All interface
    var loading = $('#loading'); //Loading

    setup.hide();
    loading.hide();
    preSetup.show();

    var x = setInterval(function() {

        var now = new Date().getTime();
      
        var distance = countDownDate - now;
      
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
        document.getElementById("remaining-time").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";
      
        if (distance < 0) {
          clearInterval(x);
          document.getElementById("remaining-time").innerHTML = "EXPIRED";
        }

        var progressPercent = (580) * (now/countDownDate) - (579); //(5000/3) * (now/countDownDate) - (4997/3);
        $('.time-percentage').html((progressPercent * 100).toFixed(2));

        var progressPx;
        if(window.innerWidth > 767){
            progressPx = 450 * (1 - progressPercent);
        }else if(window.innerWidth <= 767 && window.innerWidth > 450){
            progressPx = 335 * (1 - progressPercent);
        }else{
            progressPx = 220 * (1 - progressPercent);
        }
        document.documentElement.style.setProperty('--progressLevel', progressPx + "px");
      }, 1000);
}

function onResize(){
    App.render();
}

async function checkConnection(){
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if(accounts[0]!=undefined){
        window.location.reload();
    }
}

async function checkLinkStatus(){
    if(parseInt(await ethereum.request({ method: 'eth_chainId' })) == App.chainCorrect){
        //window.location.reload();
        App.render();
    }
}

const BSC_MAINNET_PARAM = [{
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency:
        {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
}]

const BSC_TESTNET_PARAM = [{
    chainId: '0x61',
    chainName: 'Binance Smart Chain Testnet',
    nativeCurrency:
        {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
}]

const tokenAddress = '0x64ff24f5ffa1d278c49fe740e70ec3890d3bb880';
const tokenSymbol = 'SHIT';
const tokenDecimals = 0;
const tokenImage = 'https://shitcoinproject.com/img/token/token.png';

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 0,
    tokensSold: 0,
    tokensToSell: 1,
    tokensMax: 100000000,
    chainCorrect: 56,

    init: function(){
        //console.log("App initialized...");
        //console.log(ethereum.isMetaMask);
        //console.log(ethereum.isConnected());
        /*if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
          }else{
            console.log('MetaMask is not installed!');
          }*/
        return App.initWeb3();
    },

    initWeb3: function(){
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
          } else{
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/622b49dee1ea497a833b289adb90e8c8');
            web3 = new Web3(App.web3Provider);
          }
          return App.initContracts();
    },

    initMetamask: function(){
        ethereum.request({ method: 'eth_requestAccounts' });
        var checkStatus = window.setInterval(checkConnection, 1000);
    },

    linkMetamask: async function(){
        ethereum.request({method: 'wallet_addEthereumChain', params:BSC_MAINNET_PARAM}).catch();
        var checkLink = window.setInterval(checkLinkStatus, 1000);
    },

    addToken: async function(){
        try { //Add Token Method
            const wasAdded = await ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: tokenAddress, // The address that the token is at.
                  symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                  decimals: tokenDecimals, // The number of decimals in the token
                  image: tokenImage, // A string url of the token logo
                },
              },
            });
          } catch (error) {
            console.log(error);
        }
    },

    initContracts: function(){
        $.getJSON("ShitcoinPreSale.json", function(shitcoinPreSale){
            App.contracts.ShitcoinPreSale = TruffleContract(shitcoinPreSale);
            App.contracts.ShitcoinPreSale.setProvider(App.web3Provider);
            App.contracts.ShitcoinPreSale.deployed().then(function(shitcoinPreSale){
            //console.log("Shitcoin Sale Address:", shitcoinPreSale.address);
            });
        }).done(function(){
            $.getJSON("Shitcoin.json", function(shitcoin){
                App.contracts.Shitcoin = TruffleContract(shitcoin);
                App.contracts.Shitcoin.setProvider(App.web3Provider);
                App.contracts.Shitcoin.deployed().then(function(shitcoin){
                //console.log("Shitcoin Address:", shitcoin.address);
                });

                App.listenForEvents();
                return App.render();
            });
        });
    },

    render: async function(){
        if(App.loading) {
            return;
        }
        App.loading = true;
        var loader = $('#loader'); //Connect Wallet interface
        var content = $('#content'); //Buy token interfaces
        var userAddress = $('#userAddress'); //User Address interface
        var userBalance = $('#userBalance'); //User Balance interface
        var link = $('#link'); //Link Wallet interface
        var setup = $('#setup'); //All interface
        var preSetup = $('#preSetup'); //All interface
        var loading = $('#loading'); //Loading interface
        var reminder = $('#saleRemind'); //Reminder interface

        preSetup.hide();
        setup.hide();
        loading.show();

        if((countDownDate - new Date().getTime()) > 0){
            timeInfo();
        }else{
        App.account = await ethereum.request({ method: 'eth_accounts' });
        if(App.account[0]!=undefined){ //Not connected to Metamask
            //console.log("Connected");

            loader.hide();
            $('#accountAddress').html("Your Account: " + App.account);
            userAddress.show();

            const chain = parseInt(await ethereum.request({ method: 'eth_chainId' }));
            if(chain == App.chainCorrect){
                console.log("Chain Correct");

                link.hide();

                shitcoinInstance = await App.contracts.Shitcoin.deployed();
                $('.token-balance').html((await shitcoinInstance.balanceOf(App.account)).toNumber());
                userBalance.show();
                reminder.hide();

                shitcoinPreSaleInstance = await App.contracts.ShitcoinPreSale.deployed();
                App.tokensToSell = (await shitcoinPreSaleInstance.tokensToSell()).toNumber();
                App.investorHardCap = (await shitcoinPreSaleInstance.investorHardCap()).toNumber();
                
                if(App.tokensToSell != 0){
                    //console.log("Sale open");

                    content.show();

                    App.tokenPrice = (await shitcoinPreSaleInstance.tokenPrice()).toNumber();
                    $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
                    $('.token-hardcap').html(App.investorHardCap);
                    $('.bnb-hardcap').html(Math.round(App.investorHardCap * web3.fromWei(App.tokenPrice, "ether")));
                    $('.percentage-hardcap').html((App.investorHardCap / App.tokensToSell)*100);
                    App.tokensSold = (await shitcoinPreSaleInstance.tokensSold()).toNumber();
                    $('.tokens-sold').html(App.tokensSold);
                    $('.tokens-available').html(App.tokensToSell);

                    var progressPercent = (App.tokensSold / App.tokensToSell);
                    $('.tokens-sold-percentage').html((progressPercent * 100).toFixed(2));

                    var progressPx;
                    if(window.innerWidth > 767){
                        progressPx = 450 * (1 - progressPercent);
                    }else if(window.innerWidth <= 767 && window.innerWidth > 450){
                        progressPx = 335 * (1 - progressPercent);
                    }else{
                        progressPx = 220 * (1 - progressPercent);
                    }
                    document.documentElement.style.setProperty('--progressLevel', progressPx + "px");

                    App.loading = false;
                    loading.hide();
                    setup.show();
                }else{
                    //console.log("Sale close");

                    $('.tokens-sold-percentage').html(100);
                    $('.tokens-sold').html(App.tokensMax);
                    $('.tokens-available').html(App.tokensMax);
                    $('#saleInt').html("Pre Sale ICO completed!");

                    App.loading = false;
                    loading.hide();
                    setup.show();
                }
            }else{
                //console.log("Chain Incorrect");

                link.show();

                switch(chain){
                    case 1:
                        $('#chain-connected').html("Ethereum Mainnet");
                        break;
                    case 3:
                        $('#chain-connected').html("Ropsten Testnet");
                        break;
                    case 4:
                        $('#chain-connected').html("Rinkeby Testnet");
                        break;
                    case 5:
                        $('#chain-connected').html("Goerli Testnet");
                        break;
                    case 42:
                        $('#chain-connected').html("Kovan Testnet");
                        break;
                    case 97:
                        $('#chain-connected').html("Binance Smart Chain Testnet");
                        break;
                    case 56:
                        $('#chain-connected').html("Binance Smart Chain Mainnet");
                        break;
                    default:
                        $('#chain-connected').html("UNKNOWN");
                }

                App.loading = false;
                loading.hide();
                setup.show();
            }
        }else{
            //console.log("Not Connected");

            App.loading = false;
            loading.hide();
            setup.show();
        }
        }
    },

    buyTokens: async function(){
        if(App.loading) {
            return;
        } 
        App.loading = true;
        var loader = $('#loader');
        var content = $('#content');
        var addToken = $('#add'); //Add token interface

        content.hide();
        loader.show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.ShitcoinPreSale.deployed().then(function(instance){
            return instance.buyTokens(numberOfTokens, {
                from: App.account.toString(),
                value: numberOfTokens * App.tokenPrice,
                gas: 150000 //Gas limit
            });
        });

        App.addToken();
        //addToken.show();

        App.loading = false;
        loader.hide();
        content.show();
    },

    listenForEvents: function(){
        App.contracts.ShitcoinPreSale.deployed().then(function(instance){
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error, event){
                App.render();
            });
        });
    },
}