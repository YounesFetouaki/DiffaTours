# Cahier des Charges - Plateforme de Réservation Riad & Excursions

**Version:** 1.0  
**Date:** 28 Novembre 2025  
**Statut:** En production

---

## 1. Présentation du Projet

### 1.1 Contexte
Plateforme web complète pour un riad marocain offrant des services d'hébergement, de restauration et d'excursions touristiques au Maroc (Marrakech, Agadir, Taghazout).

### 1.2 Objectifs
- Permettre la réservation en ligne de chambres et d'excursions
- Offrir une expérience utilisateur moderne et fluide
- Gérer les tarifs sur demande pour les circuits personnalisés
- Administrer les réservations, capacités et utilisateurs
- Automatiser les notifications clients (SMS/WhatsApp)
- Supporter plusieurs langues (français, anglais, arabe)

### 1.3 Périmètre
**Inclus:**
- Site web public multilingue
- Système de réservation en ligne
- Paiement en ligne sécurisé
- Espace client personnel
- Panneau d'administration complet
- Système de badges pour le personnel
- Notifications automatiques
- Gestion de capacité/disponibilité

**Exclus:**
- Application mobile native
- Intégration avec des OTA (Booking.com, Airbnb)
- Système de fidélité avancé

---

## 2. Spécifications Fonctionnelles

### 2.1 Modules Principaux

#### **A. Site Public**
- **Page d'accueil:** Présentation du riad, services, excursions vedettes
- **Présentation du riad:** Histoire, philosophie, galerie photos
- **Chambres & Suites:** Catalogue avec descriptions, photos, tarifs
- **Restaurant:** Menu, spécialités, ambiance
- **Excursions:**
  - Liste complète des excursions disponibles
  - Filtrage par destination (Marrakech, Agadir, Taghazout)
  - Détails complets (itinéraire, inclus/exclus, photos)
  - Prix fixes ou "Prix sur demande" (contact)
  - Système d'avis clients
- **Circuits:** Tours multi-jours avec itinéraires détaillés
- **Autres services:** Services additionnels (spa, transferts, etc.)
- **Qui sommes-nous:** Présentation de l'équipe
- **Contact:** Formulaire de contact avec envoi d'emails

#### **B. Système de Réservation**
- **Panier d'achat:**
  - Ajout/suppression d'excursions
  - Gestion des extras (options supplémentaires)
  - Sélection de dates
  - Calcul automatique des totaux
  - Gestion des tarifs "sur demande"
- **Processus de réservation:**
  - Formulaire de coordonnées client
  - Sélection de participants
  - Vérification de disponibilité en temps réel
  - Récapitulatif avant paiement
- **Paiement:**
  - Intégration CMI (Centre Monétique Interbancaire)
  - Paiement sécurisé par carte bancaire
  - Génération de factures PDF
  - Envoi automatique de confirmations

#### **C. Espace Client**
- **Mon compte:**
  - Profil utilisateur
  - Historique des réservations
  - Statut des commandes
- **Mes réservations:**
  - Liste des réservations actives/passées
  - Téléchargement de factures
  - Suivi en temps réel
- **Favoris:**
  - Liste de souhaits d'excursions
  - Partage de favoris
- **Badges:**
  - Affichage du badge personnel avec QR code
  - Code unique pour identification

#### **D. Panneau d'Administration**
- **Gestion des excursions:**
  - Création/modification/suppression
  - Upload d'images multiples
  - Gestion des tarifs et disponibilités
  - Configuration des extras
  - Mise à jour en masse (bulk update)
- **Gestion des commandes:**
  - Liste complète des réservations
  - Filtrage et recherche avancée
  - Changement de statut
  - Envoi de confirmations manuelles
  - Génération de rapports
- **Gestion des utilisateurs:**
  - Liste des clients
  - Attribution de rôles (admin, staff, client)
  - Synchronisation avec Clerk
- **Gestion de capacité:**
  - Calendrier des disponibilités
  - Limites par excursion/date
  - Vérification automatique
- **Analytiques:**
  - Statistiques de réservations
  - Revenus
  - Taux de conversion
- **Paramètres:**
  - Configuration des sections d'excursions
  - Horaires et disponibilités
  - Tarification

#### **E. Système de Personnel (Staff)**
- **Scanner de badges:**
  - Lecture de QR codes clients
  - Vérification de réservations
  - Enregistrement de présence
- **Historique:**
  - Liste des scans effectués
  - Traçabilité complète
