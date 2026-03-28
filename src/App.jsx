import React, { useMemo, useState } from 'react';

const PHAROS_TESTNET = {
  id: 688688,
  chainIdHex: '0xa81f0',
  chainName: 'Pharos Testnet',
  nativeCurrency: {
    name: 'PHRS',
    symbol: 'PHRS',
    decimals: 18
  },
  rpcUrls: ['https://testnet.dplabs-internal.com'],
  blockExplorerUrls: ['https://testnet.pharosscan.xyz']
};

const SHORT_ADDRESS = (value = '') =>
  value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;

function App() {
  const [auth, setAuth] = useState({ email: '', role: 'employer', registered: false });
  const [walletAddress, setWalletAddress] = useState('');
  const [connectedChainId, setConnectedChainId] = useState(null);
  const [walletError, setWalletError] = useState('');
  const [activeTab, setActiveTab] = useState('send');

  const [txForm, setTxForm] = useState({ to: '', amount: '' });
  const [transactionHistory, setTransactionHistory] = useState([]);

  const [payForm, setPayForm] = useState({ worker: '', amount: '' });
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [collectAmount, setCollectAmount] = useState('0');
  const [invoiceMemo, setInvoiceMemo] = useState('Monthly salary invoice');
  const [receivalHistory, setReceivalHistory] = useState([]);

  const isEmployer = auth.role === 'employer';
  const isUser = auth.role === 'user';

  const totalSent = useMemo(
    () => transactionHistory.filter((item) => item.type === 'send').reduce((sum, item) => sum + item.amount, 0),
    [transactionHistory]
  );

  const totalReceived = useMemo(
    () => transactionHistory.filter((item) => item.type === 'receive').reduce((sum, item) => sum + item.amount, 0),
    [transactionHistory]
  );

  const ensurePharos = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask (or compatible wallet) is required.');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: PHAROS_TESTNET.chainIdHex }]
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [PHAROS_TESTNET]
        });
      } else {
        throw error;
      }
    }

    setConnectedChainId(PHAROS_TESTNET.id);
  };

  const connectWallet = async () => {
    setWalletError('');
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found. Install MetaMask first.');
      }

      await ensurePharos();

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
      setWalletAddress(accounts[0] || '');
      setConnectedChainId(Number.parseInt(chainHex, 16));
    } catch (error) {
      setWalletError(error?.message || 'Wallet connection failed.');
    }
  };

  const handleRegister = (event) => {
    event.preventDefault();
    setAuth((current) => ({ ...current, registered: true }));
    setActiveTab('send');
  };

  const onAuthChange = (event) => {
    const { name, value } = event.target;
    setAuth((current) => ({ ...current, [name]: value, registered: false }));
  };

  const onTxFormChange = (event) => {
    const { name, value } = event.target;
    setTxForm((current) => ({ ...current, [name]: value }));
  };

  const pushTransaction = (type) => {
    const amountNumber = Number(txForm.amount);
    if (!txForm.to || !amountNumber) return;

    const nextTx = {
      id: `tx_${Date.now()}`,
      type,
      to: txForm.to,
      amount: amountNumber,
      status: 'Confirmed',
      hash: `0x${Math.random().toString(16).slice(2, 12)}${Math.random().toString(16).slice(2, 12)}`,
      time: new Date().toLocaleString()
    };

    setTransactionHistory((current) => [nextTx, ...current]);
    setTxForm({ to: '', amount: '' });
  };

  const onPayFormChange = (event) => {
    const { name, value } = event.target;
    setPayForm((current) => ({ ...current, [name]: value }));
  };

  const confirmSalaryPayment = () => {
    const amountNumber = Number(payForm.amount);
    if (!payForm.worker || !amountNumber) return;

    const payment = {
      id: `pay_${Date.now()}`,
      worker: payForm.worker,
      amount: amountNumber,
      status: 'Confirmed',
      hash: `0x${Math.random().toString(16).slice(2, 12)}${Math.random().toString(16).slice(2, 12)}`,
      time: new Date().toLocaleString()
    };

    setPaymentHistory((current) => [payment, ...current]);
    setPayForm({ worker: '', amount: '' });
  };

  const collectSalary = () => {
    const amountNumber = Number(collectAmount);
    if (!amountNumber) return;

    const collectEntry = {
      id: `recv_${Date.now()}`,
      amount: amountNumber,
      invoiceMemo,
      invoiceId: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNftId: `NFT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Collected',
      time: new Date().toLocaleString()
    };

    setReceivalHistory((current) => [collectEntry, ...current]);
    setCollectAmount('0');
  };

  const roleTabs = isEmployer
    ? [
        { key: 'send', label: 'Send' },
        { key: 'receive', label: 'Receive' },
        { key: 'pay', label: 'Pay' }
      ]
    : [
        { key: 'send', label: 'Send' },
        { key: 'receive', label: 'Receive' },
        { key: 'collect', label: 'Collect' }
      ];

  return (
    <main className="app-shell">
      <header className="top-card">
        <div>
          <h1>RealFi Payroll · Pharos</h1>
          <p>Connect wallet, switch to Pharos testnet by default, and operate payroll + Web3 transfers.</p>
        </div>
        <div className="wallet-box">
          <p>
            Chain target: <strong>{PHAROS_TESTNET.chainName}</strong> ({PHAROS_TESTNET.id})
          </p>
          <button className="primary" type="button" onClick={connectWallet}>
            {walletAddress ? `Connected: ${SHORT_ADDRESS(walletAddress)}` : 'Connect Wallet'}
          </button>
          <button className="secondary" type="button" onClick={ensurePharos}>
            Switch to Pharos Testnet
          </button>
          <p className="muted">Active chain ID: {connectedChainId ?? 'Not connected'}</p>
          {walletError ? <p className="error">{walletError}</p> : null}
        </div>
      </header>

      <section className="card">
        <h2>Register</h2>
        <form onSubmit={handleRegister} className="register-grid">
          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={auth.email}
              onChange={onAuthChange}
              required
            />
          </label>
          <label>
            Role
            <select name="role" value={auth.role} onChange={onAuthChange}>
              <option value="employer">Employer</option>
              <option value="user">User</option>
            </select>
          </label>
          <button className="primary" type="submit">
            Register
          </button>
        </form>
        {auth.registered ? (
          <p className="success">
            Registered as <strong>{auth.role}</strong> with <strong>{auth.email}</strong>
          </p>
        ) : null}
      </section>

      {auth.registered ? (
        <section className="card">
          <div className="tabs">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={activeTab === tab.key ? 'active' : ''}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'send' || activeTab === 'receive') && (
            <div className="panel">
              <h3>{activeTab === 'send' ? 'Send Transaction' : 'Receive Transaction'}</h3>
              <p className="muted">
                Send/Receive are standard Web3 in/out transfers and are tracked under <strong>Transaction History</strong>.
              </p>
              <div className="form-grid">
                <label>
                  Address
                  <input name="to" placeholder="0x..." value={txForm.to} onChange={onTxFormChange} />
                </label>
                <label>
                  Amount
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={onTxFormChange}
                  />
                </label>
                <button
                  className="primary"
                  type="button"
                  onClick={() => pushTransaction(activeTab === 'send' ? 'send' : 'receive')}
                >
                  Confirm Transaction
                </button>
              </div>
            </div>
          )}

          {isEmployer && activeTab === 'pay' && (
            <div className="panel">
              <h3>Pay Salary</h3>
              <p className="muted">Payroll payment with address, amount, and confirmation action.</p>
              <div className="form-grid">
                <label>
                  Worker Address
                  <input name="worker" placeholder="0x..." value={payForm.worker} onChange={onPayFormChange} />
                </label>
                <label>
                  Salary Amount (USDC)
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1000"
                    value={payForm.amount}
                    onChange={onPayFormChange}
                  />
                </label>
                <button className="primary" type="button" onClick={confirmSalaryPayment}>
                  Confirm Transaction
                </button>
              </div>
            </div>
          )}

          {isUser && activeTab === 'collect' && (
            <div className="panel">
              <h3>Collect Salary</h3>
              <p className="muted">
                Collect is for salary receival and includes amount received, invoice creation, invoice minting, and invoice NFT send.
              </p>
              <div className="form-grid">
                <label>
                  Amount Received (USDC)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={collectAmount}
                    onChange={(event) => setCollectAmount(event.target.value)}
                  />
                </label>
                <label>
                  Create Invoice (Memo)
                  <input value={invoiceMemo} onChange={(event) => setInvoiceMemo(event.target.value)} />
                </label>
                <button className="primary" type="button" onClick={collectSalary}>
                  Mint Invoice and Send Invoice NFT
                </button>
              </div>
            </div>
          )}

          <div className="history-grid">
            <article className="history-card">
              <h3>Transaction History</h3>
              <p className="muted">For standard send/receive transfers.</p>
              <ul>
                {transactionHistory.length === 0 ? (
                  <li>No transactions yet.</li>
                ) : (
                  transactionHistory.map((item) => (
                    <li key={item.id}>
                      <strong>{item.type.toUpperCase()}</strong> · {item.amount} · {SHORT_ADDRESS(item.to)} · {item.status}
                    </li>
                  ))
                )}
              </ul>
              <p className="muted small">Total sent: {totalSent} | Total received: {totalReceived}</p>
            </article>

            {isEmployer ? (
              <article className="history-card">
                <h3>Payment History</h3>
                <p className="muted">For salary pay actions.</p>
                <ul>
                  {paymentHistory.length === 0 ? (
                    <li>No salary payments yet.</li>
                  ) : (
                    paymentHistory.map((item) => (
                      <li key={item.id}>
                        {item.amount} USDC → {SHORT_ADDRESS(item.worker)} · {item.status}
                      </li>
                    ))
                  )}
                </ul>
              </article>
            ) : (
              <article className="history-card">
                <h3>Receival History</h3>
                <p className="muted">For salary collect actions.</p>
                <ul>
                  {receivalHistory.length === 0 ? (
                    <li>No salary receivals yet.</li>
                  ) : (
                    receivalHistory.map((item) => (
                      <li key={item.id}>
                        {item.amount} USDC · {item.status} · Invoice {item.invoiceId} · NFT {item.invoiceNftId}
                      </li>
                    ))
                  )}
                </ul>
              </article>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default App;
