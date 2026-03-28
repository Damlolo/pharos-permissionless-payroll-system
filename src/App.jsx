import { useMemo, useState } from 'react';

const PHAROS_CHAIN = {
  id: 688688,
  name: 'Pharos Testnet',
  rpcUrl: 'https://testnet.dplabs-internal.com',
  explorer: 'https://testnet.pharosscan.xyz'
};

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 10, name: 'Optimism' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 8453, name: 'Base' },
  { id: PHAROS_CHAIN.id, name: PHAROS_CHAIN.name }
];

const INITIAL_PAYMENTS = [
  {
    id: 'pay_001',
    worker: '0xA12D...9Fa2',
    amount: 1200,
    sourceChain: 'Ethereum',
    destinationChain: 'Pharos Testnet',
    status: 'Settled',
    txHash: '0x8fc...a11',
    streamedPerSecond: false,
    timestamp: '2026-03-28T09:00:00Z'
  },
  {
    id: 'pay_002',
    worker: '0xA12D...9Fa2',
    amount: 450,
    sourceChain: 'Base',
    destinationChain: 'Pharos Testnet',
    status: 'Streaming',
    txHash: '0x92b...ee4',
    streamedPerSecond: true,
    timestamp: '2026-03-28T10:15:00Z'
  }
];

