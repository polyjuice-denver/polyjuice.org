import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
import { useRouter } from 'next/router';
import Link from 'next/link';
import { classNames } from '../../util/css';
export default function Navbar() {
	const router = useRouter();
	return (
		<nav className={styles.navbar}>
			<a href="https://polyjuice.org/" target={"_blank"}>
				<img className={styles.polyjuice_logo} src="/polyjuice-logo.png"></img>
			</a>
			<div className="text-white w-1/5">
				<ul className="flex flex-row justify-around">
					<li className={classNames(router.pathname === '/market' ? 'text-polygreen' : '')}>
						<Link href="/market">
							Market
						</Link>
					</li>
					<li className={classNames(router.pathname === '/profile' ? 'text-polygreen glow' : '')}>
						<Link href="/profile">
							My Potions
						</Link>
					</li>
				</ul>
				<style jsx>{`
					.nav-item.active a {
					  color: red;
					}
      `}</style>
			</div>
			<ConnectButton className="border border-[#82FF7A]">
			
			</ConnectButton>
		</nav>
	);
}