- **Gestion des badges:**
  - Génération automatique
  - Révocation si nécessaire
  - Historique d'utilisation

#### **F. Notifications Automatiques**
- **SMS:**
  - Confirmation de réservation
  - Rappels avant excursion
  - Notifications de changement
  - Logs et historique
- **WhatsApp:**
  - Messages de confirmation enrichis
  - Webhooks pour suivi
  - Préférences utilisateur
- **Email:**
  - Confirmations de commande
  - Factures PDF attachées
  - Newsletters (future)

### 2.2 Rôles et Permissions

#### **Client (User)**
- Consulter le catalogue
- Réserver des excursions
- Gérer son compte
- Accéder à ses réservations
- Recevoir son badge

#### **Personnel (Staff)**
- Scanner les badges clients
- Voir l'historique des scans
- Vérifier les réservations du jour

#### **Administrateur (Admin)**
- Accès complet au backoffice
- Gestion des excursions
- Gestion des commandes
- Gestion des utilisateurs
- Configuration système
- Accès aux analytiques

---

## 3. Spécifications Techniques

### 3.1 Architecture

#### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Langage:** TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn/UI
- **État global:** React Context API
- **Animations:** Framer Motion
- **Internationalisation:** next-intl

#### **Backend**
- **API:** Next.js API Routes (Route Handlers)
- **Architecture:** RESTful API
- **Validation:** Zod schemas

#### **Bases de Données**
- **MongoDB:**
  - Base de données unique pour toutes les collections
  - Excursions (flexible schema)
  - Utilisateurs et authentification
  - Réservations/Commandes
  - Reviews
  - Badges et scans
  - Capacités
  - Notifications
  - Logs SMS/WhatsApp
  - Paramètres système

#### **Authentification**
- **Provider:** Clerk
- **Méthodes:** Email/Password, OAuth
- **Webhooks:** Synchronisation utilisateurs

#### **Paiement**
- **Gateway:** CMI (Centre Monétique Interbancaire)
- **Méthode:** Cartes bancaires marocaines
- **Sécurité:** Tokenisation, 3D Secure

### 3.2 Technologies & Dépendances

```json
{
  "runtime": "Bun",
  "framework": "Next.js 15",
  "ui": [
    "Tailwind CSS v4",
    "Shadcn/UI",
    "Radix UI",
    "Lucide Icons"
  ],
  "database": "MongoDB (Mongoose)",
  "auth": "Clerk",
  "payments": "CMI Payment Gateway",
  "notifications": [
    "Nodemailer (Email)",
    "SMS API",
    "WhatsApp Business API"
  ],
  "forms": "React Hook Form + Zod",
  "pdf": "jsPDF",
  "qrcode": "qrcode",
  "maps": "Leaflet"
}
```

### 3.3 Structure de la Base de Données

#### **MongoDB Collections**

