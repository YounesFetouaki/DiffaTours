import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface CartItem {
  excursionName: string;
  excursionPrice: number;
  selectedItems: Array<{
    label: string;
    price: number;
  }>;
  ageGroups?: Array<{
    ageGroup: string;
    count: number;
    price: number;
  }>;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport: string;
  city: string;
  accommodationType: string;
  hotelName?: string;
  address?: string;
  cartItems: CartItem[];
  totalMad: number;
  paymentMethod: string;
  paymentStatus: string;
}

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#FFB73F',
  },
  companyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFB73F',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 15,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metaLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerDetails: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  detailLabel: {
    width: 150,
    color: '#666',
    fontWeight: 'bold',
    fontSize: 11,
  },
  detailValue: {
    flex: 1,
    color: '#1a1a1a',
    fontSize: 11,
  },
  excursionItem: {
    marginBottom: 20,
    border: '2px solid #e5e5e5',
    borderRadius: 5,
  },
  excursionHeader: {
    backgroundColor: '#FFB73F',
    color: '#ffffff',
    padding: 12,
    fontWeight: 'bold',
    fontSize: 14,
  },
  excursionBody: {
    padding: 15,
    backgroundColor: '#ffffff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    color: '#666',
    fontSize: 11,
  },
  priceValue: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontSize: 11,
  },
  extrasList: {
    marginTop: 10,
    marginLeft: 15,
  },
  extraItem: {
    paddingVertical: 3,
    color: '#666',
    fontSize: 10,
  },
  ageGroupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 8,
    marginVertical: 2,
    borderRadius: 3,
  },
  subtotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#e5e5e5',
    marginTop: 10,
    paddingTop: 10,
  },
  totalsSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  grandTotal: {
    borderTopWidth: 3,
    borderTopColor: '#FFB73F',
    marginTop: 10,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFB73F',
  },
  paymentInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  paymentInfoPending: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ff9800',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e5e5e5',
    textAlign: 'center',
  },
  thankYou: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFB73F',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#666',
    lineHeight: 1.6,
  },
  poweredBy: {
    fontSize: 8,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

// Translation helper function
function getTranslations(locale: string) {
  const translations: Record<string, any> = {
    en: {
      invoice: 'INVOICE',
      orderNumber: 'Order Number',
      date: 'Date',
      billTo: 'BILL TO',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      passport: 'Passport/ID',
      city: 'City',
      accommodation: 'Accommodation',
      hotel: 'Hotel/Riad',
      address: 'Address',
      excursions: 'EXCURSIONS',
      price: 'Price',
      basePrice: 'Base Price',
      extras: 'Extras',
      ageGroups: 'Age Groups',
      subtotal: 'Subtotal',
      total: 'TOTAL',
      paymentMethod: 'Payment Method',
      paymentStatus: 'Payment Status',
      cash: 'Cash (upon pickup)',
      online: 'Online Payment',
      paid: 'Paid',
      pending: 'Pending',
      thankYou: 'Thank you for your booking!',
      footer: 'For any questions, contact us at contact@diffatours.com',
    },
    fr: {
      invoice: 'FACTURE',
      orderNumber: 'Numéro de commande',
      date: 'Date',
      billTo: 'FACTURER À',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      passport: 'Passeport/ID',
      city: 'Ville',
      accommodation: 'Hébergement',
      hotel: 'Hôtel/Riad',
      address: 'Adresse',
      excursions: 'EXCURSIONS',
      price: 'Prix',
      basePrice: 'Prix de base',
      extras: 'Extras',
      ageGroups: 'Groupes d\'âge',
      subtotal: 'Sous-total',
      total: 'TOTAL',
      paymentMethod: 'Mode de paiement',
      paymentStatus: 'Statut du paiement',
      cash: 'Espèces (à la prise en charge)',
      online: 'Paiement en ligne',
      paid: 'Payé',
      pending: 'En attente',
      thankYou: 'Merci pour votre réservation !',
      footer: 'Pour toute question, contactez-nous à contact@diffatours.com',
    },
    es: {
      invoice: 'FACTURA',
      orderNumber: 'Número de pedido',
      date: 'Fecha',
      billTo: 'FACTURAR A',
      name: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      passport: 'Pasaporte/ID',
      city: 'Ciudad',
      accommodation: 'Alojamiento',
      hotel: 'Hotel/Riad',
      address: 'Dirección',
      excursions: 'EXCURSIONES',
      price: 'Precio',
      basePrice: 'Precio base',
      extras: 'Extras',
      ageGroups: 'Grupos de edad',
      subtotal: 'Subtotal',
      total: 'TOTAL',
      paymentMethod: 'Método de pago',
      paymentStatus: 'Estado del pago',
      cash: 'Efectivo (en recogida)',
      online: 'Pago en línea',
      paid: 'Pagado',
      pending: 'Pendiente',
      thankYou: '¡Gracias por tu reserva!',
      footer: 'Para cualquier pregunta, contáctanos en contact@diffatours.com',
    },
    ar: {
      invoice: 'فاتورة',
      orderNumber: 'رقم الطلب',
      date: 'التاريخ',
      billTo: 'الفاتورة إلى',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      passport: 'جواز السفر/الهوية',
      city: 'المدينة',
      accommodation: 'الإقامة',
      hotel: 'الفندق/الرياض',
      address: 'العنوان',
      excursions: 'الرحلات',
      price: 'السعر',
      basePrice: 'السعر الأساسي',
      extras: 'إضافات',
      ageGroups: 'الفئات العمرية',
      subtotal: 'المجموع الفرعي',
      total: 'المجموع',
      paymentMethod: 'طريقة الدفع',
      paymentStatus: 'حالة الدفع',
      cash: 'نقداً (عند الاستلام)',
      online: 'الدفع عبر الإنترنت',
      paid: 'مدفوع',
      pending: 'قيد الانتظار',
      thankYou: 'شكراً لحجزك!',
      footer: 'لأي استفسارات، اتصل بنا على contact@diffatours.com',
    },
    it: {
      invoice: 'FATTURA',
      orderNumber: 'Numero d\'ordine',
      date: 'Data',
      billTo: 'FATTURARE A',
      name: 'Nome',
      email: 'Email',
      phone: 'Telefono',
      passport: 'Passaporto/ID',
      city: 'Città',
      accommodation: 'Alloggio',
      hotel: 'Hotel/Riad',
      address: 'Indirizzo',
      excursions: 'ESCURSIONI',
      price: 'Prezzo',
      basePrice: 'Prezzo base',
      extras: 'Extra',
      ageGroups: 'Gruppi di età',
      subtotal: 'Subtotale',
      total: 'TOTALE',
      paymentMethod: 'Metodo di pagamento',
      paymentStatus: 'Stato del pagamento',
      cash: 'Contanti (al ritiro)',
      online: 'Pagamento online',
      paid: 'Pagato',
      pending: 'In attesa',
      thankYou: 'Grazie per la tua prenotazione!',
      footer: 'Per qualsiasi domanda, contattaci a contact@diffatours.com',
    },
  };

  return translations[locale] || translations.en;
}

function InvoiceDocument({ data, locale = 'en' }: { data: InvoiceData; locale?: string }) {
  const t = getTranslations(locale);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : locale === 'it' ? 'it-IT' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Diffa Tours</Text>
          <Text style={styles.invoiceTitle}>{t.invoice}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>{t.orderNumber}:</Text>
            <Text style={styles.metaValue}>{data.orderNumber}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.metaLabel}>{t.date}:</Text>
            <Text style={styles.metaValue}>{formatDate(data.orderDate)}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.customerDetails}>
          <Text style={styles.sectionTitle}>{t.billTo}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.name}:</Text>
            <Text style={styles.detailValue}>{data.firstName} {data.lastName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.email}:</Text>
            <Text style={styles.detailValue}>{data.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.phone}:</Text>
            <Text style={styles.detailValue}>{data.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.passport}:</Text>
            <Text style={styles.detailValue}>{data.passport}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.city}:</Text>
            <Text style={styles.detailValue}>{data.city}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.accommodation}:</Text>
            <Text style={styles.detailValue}>{data.accommodationType}</Text>
          </View>
          {data.hotelName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.hotel}:</Text>
              <Text style={styles.detailValue}>{data.hotelName}</Text>
            </View>
          )}
          {data.address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.address}:</Text>
              <Text style={styles.detailValue}>{data.address}</Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.excursions}</Text>
          {data.cartItems.map((item, index) => {
            const itemSubtotal =
              item.excursionPrice +
              item.selectedItems.reduce((sum, extra) => sum + extra.price, 0) +
              (item.ageGroups?.reduce((sum, ag) => sum + ag.count * ag.price, 0) || 0);

            return (
              <View key={index} style={styles.excursionItem}>
                <View style={styles.excursionHeader}>
                  <Text>{item.excursionName}</Text>
                </View>
                <View style={styles.excursionBody}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{t.basePrice}:</Text>
                    <Text style={styles.priceValue}>{item.excursionPrice.toFixed(2)} MAD</Text>
                  </View>

                  {item.selectedItems.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={[styles.priceLabel, { fontWeight: 'bold', marginBottom: 5 }]}>
                        {t.extras}:
                      </Text>
                      <View style={styles.extrasList}>
                        {item.selectedItems.map((extra, i) => (
                          <Text key={i} style={styles.extraItem}>
                            • {extra.label} - {extra.price.toFixed(2)} MAD
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {item.ageGroups && item.ageGroups.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={[styles.priceLabel, { fontWeight: 'bold', marginBottom: 5 }]}>
                        {t.ageGroups}:
                      </Text>
                      {item.ageGroups.map((ag, i) => (
                        <View key={i} style={styles.ageGroupItem}>
                          <Text style={{ fontSize: 10 }}>
                            {ag.ageGroup} (×{ag.count})
                          </Text>
                          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                            {(ag.count * ag.price).toFixed(2)} MAD
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={[styles.priceRow, styles.subtotalRow]}>
                    <Text style={[styles.priceLabel, { fontWeight: 'bold' }]}>{t.subtotal}:</Text>
                    <Text style={[styles.priceValue, { fontSize: 14, color: '#FFB73F' }]}>
                      {itemSubtotal.toFixed(2)} MAD
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>{t.total}</Text>
            <Text style={styles.grandTotalValue}>{data.totalMad.toFixed(2)} MAD</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View
          style={[
            styles.paymentInfo,
            data.paymentStatus === 'pending' ? styles.paymentInfoPending : {},
          ]}
        >
          <View style={styles.paymentRow}>
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{t.paymentMethod}:</Text>
            <Text style={{ fontSize: 11 }}>
              {data.paymentMethod === 'cash' ? t.cash : t.online}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{t.paymentStatus}:</Text>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 11,
                color: data.paymentStatus === 'paid' ? '#4caf50' : '#ff9800',
              }}
            >
              {data.paymentStatus === 'paid' ? t.paid : t.pending}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>{t.thankYou}</Text>
          <Text style={styles.footerText}>
            {t.footer}
            {'\n'}
            www.diffatours.com | +212 XXX XXX XXX
          </Text>
          <Text style={styles.poweredBy}>
            Powered by YourCompany
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(
  invoiceData: InvoiceData,
  locale: string = 'en'
): Promise<Buffer> {
  try {
    const doc = <InvoiceDocument data={invoiceData} locale={locale} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}