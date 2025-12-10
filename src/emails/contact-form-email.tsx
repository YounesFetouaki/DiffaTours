import * as React from 'react';

interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function ContactFormEmail({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}: ContactFormEmailProps) {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            color: #FFB73F;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 24px;
            border-bottom: 3px solid #FFB73F;
            padding-bottom: 12px;
          }
          .field {
            margin-bottom: 20px;
          }
          .label {
            color: #666666;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .value {
            color: #1a1a1a;
            font-size: 16px;
            line-height: 1.6;
          }
          .message-box {
            background-color: #f9f9f9;
            padding: 16px;
            border-radius: 4px;
            border-left: 4px solid #70CFF1;
            margin-top: 8px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #8898aa;
            font-size: 12px;
            text-align: center;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            📬 Nouveau message de contact
          </div>
          
          <div className="field">
            <div className="label">Nom complet</div>
            <div className="value">{firstName} {lastName}</div>
          </div>
          
          <div className="field">
            <div className="label">Email</div>
            <div className="value">
              <a href={`mailto:${email}`} style={{ color: '#70CFF1', textDecoration: 'none' }}>
                {email}
              </a>
            </div>
          </div>
          
          {phone && (
            <div className="field">
              <div className="label">Téléphone</div>
              <div className="value">
                <a href={`tel:${phone}`} style={{ color: '#70CFF1', textDecoration: 'none' }}>
                  {phone}
                </a>
              </div>
            </div>
          )}
          
          <div className="field">
            <div className="label">Sujet</div>
            <div className="value">{subject}</div>
          </div>
          
          <div className="field">
            <div className="label">Message</div>
            <div className="message-box">{message}</div>
          </div>
          
          <div className="footer">
            Répondez directement à cet email pour contacter {firstName} {lastName}
          </div>
        </div>
      </body>
    </html>
  );
}
