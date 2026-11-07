import { useEffect, useState } from "react";
import "./App.css";

const initialStocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 1450 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3200 },
  { symbol: "INFY", name: "Infosys", price: 1550 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1750 },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1250 },
  { symbol: "WIPRO", name: "Wipro", price: 520 },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 850 },
  { symbol: "ITC", name: "ITC Limited", price: 450 },
];

function App() {
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("users")) || []
  );

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );

  const [stocks, setStocks] = useState(initialStocks);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const [transactions, setTransactions] = useState(
    JSON.parse(localStorage.getItem("transactions")) || []
  );

  const [holdings, setHoldings] = useState(
    JSON.parse(localStorage.getItem("holdings")) || []
  );

  const [balance, setBalance] = useState(
    Number(localStorage.getItem("balance")) || 100000
  );

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("holdings", JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStocks((previous) =>
        previous.map((stock) => ({
          ...stock,
          price: Math.max(
            1,
            Math.round(stock.price + (Math.random() - 0.48) * 10)
          ),
        }))
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // LOGIN FUNCTION
  function login(e) {
    e.preventDefault();

    if (email === "admin" && password === "admin123") {
      const adminUser = {
        name: "Administrator",
        email: "admin",
        password: password,
        role: "admin",
      };

      console.log("===== ADMIN LOGIN SUCCESSFUL =====");
      console.log("Username:", email);
      console.log("Password:", password);
      console.log("Role:", "admin");

      setCurrentUser(adminUser);
      return;
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      console.log("===== USER LOGIN SUCCESSFUL =====");
      console.log("Name:", user.name);
      console.log("Username / Email:", user.email);
      console.log("Password:", password);
      console.log("Role:", user.role);

      setCurrentUser(user);
    } else {
      console.error("Invalid email or password!");
      alert("Invalid email or password!");
    }
  }

  // SIGNUP FUNCTION
  function signup(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (users.some((u) => u.email === email)) {
      alert("Account already exists!");
      return;
    }

    const newUser = {
      name,
      email,
      password,
      role: "user",
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);

    console.log("===== NEW USER REGISTERED =====");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", "user");

    alert("Account created successfully!");
  }

  // LOGOUT FUNCTION
  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setPage("Dashboard");
  }

  // BUY STOCK
  function buyStock(stock) {
    const quantity = Number(prompt("Enter quantity to buy:"));

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Enter a valid quantity");
      return;
    }

    const total = stock.price * quantity;

    if (total > balance) {
      alert("Insufficient virtual balance!");
      return;
    }

    setBalance(balance - total);

    const existing = holdings.find(
      (item) => item.symbol === stock.symbol
    );

    if (existing) {
      setHoldings(
        holdings.map((item) =>
          item.symbol === stock.symbol
            ? {
                ...item,
                quantity: item.quantity + quantity,
                averagePrice:
                  (item.averagePrice * item.quantity + total) /
                  (item.quantity + quantity),
              }
            : item
        )
      );
    } else {
      setHoldings([
        ...holdings,
        {
          symbol: stock.symbol,
          name: stock.name,
          quantity,
          averagePrice: stock.price,
        },
      ]);
    }

    setTransactions([
      {
        id: Date.now(),
        symbol: stock.symbol,
        type: "BUY",
        quantity,
        price: stock.price,
        date: new Date().toLocaleString(),
      },
      ...transactions,
    ]);

    alert("Stock purchased successfully!");
  }

  // SELL STOCK
  function sellStock(stock) {
    const holding = holdings.find(
      (item) => item.symbol === stock.symbol
    );

    if (!holding) {
      alert("You don't own this stock");
      return;
    }

    const quantity = Number(prompt("Enter quantity to sell:"));

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > holding.quantity
    ) {
      alert("Invalid quantity!");
      return;
    }

    const total = stock.price * quantity;

    setBalance(balance + total);

    setHoldings(
      holdings
        .map((item) =>
          item.symbol === stock.symbol
            ? { ...item, quantity: item.quantity - quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setTransactions([
      {
        id: Date.now(),
        symbol: stock.symbol,
        type: "SELL",
        quantity,
        price: stock.price,
        date: new Date().toLocaleString(),
      },
      ...transactions,
    ]);

    alert("Stock sold successfully!");
  }

  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="logo">
            TradeSim<span>Pro</span>
          </div>

          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

          <p className="muted">
            Virtual Stock Trading Simulator
          </p>

          <form onSubmit={isSignup ? signup : login}>
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="text"
              placeholder="Email or Admin Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="primary-btn" type="submit">
              {isSignup ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="switch-text">
            {isSignup ? "Already have an account?" : "New user?"}

            <span onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? " Login" : " Sign Up"}
            </span>
          </p>

          <div className="demo-info">
            <b>Demo Admin Account</b>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";

  const portfolioValue = holdings.reduce((total, item) => {
    const stock = stocks.find((s) => s.symbol === item.symbol);
    return total + (stock ? stock.price * item.quantity : 0);
  }, 0);

  const invested = holdings.reduce(
    (total, item) => total + item.averagePrice * item.quantity,
    0
  );

  const profitLoss = portfolioValue - invested;

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="logo">
          TradeSim<span>Pro</span>
        </h2>

        <p className="menu-title">MENU</p>

        {[
          "Dashboard",
          "Market",
          "Portfolio",
          "Transactions",
          ...(isAdmin ? ["Admin"] : []),
        ].map((item) => (
          <button
            key={item}
            className={`nav-item ${page === item ? "active" : ""}`}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{page}</h2>
            <p className="muted">Welcome, {currentUser.name}</p>
          </div>

          <div className="user-badge">
            {isAdmin ? "ADMIN" : "USER"}
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <h1>Welcome to TradeSim Pro</h1>
                <p>
                  Learn stock trading without risking real money.
                </p>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <p>Available Balance</p>
                <h2>₹{balance.toLocaleString("en-IN")}</h2>
              </div>

              <div className="stat-card">
                <p>Portfolio Value</p>
                <h2>₹{portfolioValue.toLocaleString("en-IN")}</h2>
              </div>

              <div className="stat-card">
                <p>Total Investment</p>
                <h2>₹{invested.toLocaleString("en-IN")}</h2>
              </div>

              <div className="stat-card">
                <p>Profit / Loss</p>
                <h2 className={profitLoss >= 0 ? "green" : "red"}>
                  ₹{profitLoss.toLocaleString("en-IN")}
                </h2>
              </div>
            </section>

            <section className="content-card">
              <h2>Market Overview</h2>
              <p className="muted">
                Explore stocks and start virtual trading.
              </p>

              <button
                className="primary-btn small-btn"
                onClick={() => setPage("Market")}
              >
                Explore Market
              </button>
            </section>
          </>
        )}

        {page === "Market" && (
          <section className="content-card">
            <h2>Stock Market</h2>

            <input
              className="search-input"
              placeholder="Search stocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    {!isAdmin && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.symbol}>
                      <td>{stock.name}</td>
                      <td>{stock.symbol}</td>
                      <td>₹{stock.price.toLocaleString("en-IN")}</td>

                      {!isAdmin && (
                        <td>
                          <button
                            className="buy-btn"
                            onClick={() => buyStock(stock)}
                          >
                            Buy
                          </button>

                          <button
                            className="sell-btn"
                            onClick={() => sellStock(stock)}
                          >
                            Sell
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === "Portfolio" && (
          <section className="content-card">
            <h2>My Portfolio</h2>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Quantity</th>
                    <th>Average Price</th>
                    <th>Current Price</th>
                    <th>Value</th>
                  </tr>
                </thead>

                <tbody>
                  {holdings.map((item) => {
                    const stock = stocks.find(
                      (s) => s.symbol === item.symbol
                    );

                    return (
                      <tr key={item.symbol}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.averagePrice.toFixed(2)}</td>
                        <td>₹{stock?.price}</td>
                        <td>
                          ₹{(
                            (stock?.price || 0) * item.quantity
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {holdings.length === 0 && (
                <p className="empty-text">
                  No stocks in your portfolio. Visit Market to buy stocks.
                </p>
              )}
            </div>
          </section>
        )}

        {page === "Transactions" && (
          <section className="content-card">
            <h2>Transaction History</h2>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.symbol}</td>
                      <td className={item.type === "BUY" ? "green" : "red"}>
                        {item.type}
                      </td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.length === 0 && (
                <p className="empty-text">No transactions yet.</p>
              )}
            </div>
          </section>
        )}

        {page === "Admin" && isAdmin && (
          <section className="content-card">
            <h2>Admin Dashboard</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <p>Total Registered Users</p>
                <h2>{users.length}</h2>
              </div>

              <div className="stat-card">
                <p>Available Stocks</p>
                <h2>{stocks.length}</h2>
              </div>

              <div className="stat-card">
                <p>Total Transactions</p>
                <h2>{transactions.length}</h2>
              </div>
            </div>

            <h3>Registered Users</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;