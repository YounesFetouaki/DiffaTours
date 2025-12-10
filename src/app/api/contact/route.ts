import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ContactSubmission from '@/models/ContactSubmission';
import { gmailTransporter } from '@/lib/gmail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message, locale = 'fr' } = body;

    // Validate required fields
    const trimmedFirstName = firstName?.trim();
    if (!trimmedFirstName) {
      return NextResponse.json(
        { 
          error: 'First name is required',
          code: 'MISSING_FIRST_NAME' 
        },
        { status: 400 }
      );
    }

    const trimmedLastName = lastName?.trim();
    if (!trimmedLastName) {
      return NextResponse.json(
        { 
          error: 'Last name is required',
          code: 'MISSING_LAST_NAME' 
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL' 
        },
        { status: 400 }
      );
    }

    const trimmedSubject = subject?.trim();
    if (!trimmedSubject) {
      return NextResponse.json(
        { 
          error: 'Subject is required',
          code: 'MISSING_SUBJECT' 
        },
        { status: 400 }
      );
    }

    const trimmedMessage = message?.trim();
    if (!trimmedMessage) {
      return NextResponse.json(
        { 
          error: 'Message is required',
          code: 'MISSING_MESSAGE' 
        },
        { status: 400 }
      );
    }

    // Insert contact submission to database
    const newSubmission = await ContactSubmission.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail.toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    // Email translations
    const translations = {
      fr: {
        emailTitle: '📧 Nouveau Message de Contact',
        from: 'De:',
        email: 'Email:',
        phone: 'Téléphone:',
        subject: 'Sujet:',
        message: 'Message:',
        footer: 'Ce message a été envoyé via le formulaire de contact DifaTours',
        emailSubject: `[DifaTours] ${trimmedSubject} - De ${trimmedFirstName} ${trimmedLastName}`
      },
      en: {
        emailTitle: '📧 New Contact Message',
        from: 'From:',
        email: 'Email:',
        phone: 'Phone:',
        subject: 'Subject:',
        message: 'Message:',
        footer: 'This message was sent via the DifaTours contact form',
        emailSubject: `[DifaTours] ${trimmedSubject} - From ${trimmedFirstName} ${trimmedLastName}`
      },
      es: {
        emailTitle: '📧 Nuevo Mensaje de Contacto',
        from: 'De:',
        email: 'Correo electrónico:',
        phone: 'Teléfono:',
        subject: 'Asunto:',
        message: 'Mensaje:',
        footer: 'Este mensaje fue enviado a través del formulario de contacto de DifaTours',
        emailSubject: `[DifaTours] ${trimmedSubject} - De ${trimmedFirstName} ${trimmedLastName}`
      },
      it: {
        emailTitle: '📧 Nuovo Messaggio di Contatto',
        from: 'Da:',
        email: 'Email:',
        phone: 'Telefono:',
        subject: 'Oggetto:',
        message: 'Messaggio:',
        footer: 'Questo messaggio è stato inviato tramite il modulo di contatto DifaTours',
        emailSubject: `[DifaTours] ${trimmedSubject} - Da ${trimmedFirstName} ${trimmedLastName}`
      },
    };

    const t = translations[locale as keyof typeof translations] || translations.fr;

    // Send email notification to devinno.ma@gmail.com via Gmail
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FFB73F 0%, #70CFF1 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #FFB73F; margin-bottom: 5px; }
              .value { color: #333; }
              .message-box { background: #f0f7fb; padding: 15px; border-left: 4px solid #70CFF1; margin-top: 10px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${t.emailTitle}</h1>
                <p style="color: white; margin: 5px 0 0 0;">DifaTours</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">${t.from}</div>
                  <div class="value">${trimmedFirstName} ${trimmedLastName}</div>
                </div>
                <div class="field">
                  <div class="label">${t.email}</div>
                  <div class="value"><a href="mailto:${trimmedEmail}">${trimmedEmail}</a></div>
                </div>
                ${phone ? `
                <div class="field">
                  <div class="label">${t.phone}</div>
                  <div class="value">${phone}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">${t.subject}</div>
                  <div class="value">${trimmedSubject}</div>
                </div>
                <div class="field">
                  <div class="label">${t.message}</div>
                  <div class="message-box">${trimmedMessage.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              <div class="footer">
                ${t.footer}
              </div>
            </div>
          </body>
        </html>
      `;

      const mailOptions = {
        from: `"DifaTours Contact" <${process.env.EMAIL_USER}>`,
        to: 'devinno.ma@gmail.com',
        replyTo: trimmedEmail,
        subject: t.emailSubject,
        html: emailHtml,
        text: `
${t.emailTitle}

${t.from} ${trimmedFirstName} ${trimmedLastName}
${t.email} ${trimmedEmail}
${phone ? `${t.phone} ${phone}` : ''}
${t.subject} ${trimmedSubject}

${t.message}
${trimmedMessage}
        `,
      };

      await gmailTransporter.sendMail(mailOptions);
      console.log('Email sent successfully via Gmail');

      return NextResponse.json({
        ...newSubmission.toObject(),
        emailSent: true
      }, { status: 201 });
    } catch (emailError) {
      console.error('Email sending exception:', emailError);
      // Still return success since DB save worked
      return NextResponse.json({
        ...newSubmission.toObject(),
        emailSent: false,
        emailError: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 201 });
    }
  } catch (error) {
    console.error('POST contact submission error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}