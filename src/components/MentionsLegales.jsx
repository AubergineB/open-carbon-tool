export default function MentionsLegales({ onBack }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-secondary hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors mb-12"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Retour
        </button>

        <div className="h-[2px] w-12 bg-primary mb-6" />
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight leading-none mb-4">
          Mentions légales
        </h1>
        <p className="text-secondary max-w-lg leading-relaxed mb-12">
          Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN).
        </p>

        <div className="space-y-12">
          {/* Éditeur */}
          <section>
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">
              Éditeur du site
            </h2>
            <div className="bg-surface-lowest p-6 border-t-[3px] border-primary-container space-y-2">
              <p className="text-sm text-primary font-bold">Henri Ducasse — Entrepreneur individuel</p>
              <p className="text-sm text-secondary">Nom commercial : Mobility Transition Lab</p>
              <p className="text-sm text-secondary">Siège social : 75 rue Geoffroy de Montbray, 50200 Coutances</p>
              <p className="text-sm text-secondary">SIRET : 944 170 208 00010</p>
              <p className="text-sm text-secondary">Code APE : 7490B — Activités spécialisées, scientifiques et techniques diverses</p>
              <p className="text-sm text-secondary">Directeur de la publication : Henri Ducasse</p>
              <p className="text-sm text-secondary">Contact : henri.m.ducasse@gmail.com</p>
            </div>
          </section>

          {/* Distribution */}
          <section>
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">
              Distribution
            </h2>
            <div className="bg-surface-lowest p-6 border-t-[3px] border-primary-container space-y-2">
              <p className="text-sm text-primary font-bold">Application desktop locale</p>
              <p className="text-sm text-secondary">Open Carbon Tool ne dépend d'aucun hébergeur ni service distant pour fonctionner.</p>
              <p className="text-sm text-secondary">Les mises à jour et les téléchargements sont distribués depuis le dépôt du projet.</p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">
              Propriété intellectuelle
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Open Carbon Tool est un logiciel open source publié sous licence MIT. Toute personne peut l'utiliser, le copier, le modifier, le forker, le redistribuer et l'intégrer dans un produit commercial ou propriétaire, sans autorisation préalable. La seule obligation est de conserver la notice de copyright et de licence. Le logiciel est fourni « en l'état », sans garantie.
            </p>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              La licence porte sur le code et son contenu. Les marques et logos — Mobility Transition Lab, Bilan Carbone® (Association Bilan Carbone), Base Carbone® (ADEME) — restent la propriété de leurs titulaires respectifs et ne sont pas concédés par la licence MIT.
            </p>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              Les facteurs d'émission utilisés proviennent de la Base Carbone® de l'ADEME, disponible sous licence ouverte. La méthodologie de calcul s'appuie sur le référentiel Bilan Carbone® V9 de l'Association Bilan Carbone (ABC) et le GHG Protocol Corporate Standard du WRI/WBCSD.
            </p>
          </section>

          {/* Protection des données */}
          <section>
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">
              Protection des données personnelles
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Responsable du traitement</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Henri Ducasse, entrepreneur individuel — henri.m.ducasse@gmail.com.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Données collectées</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Aucune donnée personnelle ou donnée de bilan n'est collectée par l'application. Les fichiers sont créés, lus et conservés uniquement sur l'ordinateur de l'utilisateur.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Finalité du traitement</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Les données restent sous le contrôle de l'utilisateur et servent uniquement à produire les restitutions locales du bilan carbone. Aucune donnée n'est utilisée à des fins commerciales ou publicitaires.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Base légale</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  L'application ne réalise aucun traitement distant de données personnelles.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Durée de conservation</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  La durée de conservation dépend exclusivement de l'utilisateur, qui peut déplacer, sauvegarder ou archiver ses fichiers JSON.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Absence de sous-traitant</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Aucun serveur, compte utilisateur, cookie de suivi ou sous-traitant n'est nécessaire au fonctionnement d'Open Carbon Tool. Les fichiers ne quittent pas l'ordinateur de l'utilisateur.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary mb-2">Vos droits</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants sur vos données personnelles :
                </p>
                <ul className="text-sm text-secondary leading-relaxed mt-2 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-outline mt-1">—</span>
                    <span>Droit d'accès, de rectification et d'effacement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-outline mt-1">—</span>
                    <span>Droit à la portabilité des données</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-outline mt-1">—</span>
                    <span>Droit d'opposition et de limitation du traitement</span>
                  </li>
                </ul>
                <p className="text-sm text-secondary leading-relaxed mt-3">
                  Pour toute question relative à l'application, contactez : henri.m.ducasse@gmail.com. Les droits sur les fichiers locaux s'exercent directement depuis le système de fichiers de l'utilisateur.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">
              Cookies
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Open Carbon Tool n'utilise aucun cookie de suivi, de publicité ou d'analyse.
            </p>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">
              Limitation de responsabilité
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Les résultats du bilan carbone sont fournis à titre indicatif et dépendent de la qualité des données saisies par l'utilisateur. Henri Ducasse (EI) ne saurait être tenu responsable des erreurs ou omissions dans les données d'entrée, ni des décisions prises sur la base des résultats produits par l'outil.
            </p>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              Les facteurs d'émission proviennent de la Base Carbone® ADEME (version 2024). Leur exactitude relève de la responsabilité de l'ADEME.
            </p>
          </section>
        </div>

        <div className="border-t border-surface-container mt-16 pt-8">
          <p className="text-[10px] text-outline uppercase tracking-widest">
            Dernière mise à jour : mars 2026
          </p>
        </div>
      </div>
    </div>
  )
}
