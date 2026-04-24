import React from "react";
import "./Page403.css"; // fichier CSS séparé

const Page403 = () => {
  return (
    <div className="page-403">
      <div className="zen-block">
        <div className="zen-text">
          <h1>403</h1>
          <h2>Accès non autorisé</h2>
          <div className="be-zen">
            <img
              src="/path/to/your/lotus.png" // remplace par ton image
              alt="Lotus Zen"
              className="zen-image"
            />
            <p>Quand une voie se ferme, une autre s'ouvre ... Restez zen comme un lotus.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page403;