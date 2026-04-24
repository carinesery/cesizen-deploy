import styles from "./Header.module.css"

function Header() {
    return (
        <header className={styles.header}>
            <span className={styles.icon}></span>
            <div className={styles.informations}>
                <span className={styles.title}>Bienvenue</span>
                <p className={styles.invitation}>Avec CESIZen, prenez soin de votre santé mentale</p>
            </div>

        </header>



    )
}

export default Header