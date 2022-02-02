import { Navbar, Footer, Welcome, Services, Transactions } from './components'
export default function App() {
  return (
    <div className="min-h-screeen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  )
}