**excursions:**
```typescript
{
  _id: ObjectId,
  title: { fr: string, en: string, ar: string },
  slug: string (unique),
  description: { fr: string, en: string, ar: string },
  location: string,
  duration: string,
  priceMAD: number (0 = sur demande),
  images: string[],
  included: { fr: string[], en: string[], ar: string[] },
  notIncluded: { fr: string[], en: string[], ar: string[] },
  schedule: { fr: string[], en: string[], ar: string[] },
  category: string,
  featured: boolean,
  rating: number,
  reviewCount: number,
  extras: [{
    id: string,
    name: { fr: string, en: string, ar: string },
    priceMAD: number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**reviews:**
```typescript
{
  _id: ObjectId,
  excursionSlug: string,
  clerkId: string,
  userName: string,
  rating: number (1-5),
  comment: string,
  createdAt: Date
}
```

**users:**
```typescript
{
  _id: ObjectId,
  clerk_id: string (unique),
  email: string,
  name: string,
  phone: string,
  role: string (user/staff/admin),
  created_at: Date,
  updated_at: Date
}
```

**orders:**
```typescript
{
  _id: ObjectId,
  order_number: string (unique),
  user_id: ObjectId,
  clerk_id: string,
  status: string (pending/confirmed/completed/cancelled),
  total_price: number,
  currency: string,
  payment_status: string,
  payment_method: string,
  excursion_details: Object,
  customer_details: Object,
  created_at: Date,
  updated_at: Date
}
```

**badges:**
```typescript
{
  _id: ObjectId,
  badge_code: string (unique),
  user_id: ObjectId,
  order_id: ObjectId,
  excursion_name: string,
  date: string,
  status: string (active/used/revoked),
  qr_code_data: string,
  created_at: Date
}
```

**badge_scans:**
```typescript
{
  _id: ObjectId,
  badge_id: ObjectId,
  scanned_by: ObjectId,
  scanned_at: Date,
  location: string
}
```

**capacities:**
```typescript
{
  _id: ObjectId,
  excursion_id: string,
  date: string,
  max_capacity: number,
  current_bookings: number,
  available_spots: number
}
```

**wishlists:**
```typescript
{
  _id: ObjectId,
  user_id: ObjectId,
  excursion_id: string,
  created_at: Date
}
```

**notifications:**
```typescript
{
  _id: ObjectId,
  user_id: ObjectId,
  type: string,
  message: string,
  read: boolean,
  created_at: Date
}
```

**sms_logs / whatsapp_logs:**
```typescript
{
  _id: ObjectId,
  order_id: ObjectId,
  phone: string,
  message: string,
  status: string,
  sent_at: Date,
  delivered_at: Date
}
```

### 3.4 API Endpoints

#### **Public API**
```
GET  /api/excursions              # Liste des excursions
GET  /api/excursions/[slug]       # Détail d'une excursion
GET  /api/reviews/excursion/[slug] # Avis d'une excursion
POST /api/contact                 # Formulaire de contact
GET  /api/capacity/check          # Vérifier disponibilité
POST /api/orders                  # Créer une commande
POST /api/payment/initiate        # Initier un paiement
GET  /api/payment/cmi/status      # Statut de paiement
```

#### **API Authentifiée**
```
GET  /api/users/[clerk_id]        # Profil utilisateur
GET  /api/orders/number/[number]  # Détail commande
GET  /api/reservations/user/[id]  # Réservations utilisateur
POST /api/reviews                 # Créer un avis
GET  /api/wishlists/user/[id]     # Favoris utilisateur
POST /api/wishlists               # Ajouter aux favoris
GET  /api/badges/[badgeCode]      # Détail d'un badge
```

#### **API Admin**
```
GET    /api/admin/excursions           # Liste admin
POST   /api/admin/excursions           # Créer excursion
PUT    /api/admin/excursions/[id]      # Modifier excursion
DELETE /api/admin/excursions/[id]      # Supprimer excursion
POST   /api/admin/excursions/bulk-create # Création en masse
PUT    /api/admin/excursions/bulk-update-circuits # Mise à jour circuits
GET    /api/admin/orders               # Liste des commandes
PUT    /api/admin/orders/[id]          # Modifier commande
POST   /api/admin/orders/[id]/send-confirmation # Envoyer confirmation
GET    /api/admin/users                # Liste des utilisateurs
PUT    /api/admin/users/[id]/assign-role # Assigner rôle
GET    /api/admin/analytics            # Statistiques
POST   /api/admin/upload-image         # Upload d'images
GET    /api/capacity/calendar/[id]     # Calendrier de capacité
POST   /api/capacity/bulk              # Mise à jour capacités
```

#### **API Staff**
```
POST /api/badges/scan            # Scanner un badge
GET  /api/badges/scan-history    # Historique des scans
POST /api/badges/[code]/revoke   # Révoquer un badge
```

### 3.5 Intégrations Externes

#### **Clerk (Authentification)**
- Webhook: `/api/webhooks/clerk`
- Événements: user.created, user.updated, user.deleted
- Synchronisation automatique avec base de données locale

#### **CMI Payment Gateway**
- Initiation: `/api/payment/initiate`
- Callback: `/api/payments/callback`
- Success: `/api/payments/success`
- Fail: `/api/payments/fail`

#### **Services de Messaging**
- **SMS API:** Envoi de SMS transactionnels
- **WhatsApp Business API:** Messages enrichis avec webhooks
- **Nodemailer:** Envoi d'emails avec pièces jointes

#### **Services Cloud**
- **Upload d'images:** Storage local ou CDN
- **Génération PDF:** jsPDF côté serveur
- **QR Codes:** qrcode library

---

## 4. Fonctionnalités Spécifiques

### 4.1 Gestion des Tarifs "Sur Demande"

**Cas d'usage:** Certains circuits nécessitent un devis personnalisé.

**Implémentation:**
- `priceMAD: 0` dans la base de données
- Interface utilisateur adaptée:
  - Badge "Prix sur demande" / "Contact for pricing"
  - Bouton "Nous contacter" au lieu de "Ajouter au panier"
  - Dans le panier: message explicatif et lien vers contact

**Workflow:**
1. Client consulte un circuit à prix sur demande
2. Client clique sur "Nous contacter"
3. Formulaire de contact pré-rempli avec le circuit
4. Équipe contacte le client avec un devis
5. Réservation manuelle si acceptation

### 4.2 Système de Badges QR Code

**Fonctionnement:**
1. Génération automatique à la confirmation de commande
2. Badge unique par client/réservation
3. QR code contenant: badgeCode, userName, excursionName, date
4. Consultation: `/badge/[badgeCode]`
5. Scan par le personnel: validation instantanée
6. Traçabilité complète (qui, quand, où)

**Sécurité:**
- Codes uniques non-prédictibles
- Révocation possible
- Historique immuable
- Vérification de validité

### 4.3 Gestion Multi-capacité

**Système:**
- Capacité max par excursion et par date
- Vérification en temps réel lors de la réservation
- Calendrier visuel pour les admins
- Mise à jour automatique après chaque réservation
- Blocage si capacité atteinte

**Interface Admin:**
- Vue calendrier mensuelle
- Indicateurs visuels (vert/orange/rouge)
- Modification en masse des capacités
- Alertes si surbooking

### 4.4 Notifications Intelligentes

**Déclencheurs:**
- Nouvelle commande → Confirmation immédiate
- Paiement réussi → Facture + Badge
- J-2 avant excursion → Rappel avec détails
- Modification de commande → Notification
- Annulation → Confirmation d'annulation

**Canaux:**
- **SMS:** Messages courts, liens directs
- **WhatsApp:** Messages enrichis, images, boutons
- **Email:** Formatés HTML, pièces jointes PDF

**Préférences:**
- Opt-in/opt-out par canal
- Stockage des préférences par utilisateur
- Respect RGPD

### 4.5 Internationalisation (i18n)

**Langues supportées:**
- Français (fr) - Langue par défaut
- Anglais (en)
- Arabe (ar) - RTL support

**Implémentation:**
- next-intl pour le routing dynamique
- Fichiers de traduction JSON par namespace
- Traductions dans la base de données (excursions)
- Détection automatique de la langue navigateur
- Sélecteur de langue dans l'interface

**Structure:**
```
/[locale]/page              # Route localisée
messages/fr/common.json     # Traductions français
messages/en/common.json     # Traductions anglais
messages/ar/common.json     # Traductions arabe
```

---

## 5. Design & UX

### 5.1 Identité Visuelle

**Palette de couleurs:**
- **Primaire:** #FFB73F (Or/Sable) - Évoque le désert marocain
- **Accent:** #70CFF1 (Bleu ciel) - Rappelle le ciel et la mer
- **Texte:** #1A1A1A (Noir profond)
- **Arrière-plan:** #FFFFFF (Blanc)
- **Secondaire:** #F0F7FB (Bleu pâle)

**Typographie:**
- **Titres:** Libre Baskerville (serif, élégant)
- **Corps:** Lexend Deca (sans-serif, lisible)

**Effets visuels:**
- Glassmorphism subtil (backdrop blur)
- Boutons pill-shaped avec gradients
- Animations micro-interactions
- Border radius: 20px (cartes), 9999px (boutons)
- Hover effects: translateY + scale

### 5.2 Composants UI

**Shadcn/UI components:**
- Button, Input, Select, Checkbox
- Dialog, Sheet, Popover, Dropdown Menu
- Card, Badge, Avatar
- Table, Pagination
- Accordion, Tabs
- Calendar, Date Picker
- Form components (React Hook Form)

**Composants personnalisés:**
- ExcursionCard: Carte d'excursion avec image, prix, rating
- BookingForm: Formulaire de réservation complexe
- CartSummary: Récapitulatif panier
- BadgeDisplay: Affichage badge avec QR code
- CapacityCalendar: Calendrier de gestion
- NotificationToast: Toasts personnalisés (sonner)

### 5.3 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptations:**
- Navigation: Hamburger menu (mobile) → Full nav (desktop)
- Cartes: Stack vertical (mobile) → Grid (desktop)
- Formulaires: 1 colonne (mobile) → 2 colonnes (desktop)
- Images: Optimisées par taille d'écran

### 5.4 Accessibilité

**Standards:**
- WCAG 2.1 Level AA
- Navigation au clavier
- ARIA labels appropriés
- Contraste de couleurs suffisant
- Focus states visibles
- Screen reader friendly

**Implémentation:**
- Focus-visible outlines
- Skip to content links
- Alt text pour toutes les images
- Labels explicites sur les formulaires
- Messages d'erreur clairs

---

## 6. Sécurité

### 6.1 Authentification & Autorisation

**Clerk:**
- Sessions sécurisées (JWT)
- Protection CSRF
- Rate limiting
- 2FA disponible (email)

**Middleware:**
- Vérification de rôle avant accès admin
- Vérification de session sur routes protégées
- Protection API endpoints

### 6.2 Données

**Validation:**
- Zod schemas côté serveur
- Validation côté client (React Hook Form)
- Sanitization des inputs
- Protection XSS

**Paiements:**
- PCI-DSS compliance via CMI
- Pas de stockage de données de carte
- Tokenisation des paiements
- HTTPS obligatoire
- 3D Secure

### 6.3 API Security

**Protection:**
- Rate limiting par IP
- CORS configuré
- Authentication required pour endpoints sensibles
- Input validation stricte
- SQL injection prevention (ORM)
- NoSQL injection prevention (sanitization)

### 6.4 RGPD

**Conformité:**
- Consentement pour les cookies
- Politique de confidentialité
- Droit à l'oubli (suppression compte)
- Export des données personnelles
- Opt-out notifications
- Logs de traitement

---

## 7. Performance & Optimisation

### 7.1 Frontend

**Next.js optimisations:**
- Server Components par défaut
- Streaming SSR
- Code splitting automatique
- Image optimization (next/image)
- Font optimization (next/font)
- Lazy loading des composants

**Caching:**
- Static Generation (SSG) pour pages publiques
- Incremental Static Regeneration (ISR) pour excursions
- Client-side caching (React Query possible)

### 7.2 Backend

**Database:**
- Indexation appropriée (MongoDB: slug, SQLite: clerk_id, order_number)
- Requêtes optimisées (select only needed fields)
- Connection pooling

**API:**
- Response caching headers
- Compression (gzip/brotli)
- Pagination pour listes longues
- Batch operations pour bulk updates

### 7.3 Assets

**Images:**
- Formats modernes (WebP, AVIF)
- Responsive images (srcset)
- Lazy loading
- CDN possible (future)

**Scripts:**
- Bundle minimization
- Tree shaking
- Dynamic imports
- Prefetching des routes critiques

### 7.4 Monitoring

**À implémenter:**
- Error tracking (Sentry)
- Performance monitoring
- Analytics (Google Analytics)
- Uptime monitoring
- Logs centralisés

---

## 8. Déploiement & Environnements

### 8.1 Environnements

**Development:**
- Local avec bun dev
- Hot reload
- Debug mode
- Test databases

**Staging:**
- Environnement de pré-production
- Tests E2E
- Validation client

**Production:**
- Serveur de production
- Monitoring actif
- Backups automatiques
- High availability

### 8.2 Configuration

**Variables d'environnement:**
```env
# Database
DATABASE_URL=              # SQLite
MONGODB_URI=               # MongoDB connection

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Payment
CMI_MERCHANT_ID=
CMI_API_KEY=
CMI_GATEWAY_URL=

# Notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMS_API_KEY=
WHATSAPP_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

### 8.3 CI/CD

**Pipeline suggéré:**
1. Lint & TypeScript check
2. Run tests
3. Build production
4. Deploy to staging
5. E2E tests
6. Manual approval
7. Deploy to production
8. Health checks

---

## 9. Tests

### 9.1 Types de tests

**Unit tests:**
- Fonctions utilitaires
- Helpers de validation
- Composants isolés

**Integration tests:**
- API endpoints
- Database operations
- Authentication flows

**E2E tests:**
- Parcours de réservation complet
- Processus de paiement
- Admin workflows

### 9.2 Outils

**Framework:** Vitest (unit) + Playwright (E2E)

**Coverage attendu:**
- API routes: > 80%
- Fonctions critiques: 100%
- Composants UI: > 60%

---

## 10. Maintenance & Évolution

### 10.1 Maintenance

**Routine:**
- Mise à jour dépendances (mensuel)
- Backups base de données (quotidien)
- Monitoring des erreurs
- Nettoyage des logs
- Revue de sécurité (trimestriel)

**Documentation:**
- Code comments
- README technique
- API documentation
- User guides (admin)

### 10.2 Évolutions Futures

**Phase 2 (Court terme):**
- [ ] Application mobile (React Native)
- [ ] Programme de fidélité
- [ ] Avis photos/vidéos
- [ ] Chat en direct
- [ ] Multi-devises

