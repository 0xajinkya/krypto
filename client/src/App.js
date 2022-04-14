import { Navbar, Welcome, Footer, Services, Transactions } from "./components";
import { SiEthereum } from 'react-icons/si';
import {BsInfoCircle} from 'react-icons/bs'

const App = () => (
  <div className="min-h-screen">
    <div className="gradient-bg-welcome">
      <Navbar />
      <Welcome />
    </div>
    <Services />
    <Transactions />
    <Footer />
  </div>
);

export default App;