function App() {
  const [mode, setMode] = useState('employer');
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [invoiceAmount, setInvoiceAmount] = useState('350');
  const [invoiceMemo, setInvoiceMemo] = useState('March maintenance retainer');
  const [invoiceNftTokenId, setInvoiceNftTokenId] = useState('');

  const [employerForm, setEmployerForm] = useState({
    worker: '',
    amount: '',
    sourceChainId: '1',
    destinationChainId: String(PHAROS_CHAIN.id),
    streamPerSecond: false
  });

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
    [payments]
  );

  const settledPayments = useMemo(
    () => payments.filter((payment) => payment.status === 'Settled').length,
    [payments]
  );

  const creditScore = useMemo(() => {
    if (!payments.length) return 300;
    const punctualityScore = (settledPayments / payments.length) * 450;
    const historyScore = Math.min(payments.length * 30, 220);
    const volumeScore = Math.min(totalPaid / 25, 180);
    return Math.min(Math.round(300 + punctualityScore + historyScore + volumeScore), 850);
  }, [payments, settledPayments, totalPaid]);

  const handleEmployerChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEmployerForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePay = (event) => {
    event.preventDefault();

    const sourceChain = SUPPORTED_CHAINS.find(
      (chain) => String(chain.id) === employerForm.sourceChainId
    );
    const destinationChain = SUPPORTED_CHAINS.find(
      (chain) => String(chain.id) === employerForm.destinationChainId
    );

    const payment = {
      id: `pay_${String(Date.now()).slice(-6)}`,
      worker: employerForm.worker,
      amount: Number(employerForm.amount),
      sourceChain: sourceChain?.name ?? 'Unknown',
      destinationChain: destinationChain?.name ?? 'Unknown',
      status: employerForm.streamPerSecond ? 'Streaming' : 'Pending CCTP',
      txHash: `0x${Math.random().toString(16).slice(2, 14)}...${Math.random()
        .toString(16)
        .slice(2, 6)}`,
      streamedPerSecond: employerForm.streamPerSecond,
      timestamp: new Date().toISOString()
    };

    setPayments((current) => [payment, ...current]);

    setEmployerForm({
      worker: '',
      amount: '',
      sourceChainId: employerForm.sourceChainId,
      destinationChainId: employerForm.destinationChainId,
      streamPerSecond: employerForm.streamPerSecond
    });
  };

  const handleGenerateInvoice = (event) => {
    event.preventDefault();
    const generatedId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    setInvoiceNftTokenId(generatedId);
  };

  return (
    <main className="container">
      <header className="hero">
        <h1>RealFi Payroll dApp on Pharos</h1>
        <p>
          Deposit USDC from any chain, route with CCTP, settle instantly in worker-preferred chain,
          and power programmable payroll with streaming, invoice NFTs, and credit intelligence.
        </p>
        <div className="chain-card">
          <h3>Pharos Network Target</h3>
          <p>
            Chain: <strong>{PHAROS_CHAIN.name}</strong> (ID: {PHAROS_CHAIN.id})
          </p>
          <p>RPC: {PHAROS_CHAIN.rpcUrl}</p>
          <a href={PHAROS_CHAIN.explorer} target="_blank" rel="noreferrer">
            Open Explorer
          </a>
        </div>
      </header>

      <section className="mode-switch">
        <button
          className={mode === 'employer' ? 'active' : ''}
          onClick={() => setMode('employer')}
          type="button"
        >
          Employer UI
        </button>
        <button
          className={mode === 'worker' ? 'active' : ''}
          onClick={() => setMode('worker')}
          type="button"
        >
          Worker UI
        </button>
      </section>

      {mode === 'employer' ? (
        <section className="panel">
          <h2>Employer Payroll Console</h2>
          <form onSubmit={handlePay} className="form-grid">
            <label>
              Worker address
              <input
                name="worker"
                placeholder="0x..."
                value={employerForm.worker}
                onChange={handleEmployerChange}
                required
              />
            </label>
            <label>
              Amount (USDC)
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="1000"
                value={employerForm.amount}
                onChange={handleEmployerChange}
                required
              />
            </label>
            <label>
              Source chain
              <select name="sourceChainId" value={employerForm.sourceChainId} onChange={handleEmployerChange}>
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={`source-${chain.id}`} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Destination chain
              <select
                name="destinationChainId"
                value={employerForm.destinationChainId}
                onChange={handleEmployerChange}
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={`destination-${chain.id}`} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox">
              <input
                name="streamPerSecond"
                type="checkbox"
                checked={employerForm.streamPerSecond}
                onChange={handleEmployerChange}
              />
              Enable per-second salary streaming
            </label>
            <button className="cta" type="submit">
              Pay via CCTP
            </button>
          </form>

          <div className="flow-note">
            <h3>Execution Flow</h3>
            <ol>
              <li>Employer deposits USDC on source chain vault.</li>
              <li>CCTP burns and mints canonical USDC on destination chain.</li>
              <li>Payroll contract on Pharos settles instantly or starts streaming schedule.</li>
            </ol>
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2>Worker Payment Hub</h2>
          <div className="stats">
            <article>
              <h3>Total received</h3>
              <p>{totalPaid.toLocaleString()} USDC</p>
            </article>
            <article>
              <h3>Settled payouts</h3>
              <p>{settledPayments}</p>
            </article>
            <article>
              <h3>Credit score</h3>
              <p>{creditScore}</p>
            </article>
          </div>

          <h3>Payment history and transaction status</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Route</th>
                <th>Status</th>
                <th>Tx</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.amount} USDC</td>
                  <td>
                    {payment.sourceChain} → {payment.destinationChain}
                  </td>
                  <td>{payment.status}</td>
                  <td>{payment.txHash}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={handleGenerateInvoice} className="invoice-form">
            <h3>Generate invoice and convert to NFT</h3>
            <label>
              Invoice amount (USDC)
              <input
                type="number"
                min="1"
                value={invoiceAmount}
                onChange={(event) => setInvoiceAmount(event.target.value)}
                required
              />
            </label>
            <label>
              Memo
              <input value={invoiceMemo} onChange={(event) => setInvoiceMemo(event.target.value)} required />
            </label>
            <button type="submit" className="cta">
              Mint invoice NFT
            </button>
            {invoiceNftTokenId ? (
              <p className="success">
                Invoice token minted: <strong>{invoiceNftTokenId}</strong> ({invoiceAmount} USDC · {invoiceMemo})
              </p>
            ) : null}
          </form>
        </section>
      )}
    </main>
  );
}

export default App;