**Phase 3 (Moyen terme):**
- [ ] Intégration OTA (Booking, Airbnb)
- [ ] Yield management dynamique
- [ ] Recommandations IA
- [ ] Tours virtuels 360°
- [ ] Marketplace partenaires

**Phase 4 (Long terme):**
- [ ] Application personnel mobile
- [ ] Gestion complète hôtelière (PMS)
- [ ] Business Intelligence avancé
- [ ] API publique pour partenaires
- [ ] White-label pour franchises

---

## 11. Contraintes & Limites

### 11.1 Techniques

- **Iframe compatibility:** App déployée dans iframe (limitations cookies)
- **Bun runtime:** Dépendances doivent être compatibles Bun
- **Next.js 15:** Pas de styled-jsx (incompatible Server Components)
- **Payment gateway:** Limité au CMI (cartes marocaines)

### 11.2 Business

- **Langues:** FR/EN/AR uniquement
- **Zone géographique:** Maroc principalement
- **Paiements:** Dirhams marocains (MAD) uniquement
- **Capacité:** Limitée par la taille du riad et partenaires

### 11.3 Légales

- **RGPD:** Compliance requise pour clients européens
- **CGV:** Conditions générales de vente à afficher
- **Licences tourisme:** Numéros de licence à afficher
- **Assurances:** Responsabilité civile professionnelle

