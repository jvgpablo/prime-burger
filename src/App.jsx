import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { SearchProvider, useSearch } from './context/SearchContext'
import { AdminLoginPage } from './admin/AdminLoginPage'
import { ProductsProvider } from './context/ProductsContext'
import { HomePage } from './menu/HomePage'
import { MenuPage } from './menu/MenuPage'
import { ContactPage } from './menu/ContactPage'
import { AdminPage } from './admin/AdminPage'
import { AuthProvider } from './context/AuthContext'
import { ProtectedAdminRoute } from './admin/ProtectedAdminRoute'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { CategoriesProvider } from './context/CategoriesContext'
import './App.css'

function HeaderSearch() {
	const { query, setQuery } = useSearch()
	return (
		<input
			className="header-search"
			placeholder="Buscar por producto, ingrediente o categoría..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			aria-label="Buscar productos"
		/>
	)
}

function AppShell({ children }) {
	const [navOpen, setNavOpen] = useState(false)
	const { pathname } = useLocation()

	const toggleNav = () => setNavOpen(!navOpen)
	const closeNav = () => setNavOpen(false)

	return (
		<div className="app-shell">
			<header className="main-header">
				<h1>Prime Burger</h1>
				{pathname === '/menu' && <HeaderSearch />}
				<button className="hamburger-button" onClick={toggleNav} aria-label="Toggle menu">
					<span></span>
					<span></span>
					<span></span>
				</button>
				<nav className={`main-nav ${navOpen ? 'nav-open' : ''}`}>
					<NavLink to="/" end onClick={closeNav}>
						Inicio
					</NavLink>
					<NavLink to="/menu" onClick={closeNav}>Menu</NavLink>
					<NavLink to="/contacto" onClick={closeNav}>Contacto</NavLink>
					<NavLink to="/admin" onClick={closeNav}>Admin</NavLink>
				</nav>
			</header>
			<main>{children}</main>
		</div>
	)
}

export default function App() {
	return (
		<AuthProvider>
			<SiteSettingsProvider>
				<CategoriesProvider>
					<ProductsProvider>
						<BrowserRouter>
						<SearchProvider>
						<AppShell>
							<Routes>
								<Route path="/" element={<HomePage />} />
								<Route path="/menu" element={<MenuPage />} />
								<Route path="/contacto" element={<ContactPage />} />
								<Route path="/admin/login" element={<AdminLoginPage />} />
								<Route
									path="/admin"
									element={
										<ProtectedAdminRoute>
											<AdminPage />
										</ProtectedAdminRoute>
									}
								/>
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</AppShell>
					</SearchProvider>
					</BrowserRouter>
				</ProductsProvider>
			</CategoriesProvider>
			</SiteSettingsProvider>
		</AuthProvider>
	)
}
