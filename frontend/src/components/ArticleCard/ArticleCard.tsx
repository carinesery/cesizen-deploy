import styles from "./ArticleCard.module.css";

function ArticleCard() {
    return(
        <>
            <div className={styles.topCard}>
                <span className={styles.category}>Exercices</span>
                <span className={styles.time}>
                    <span className={styles.timeIcon}></span>
                    <span className={styles.duration}>6 min</span>
                </span>
            </div>
            <div className={styles.subject}>
                <h2 className={styles.titleArticle}>La cohérence cardiaque : exercice de respiration efficace</h2>
                <p className={styles.summaryArticle}>Découvrez la cohérence cardiaque, une technique de respiration simple et</p>
            </div>
            <div className={styles.creationArticle}>
                <span className={styles.time}>
                    <span className={styles.authorIcon}></span>
                    <span className={styles.author}>D. Durant</span>
                </span>
                <span className={styles.date}>Exercices</span>
            </div>
        </>
    )
}
export default ArticleCard