import * as React from 'react';

interface CartItem {
  id: string;
  name: string;
  date: string;
  time?: string;
  adults: number;
  children: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cartItems: CartItem[];
  totalMad: number;
  badgeCode: string;
  badgeQrCodeUrl: string;
  paymentMethod: string;
  status: string;
}

export function OrderConfirmationEmail({
  orderNumber,
  firstName,
  lastName,
  email,
  phone,
  cartItems,
  totalMad,
  badgeCode,
  badgeQrCodeUrl,
  paymentMethod,
  status,
}: OrderConfirmationEmailProps) {
  const statusText = status === 'confirmed' ? 'Confirmée' : status === 'pending' ? 'En attente' : status;
  const statusColor = status === 'confirmed' ? '#10b981' : '#f59e0b';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            max-width: 650px;
            margin: 0 auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #FFB73F 0%, #F39C12 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            color: white;
            margin-bottom: 24px;
          }
          .section {
            margin-bottom: 32px;
          }
          .section-title {
            color: #FFB73F;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            border-bottom: 2px solid #FFB73F;
            padding-bottom: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 12px;
            margin-bottom: 8px;
          }
          .info-label {
            color: #666666;
            font-weight: 600;
            font-size: 14px;
          }
          .info-value {
            color: #1a1a1a;
            font-size: 14px;
          }
          .cart-item {
            background-color: #f9f9f9;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 12px;
            border-left: 4px solid #70CFF1;
          }
          .cart-item-name {
            font-weight: 700;
            color: #1a1a1a;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .cart-item-details {
            color: #666666;
            font-size: 13px;
            line-height: 1.6;
          }
          .total-box {
            background: linear-gradient(135deg, #f0f7fb 0%, #e8f4f8 100%);
            padding: 20px;
            border-radius: 6px;
            text-align: center;
            margin-top: 20px;
          }
          .total-label {
            color: #666666;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .total-amount {
            color: #1a1a1a;
            font-size: 32px;
            font-weight: 700;
          }
          .badge-box {
            background: linear-gradient(135deg, #FFB73F 0%, #F39C12 100%);
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            color: white;
            margin: 24px 0;
          }
          .badge-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .qr-code {
            background: white;
            padding: 16px;
            border-radius: 8px;
            display: inline-block;
            margin: 16px 0;
          }
          .qr-code img {
            display: block;
            max-width: 200px;
            height: auto;
          }
          .badge-code {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
            margin-top: 12px;
          }
          .badge-instruction {
            font-size: 14px;
            line-height: 1.6;
            margin-top: 16px;
            opacity: 0.95;
          }
          .important-note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            border-radius: 4px;
            margin: 24px 0;
          }
          .important-note-title {
            color: #856404;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .important-note-text {
            color: #856404;
            font-size: 13px;
            line-height: 1.6;
          }
          .footer {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 32px 30px;
            text-align: center;
          }
          .footer-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .footer-text {
            font-size: 13px;
            line-height: 1.6;
            opacity: 0.8;
            margin-bottom: 8px;
          }
          .footer-link {
            color: #70CFF1;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🎉 Réservation Confirmée !</h1>
            <p>Merci pour votre confiance en DiffaTours</p>
          </div>

          <div className="content">
            <div className="greeting">
              Bonjour {firstName} {lastName},
            </div>

            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#666', marginBottom: '24px' }}>
              Nous avons bien reçu votre réservation et sommes ravis de vous accueillir bientôt ! 
              Voici tous les détails de votre commande.
            </p>

            <div
              className="status-badge"
              style={{ backgroundColor: statusColor }}
            >
              📋 Statut : {statusText}
            </div>

            {/* Order Information */}
            <div className="section">
              <div className="section-title">📄 Informations de la commande</div>
              <div className="info-grid">
                <div className="info-label">Numéro de commande</div>
                <div className="info-value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {orderNumber}
                </div>
                <div className="info-label">Nom complet</div>
                <div className="info-value">{firstName} {lastName}</div>
                <div className="info-label">Email</div>
                <div className="info-value">{email}</div>
                <div className="info-label">Téléphone</div>
                <div className="info-value">{phone}</div>
                <div className="info-label">Mode de paiement</div>
                <div className="info-value">
                  {paymentMethod === 'cash' ? '💵 Paiement en espèces' : 
                   paymentMethod === 'cmi' ? '💳 Carte bancaire (CMI)' : 
                   '🏦 Virement bancaire'}
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="section">
              <div className="section-title">🗺️ Détails de vos excursions</div>
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-details">
                    📅 Date : {item.date}
                    {item.time && ` • ⏰ Heure : ${item.time}`}
                    <br />
                    👥 Participants : {item.adults} adulte(s)
                    {item.children > 0 && ` • 👶 ${item.children} enfant(s)`}
                    <br />
                    💰 Prix : {item.price.toFixed(2)} MAD
                  </div>
                </div>
              ))}

              <div className="total-box">
                <div className="total-label">Montant Total</div>
                <div className="total-amount">{totalMad.toFixed(2)} MAD</div>
              </div>
            </div>

            {/* Digital Badge */}
            <div className="badge-box">
              <div className="badge-title">🎫 Votre Badge Digital</div>
              <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                Présentez ce QR code à l'arrivée pour une vérification rapide
              </p>
              
              <div className="qr-code">
                <img src={badgeQrCodeUrl} alt="QR Code Badge" />
              </div>
              
              <div className="badge-code">
                Code : {badgeCode}
              </div>
              
              <div className="badge-instruction">
                ✓ Enregistrez ce QR code sur votre téléphone<br />
                ✓ Affichez-le à notre personnel lors de votre arrivée<br />
                ✓ Vous pouvez également imprimer cet email
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="important-note">
                <div className="important-note-title">⚠️ Important - Paiement en espèces</div>
                <div className="important-note-text">
                  Votre réservation est actuellement en attente de confirmation. 
                  Veuillez effectuer le paiement en espèces dès votre arrivée ou selon les instructions 
                  que vous recevrez de notre équipe. Une fois le paiement confirmé, 
                  votre réservation sera définitivement validée.
                </div>
              </div>
            )}

            <div className="section">
              <div className="section-title">📞 Besoin d'aide ?</div>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                Notre équipe est à votre disposition pour toute question ou demande particulière.
                N'hésitez pas à nous contacter !
              </p>
            </div>
          </div>

          <div className="footer">
            <div className="footer-title">DiffaTours</div>
            <div className="footer-text">
              Votre spécialiste des excursions au Maroc
            </div>
            <div className="footer-text">
              📧 Email : <a href="mailto:contact@diffatours.com" className="footer-link">contact@diffatours.com</a>
            </div>
            <div className="footer-text">
              🌐 Web : <a href="https://www.diffatours.com" className="footer-link">www.diffatours.com</a>
            </div>
            <div className="footer-text" style={{ marginTop: '16px', fontSize: '12px' }}>
              © {new Date().getFullYear()} DiffaTours. Tous droits réservés.
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