---

## 12. Support & Formation

### 12.1 Documentation

**Pour administrateurs:**
- Guide d'utilisation du backoffice
- Procédures de gestion des commandes
- Gestion des capacités
- Configuration des excursions

**Pour le personnel:**
- Utilisation du scanner de badges
- Procédures d'accueil
- Gestion des incidents

### 12.2 Support Technique

**Niveaux:**
- **N1:** Questions utilisateurs (FAQ, chatbot)
- **N2:** Support admin (email, ticket)
- **N3:** Bugs techniques (développeur)

**SLA:**
- Critique (site down): < 1h
- Important (bug majeur): < 4h
- Normal (question): < 24h
- Mineur (amélioration): < 7j

---

## 13. Budget & Ressources

### 13.1 Infrastructure

**Hébergement:**
- Serveur web (Next.js)
- Base de données (MongoDB + SQLite)
- CDN (optionnel)
- Backups

**Services:**
- Clerk (authentification)
- CMI (paiement)
- SMS provider
- WhatsApp Business API
- Email provider
- Monitoring

### 13.2 Licences

- Next.js: Gratuit (MIT)
- Tailwind CSS: Gratuit (MIT)
- Shadcn/UI: Gratuit (MIT)
- Clerk: Freemium (à vérifier)
- MongoDB: Community (gratuit) ou Atlas
- Fonts Google: Gratuit

---

## 14. Glossaire

- **Riad:** Maison traditionnelle marocaine avec patio intérieur
- **Circuit:** Tour organisé multi-jours
- **Excursion:** Sortie touristique d'une journée
- **Badge:** QR code d'identification client
- **CMI:** Centre Monétique Interbancaire (paiement Maroc)
- **MAD:** Dirham marocain (devise)
- **Clerk:** Service d'authentification SaaS
- **Mongoose:** ODM pour MongoDB
- **Shadcn/UI:** Bibliothèque de composants React

---

## 15. Annexes

### 15.1 Contact Projet

**Équipe de développement:**
- Développeur principal: [À compléter]
- Designer UI/UX: [À compléter]
- Chef de projet: [À compléter]

**Client:**
- Propriétaire du riad: [À compléter]
- Contact technique: [À compléter]

### 15.2 Références

- Documentation Next.js 15: https://nextjs.org/docs
- Documentation Clerk: https://clerk.com/docs
- Tailwind CSS v4: https://tailwindcss.com/docs
- MongoDB: https://www.mongodb.com/docs
- Mongoose: https://mongoosejs.com/docs

---

**Document créé le:** 28 Novembre 2025  
**Dernière mise à jour:** 28 Novembre 2025  
**Version:** 1.0  
**Statut:** Document vivant - Mise à jour continue

---

*Ce cahier des charges est un document technique et fonctionnel complet décrivant la plateforme de réservation du riad. Il sert de référence pour le développement, la maintenance et l'évolution du système.*