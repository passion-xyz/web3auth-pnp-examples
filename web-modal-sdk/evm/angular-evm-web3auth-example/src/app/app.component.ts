import { Component } from '@angular/core';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from '@web3auth/base';
import RPC from './web3RPC'; // for using web3.js
// import RPC from "./ethersRPC"; // for using ethers.js

// Adapters
import { WalletConnectV1Adapter } from '@web3auth/wallet-connect-v1-adapter';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';
import { CoinbaseAdapter } from '@web3auth/coinbase-adapter';

// Plugin
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';

const clientId =
  'BHr_dKcxC0ecKn_2dZQmQeNdjPgWykMkcodEHkVvPMo71qzOV6SgtoN8KCvFdLN7bf34JOm89vWQMLFmSfIo84A'; // get from https://dashboard.web3auth.io

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-app';
  web3auth: Web3Auth | null = null;
  provider: SafeEventEmitterProvider | null = null;
  isModalLoaded = false;

  async ngOnInit() {
    this.web3auth = new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0x1',
        rpcTarget: 'https://rpc.ankr.com/eth', // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
    });
    const web3auth = this.web3auth;

    // Add adapters
    // Configuring adapters

    const walletConnectV1Adapter = new WalletConnectV1Adapter({
      adapterSettings: {
        bridge: 'https://bridge.walletconnect.org',
      },
      clientId,
    });

    web3auth.configureAdapter(walletConnectV1Adapter);

    const metamaskAdapter = new MetamaskAdapter({
      clientId,
    });

    // it will add/update  the metamask adapter in to web3auth class
    web3auth.configureAdapter(metamaskAdapter);

    const torusWalletAdapter = new TorusWalletAdapter({
      clientId,
    });

    // it will add/update  the torus-evm adapter in to web3auth class
    web3auth.configureAdapter(torusWalletAdapter);

    const coinbaseAdapter = new CoinbaseAdapter({
      clientId,
    });
    web3auth.configureAdapter(coinbaseAdapter);

    // Plugin

    const torusPlugin = new TorusWalletConnectorPlugin({
      torusWalletOpts: {},
      walletInitOptions: {
        whiteLabel: {
          theme: { isDark: true, colors: { primary: '#00a8ff' } },
          logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
          logoLight: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
        },
        useWalletConnect: true,
        enableLogging: true,
      },
    });
    await web3auth.addPlugin(torusPlugin);

    await web3auth.initModal();
    if (web3auth.provider) {
      this.provider = web3auth.provider;
    }
    this.isModalLoaded = true;
  }

  login = async () => {
    if (!this.web3auth) {
      this.uiConsole('web3auth not initialized yet');
      return;
    }
    const web3auth = this.web3auth;
    this.provider = await web3auth.connect();
    this.uiConsole('logged in');
  };

  getUserInfo = async () => {
    if (!this.web3auth) {
      this.uiConsole('web3auth not initialized yet');
      return;
    }
    const user = await this.web3auth.getUserInfo();
    this.uiConsole(user);
  };

  getChainId = async () => {
    if (!this.provider) {
      this.uiConsole('provider not initialized yet');
      return;
    }
    const rpc = new RPC(this.provider);
    const chainId = await rpc.getChainId();
    this.uiConsole(chainId);
  };
  getAccounts = async () => {
    if (!this.provider) {
      this.uiConsole('provider not initialized yet');
      return;
    }
    const rpc = new RPC(this.provider);
    const address = await rpc.getAccounts();
    this.uiConsole(address);
  };

  getBalance = async () => {
    if (!this.provider) {
      this.uiConsole('provider not initialized yet');
      return;
    }
    const rpc = new RPC(this.provider);
    const balance = await rpc.getBalance();
    this.uiConsole(balance);
  };

  sendTransaction = async () => {
    if (!this.provider) {
      this.uiConsole('provider not initialized yet');
      return;
    }
    const rpc = new RPC(this.provider);
    const receipt = await rpc.sendTransaction();
    this.uiConsole(receipt);
  };

  signMessage = async () => {
    if (!this.provider) {
      this.uiConsole('provider not initialized yet');
      return;
    }
    const rpc = new RPC(this.provider);
    const signedMessage = await rpc.signMessage();
    this.uiConsole(signedMessage);
  };

  getPrivateKey = async () => {
    if (!this.provider) {
      this.uiConsole('provider not initialized yet');
      return;
    }
    const rpc = new RPC(this.provider);
    const privateKey = await rpc.getPrivateKey();
    this.uiConsole(privateKey);
  };

  logout = async () => {
    if (!this.web3auth) {
      this.uiConsole('web3auth not initialized yet');
      return;
    }
    await this.web3auth.logout();
    this.provider = null;
    this.uiConsole('logged out');
  };

  uiConsole(...args: any[]) {
    const el = document.querySelector('#console-ui>p');
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }
}
