import express from 'express';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import PDFDocument from 'pdfkit';
import { sendMailHelper } from '../utils/mailHelper.js';

const router = express.Router();

// Helper to dynamically calculate and update car availability based on active confirmed or pending bookings
const updateCarAvailability = async (carId) => {
  if (!carId) return;
  try {
    const parseDateStr = (dateStr) => {
      if (!dateStr) return new Date(0);
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateStr);
    };

    // Find all active confirmed or pending bookings for this car
    const activeBookings = await Booking.find({ 
      carId, 
      status: { $in: ['Confirmed', 'Pending'] } 
    });

    if (activeBookings.length > 0) {
      // Find the booking with the latest drop date
      let latestBooking = activeBookings[0];
      let latestDate = parseDateStr(latestBooking.dropDate);

      for (let i = 1; i < activeBookings.length; i++) {
        const currentDate = parseDateStr(activeBookings[i].dropDate);
        if (currentDate > latestDate) {
          latestDate = currentDate;
          latestBooking = activeBookings[i];
        }
      }

      // Update car to be booked with the latest drop date
      await Car.findOneAndUpdate(
        { id: carId },
        { isBooked: true, availableFrom: latestBooking.dropDate }
      );
      console.log(`[Car Availability] Car ${carId} marked as booked. Available from ${latestBooking.dropDate} (based on ${activeBookings.length} active bookings).`);
    } else {
      // No active confirmed or pending bookings, make the car completely available
      await Car.findOneAndUpdate(
        { id: carId },
        { isBooked: false, availableFrom: '' }
      );
      console.log(`[Car Availability] Car ${carId} marked as completely available (0 active bookings).`);
    }
  } catch (error) {
    console.error(`[Car Availability] Error updating availability for car ${carId}:`, error);
  }
};

// Helper to configure email transporter
const sendBookingEmail = async (bookingData) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || '';
  const ownerEmail = OWNER_EMAIL || 'ganeshmanivnr2004@gmail.com';

  // 1. Send Email to the Customer/User
  try {
    await sendMailHelper({
      to: bookingData.email,
      replyTo: ownerEmail,
      subject: `Your Booking successfully send the owner - ID: ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #d4183d; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub</h1>
            <p style="color: #d4183d; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">Your Booking successfully send the owner</p>
          </div>
          
          <div style="margin-bottom: 25px; text-align: center;">
            <h2 style="color: #030213; margin: 0 0 10px 0;">Dear ${bookingData.customerName},</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
              Your Booking successfully send the owner! Thank you for reserving a car with My Car Hub. Your booking request with ID <strong>${bookingData.bookingId}</strong> has been successfully received and is currently pending review.
            </p>
            <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 10px;">
              Our administrator team is verifying the availability of the vehicle. You will receive an official booking confirmation email with a PDF summary receipt as soon as your booking is approved!
            </p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <h3 style="color: #030213; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 14px;">RENTAL VEHICLE & SCHEDULE SUMMARY</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 40%;"><strong>Vehicle Reserved:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.carName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Booking ID:</strong></td>
                <td style="padding: 4px 0; color: #111;"><code>${bookingData.bookingId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Pickup Schedule:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.pickupDate} at ${bookingData.pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Drop Schedule:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.dropDate} at ${bookingData.dropTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Rental Duration:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.durationDays} Day(s)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Estimated Price:</strong></td>
                <td style="padding: 4px 0; color: #d4183d; font-weight: bold; font-size: 14px;">₹${bookingData.totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Current Status:</strong></td>
                <td style="padding: 4px 0; color: #d4183d; font-weight: bold; font-size: 12px; uppercase;">PENDING APPROVAL</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was automatically generated by the My Car Hub Platform booking scheduler.
          </div>
        </div>
      `
    });
    console.log(`[Mail Helper] Customer booking alert ('Your Booking successfully send the owner') sent successfully to: ${bookingData.email}`);
  } catch (error) {
    console.error('[Mail Helper] Error sending customer booking alert:', error);
  }

  // 2. Send Email to the Owner
  try {
    await sendMailHelper({
      to: ownerEmail,
      replyTo: bookingData.email,
      subject: `New Booking Requested Recived - ID: ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #d4183d; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub Admin</h1>
            <p style="color: #d4183d; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">New Booking Requested Recived</p>
          </div>
          
          <div style="margin-bottom: 25px; text-align: center;">
            <h2 style="color: #030213; margin: 0 0 10px 0;">Hello Owner,</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
              <strong>New Booking Requested Recived!</strong> A customer has submitted a new reservation request on My Car Hub. The details are provided below.
            </p>
            <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 10px;">
              Please log in to the admin panel to review and approve or reject this booking request.
            </p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <h3 style="color: #030213; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 14px;">CUSTOMER & RENTAL DETAILS</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 40%;"><strong>Customer Name:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Customer Phone:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Customer Email:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Vehicle Requested:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.carName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Booking ID:</strong></td>
                <td style="padding: 4px 0; color: #111;"><code>${bookingData.bookingId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Pickup Schedule:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.pickupDate} at ${bookingData.pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Drop Schedule:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.dropDate} at ${bookingData.dropTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Rental Duration:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.durationDays} Day(s)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Estimated Price:</strong></td>
                <td style="padding: 4px 0; color: #d4183d; font-weight: bold; font-size: 14px;">₹${bookingData.totalAmount}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was automatically generated by the My Car Hub Platform booking scheduler.
          </div>
        </div>
      `
    });
    console.log(`[Mail Helper] Owner booking alert ('New Booking Requested Recived') sent successfully to: ${ownerEmail}`);
  } catch (error) {
    console.error('[Mail Helper] Error sending owner booking alert:', error);
  }
};

// Helper to generate a PDF receipt in-memory
const generateReceiptPDF = (bookingData, car = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- Brand Header ---
      doc.fillColor('#d4183d').fontSize(26).font('Helvetica-Bold').text('My Car Hub', 50, 50);
      doc.fillColor('#666666').fontSize(10).font('Helvetica-Bold').text('PREMIUM RENTAL SERVICES', 50, 80);
      
      // Receipt Details (Top Right)
      doc.fillColor('#333333').fontSize(18).font('Helvetica-Bold').text('RENTAL CONFIRMATION', 250, 50, { align: 'right', width: 295 });
      doc.fillColor('#555555').fontSize(10).font('Helvetica');
      doc.text(`Booking Ref: REC-${bookingData.bookingId}`, 250, 75, { align: 'right', width: 295 });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 250, 90, { align: 'right', width: 295 });
      
      // Decorative line separator
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 115).lineTo(545, 115).stroke();
      
      // --- Columns Grid: Customer & Reservation Info ---
      // Left Column: Customer Info
      doc.fillColor('#333333').fontSize(12).font('Helvetica-Bold').text('Customer Information', 50, 140);
      doc.fillColor('#555555').fontSize(10).font('Helvetica');
      doc.text(`Full Name: ${bookingData.customerName}`, 50, 160);
      doc.text(`Email Address: ${bookingData.email || 'N/A'}`, 50, 175);
      doc.text(`Phone Number: ${bookingData.phone}`, 50, 190);
      
      // Right Column: Rental Details
      doc.fillColor('#333333').fontSize(12).font('Helvetica-Bold').text('Vehicle Information', 300, 140);
      doc.fillColor('#555555').fontSize(10).font('Helvetica');
      doc.text(`Car Reserved: ${bookingData.carName}`, 300, 160);
      doc.text(`Car Number: ${bookingData.carId}`, 300, 172);
      const transmission = car ? (car.category === 'automatic' ? 'Automatic' : 'Manual') : 'Self-Drive';
      const capacity = car ? `${car.seater}-Seater` : '5-Seater';
      doc.text(`Transmission: ${transmission}`, 300, 184);
      doc.text(`Seating Capacity: ${capacity}`, 300, 196);
      doc.text(`Rental Duration: ${bookingData.durationDays} Day(s)`, 300, 208);
      
      // Decorative separator
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 220).lineTo(545, 220).stroke();
      
      // --- Table Section: Schedule Details ---
      // Table Header Background
      doc.rect(50, 240, 495, 25).fill('#d4183d');
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
      doc.text('RESERVATION TIMELINE', 65, 248);
      doc.text('PICKUP TIME', 230, 248);
      doc.text('DROP TIME', 390, 248);
      
      // Table Rows
      const slotLabel = car ? `${car.category === 'automatic' ? 'Automatic' : 'Manual'} Car Rental Slot` : 'Self-Drive Rental Slot';
      doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text(slotLabel, 65, 280);
      doc.fillColor('#666666').font('Helvetica').text(`${bookingData.pickupDate}`, 230, 280);
      doc.text(`at ${bookingData.pickupTime}`, 230, 295);
      doc.text(`${bookingData.dropDate}`, 390, 280);
      doc.text(`at ${bookingData.dropTime}`, 390, 295);
      
      // Separator
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 325).lineTo(545, 325).stroke();
      
      // --- Pricing and Booking Summary ---
      doc.fillColor('#333333').fontSize(12).font('Helvetica-Bold').text('Booking Cost Summary', 50, 350);
      doc.fillColor('#555555').fontSize(10).font('Helvetica');
      doc.text('Booking Status: Confirmed', 50, 370);
      doc.text('Payment Option: Pay at Pickup / Counter', 50, 385);
      doc.text('Billing Basis: Daily Rate Basis', 50, 400);
      
      // Pricing Box (Right Card)
      doc.rect(340, 350, 205, 70).fill('#fcfcfc');
      doc.strokeColor('#d4183d').lineWidth(1).rect(340, 350, 205, 70).stroke();
      
      doc.fillColor('#666666').fontSize(10).font('Helvetica-Bold').text('ESTIMATED TOTAL COST', 355, 365);
      doc.fillColor('#d4183d').fontSize(20).font('Helvetica-Bold').text(`Rs. ${Number(bookingData.totalAmount || 0).toLocaleString('en-IN')}`, 355, 385);
      
      // --- Terms and Notes Section ---
      doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold').text('Rental Terms & Conditions', 50, 460);
      doc.fillColor('#777777').fontSize(8).font('Helvetica');
      const terms = [
        "1. Security Deposit: A refundable security deposit may be required at the time of pickup.",
        "2. Driving License: Must present original valid Indian Driving License at time of vehicle hand-over.",
        "3. Fuel Policy: Vehicle must be returned with the same fuel level as at pickup, or refueling charges apply.",
        "4. Extension: Rental extensions are subject to vehicle availability and must be requested 6 hours in advance.",
        "5. Speed Limit: Adhere to the speed limits as prescribed by local laws. Excess speed penalties apply."
      ];
      let termsY = 480;
      terms.forEach((term) => {
        doc.text(term, 50, termsY);
        termsY += 15;
      });
      
      // --- Footer Section ---
      const footerY = 700;
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, footerY).lineTo(545, footerY).stroke();
      
      doc.fillColor('#999999').fontSize(9).font('Helvetica');
      doc.text('Thank you for choosing My Car Hub!', 50, footerY + 15, { align: 'center', width: 495 });
      doc.text(`For queries, contact support at ${process.env.OWNER_EMAIL || 'ganeshmanivnr2004@gmail.com'} or call +91 9597693716`, 50, footerY + 30, { align: 'center', width: 495 });
      doc.text('This is a computer-generated confirmation receipt and does not require a physical signature.', 50, footerY + 45, { align: 'center', width: 495 });
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Helper to send a confirmation email with PDF receipt
const sendConfirmationEmail = async (bookingData) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || '';

  try {
    // Fetch car details
    let car = null;
    try {
      car = await Car.findOne({ id: bookingData.carId });
    } catch (err) {
      // Quiet fallback
    }

    // Generate PDF receipt buffer
    const pdfBuffer = await generateReceiptPDF(bookingData, car);

    const toEmails = [bookingData.email, OWNER_EMAIL || 'ganeshmanivnr2004@gmail.com'];

    await sendMailHelper({
      to: toEmails,
      subject: `🎉 Booking Confirmed & Summary - ID: ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #d4183d; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub</h1>
            <p style="color: #d4183d; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">BOOKING CONFIRMED & RESERVED</p>
          </div>
          
          <div style="margin-bottom: 25px; text-align: center;">
            <h2 style="color: #2e7d32; margin: 0 0 10px 0;">Dear ${bookingData.customerName},</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
              Your car rental reservation has been <strong>successfully verified and confirmed</strong> by the My Car Hub administration team. 
              We have attached a copy of your <strong>official booking summary</strong> in PDF format to this email. Kindly present it at the counter at the time of pickup.
            </p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <h3 style="color: #030213; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 14px;">SUMMARY OF YOUR RENTAL</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 40%;"><strong>Vehicle Reserved:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.carName}${car ? ` (${car.seater}-Seater ${car.category === 'automatic' ? 'Automatic' : 'Manual'})` : ''}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Booking ID:</strong></td>
                <td style="padding: 4px 0; color: #111;"><code>${bookingData.bookingId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Pickup Schedule:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.pickupDate} at ${bookingData.pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Drop Schedule:</strong></td>
                <td style="padding: 4px 0; color: #111;">${bookingData.dropDate} at ${bookingData.dropTime}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Rental Duration:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.durationDays} Day(s)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Estimated Booking Cost:</strong></td>
                <td style="padding: 4px 0; color: #d4183d; font-weight: bold; font-size: 15px;">₹${bookingData.totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Payment:</strong></td>
                <td style="padding: 4px 0; color: #555;">Pay at Counter / Pickup</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="color: #1e3a8a; font-size: 12px; margin: 0; line-height: 1.5; text-align: center;">
              <strong>ℹ️ Pickup Instructions:</strong> Please remember to bring your original, valid <strong>Driving License</strong> and an <strong>Aadhar/Govt ID card</strong> at the time of vehicle hand-over. 
            </p>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was automatically generated by the My Car Hub Platform booking system.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `BookingSummary-${bookingData.bookingId}.pdf`,
          content: pdfBuffer
        }
      ]
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// Helper to send a cancellation email
const sendCancellationEmail = async (bookingData) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || '';

  try {
    const toEmails = [bookingData.email, OWNER_EMAIL || 'ganeshmanivnr2004@gmail.com'];

    await sendMailHelper({
      to: toEmails,
      subject: `🛑 Booking Cancelled - ID: ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #d4183d; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub</h1>
            <p style="color: #d4183d; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">BOOKING CANCELLED</p>
          </div>
          
          <div style="margin-bottom: 25px; text-align: center;">
            <h2 style="color: #c62828; margin: 0 0 10px 0;">Dear ${bookingData.customerName},</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
              Your car rental reservation with ID <strong>${bookingData.bookingId}</strong> has been <strong>Cancelled</strong>. 
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 10px;">
              If you did not request this cancellation or have any questions, please contact our support team immediately.
            </p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <h3 style="color: #030213; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 14px;">CANCELLED BOOKING DETAILS</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 40%;"><strong>Vehicle:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.carName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Booking ID:</strong></td>
                <td style="padding: 4px 0; color: #111;"><code>${bookingData.bookingId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Amount:</strong></td>
                <td style="padding: 4px 0; color: #d4183d; font-weight: bold;">₹${bookingData.totalAmount}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was automatically generated by the My Car Hub Platform booking system.
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};

// Helper to send a completion email
const sendCompletionEmail = async (bookingData) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || '';

  try {
    const toEmails = [bookingData.email, OWNER_EMAIL || 'ganeshmanivnr2004@gmail.com'];

    await sendMailHelper({
      to: toEmails,
      subject: `🏁 Booking Completed Successfully - ID: ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #d4183d; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub</h1>
            <p style="color: #2e7d32; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">RENTAL TRIP COMPLETED</p>
          </div>
          
          <div style="margin-bottom: 25px; text-align: center;">
            <h2 style="color: #2e7d32; margin: 0 0 10px 0;">Dear ${bookingData.customerName},</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
              Thank you for choosing My Car Hub! Your car rental reservation with ID <strong>${bookingData.bookingId}</strong> has been marked as <strong>Completed</strong>.
            </p>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-top: 10px;">
              We hope you had a safe and comfortable journey with our vehicle. We look forward to serving you again in the future!
            </p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <h3 style="color: #030213; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 14px;">RENTAL SUMMARY</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 40%;"><strong>Vehicle Rented:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.carName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Booking ID:</strong></td>
                <td style="padding: 4px 0; color: #111;"><code>${bookingData.bookingId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Total Amount Paid:</strong></td>
                <td style="padding: 4px 0; color: #2e7d32; font-weight: bold;">₹${bookingData.totalAmount}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was automatically generated by the My Car Hub Platform booking system.
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending completion email:', error);
  }
};

// Helper to send a correction email when status is wrongly selected and reverted backward
const sendCorrectionEmail = async (bookingData, oldStatus, newStatus) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || '';
  const ownerEmail = OWNER_EMAIL || 'ganeshmanivnr2004@gmail.com';

  try {
    const toEmails = [bookingData.email, ownerEmail];

    await sendMailHelper({
      to: toEmails,
      replyTo: ownerEmail,
      subject: `Your Booking not Completed, sorry for the mistake, The Correct Status mail for you will be sent soon! - ID: ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #d4183d; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub</h1>
            <p style="color: #d4183d; margin: 5px 0 0 0; font-weight: bold; font-size: 14px; line-height: 1.4;">
              Your Booking not Completed, sorry for the mistake, The Correct Status mail for you will be sent soon!
            </p>
          </div>
          
          <div style="margin-bottom: 25px; text-align: center;">
            <h2 style="color: #030213; margin: 0 0 10px 0;">Dear ${bookingData.customerName},</h2>
            <p style="color: #111; font-size: 15px; font-weight: bold; line-height: 1.6; margin: 15px 0; color: #d4183d;">
              Your Booking not Completed, sorry for the mistake, The Correct Status mail for you will be sent soon!
            </p>
            <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 0;">
              Please accept our apologies! A previous status notification marking your booking reservation as <strong>${oldStatus}</strong> was sent by mistake.
            </p>
            <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 10px;">
              We have reverted the status of your reservation back to <strong>Pending</strong> review while our administration team corrects this mistake. Please disregard the previous email.
            </p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <h3 style="color: #030213; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 6px; font-size: 14px;">RESERVATION DETAILS</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 40%;"><strong>Vehicle:</strong></td>
                <td style="padding: 4px 0; color: #111; font-weight: bold;">${bookingData.carName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Booking ID:</strong></td>
                <td style="padding: 4px 0; color: #111;"><code>${bookingData.bookingId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;"><strong>Current Status:</strong></td>
                <td style="padding: 4px 0; color: #d4183d; font-weight: bold; font-size: 12px; uppercase;">PENDING CORRECTION</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was automatically generated by the My Car Hub Platform booking system.
          </div>
        </div>
      `
    });
    console.log(`[Mail Helper] Correction apologies email sent successfully to: ${bookingData.email}`);
  } catch (error) {
    console.error('Error sending correction email:', error);
  }
};

// GET all bookings or paginated bookings
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (page && limit) {
      const skip = (page - 1) * limit;
      const totalBookings = await Booking.countDocuments({});
      const bookings = await Booking.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        bookings,
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings
      });
    } else {
      const bookings = await Booking.find({}).sort({ createdAt: -1 });
      res.json(bookings);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new booking
router.post('/', async (req, res) => {
  try {
    const {
      carId,
      carName,
      customerName,
      email,
      phone,
      pickupDate,
      pickupTime,
      dropDate,
      dropTime,
      durationDays,
      totalAmount,
    } = req.body;

    // Secure multi-layer server-side validation
    const nameRegex = /^[a-zA-Z\s]{3,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!customerName || !nameRegex.test(customerName)) {
      return res.status(400).json({ message: 'Invalid Customer Name. Name must be letters and spaces only, between 3 to 50 characters.' });
    }
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid Email Address.' });
    }
    if (!phone || !phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ message: 'Invalid Phone Number. Must be a valid 10-digit Indian mobile number.' });
    }
    if (!pickupDate || !pickupTime || !dropDate || !dropTime) {
      return res.status(400).json({ message: 'All date and time fields are required.' });
    }

    const bookingId = `MCH-${Math.floor(Math.random() * 90000) + 10000}`;

    const booking = new Booking({
      bookingId,
      carId,
      carName,
      customerName,
      email,
      phone,
      pickupDate,
      pickupTime,
      dropDate,
      dropTime,
      durationDays,
      totalAmount,
      status: 'Pending',
    });

    const createdBooking = await booking.save();

    // Trigger email alert asynchronously and await its complete sending
    await sendBookingEmail(createdBooking);

    // Sync car availability state in database
    await updateCarAvailability(createdBooking.carId);

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) a booking's status
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });

    if (booking) {
      const oldStatus = booking.status;
      const newStatus = req.body.status || booking.status;
      
      booking.status = newStatus;
      const updatedBooking = await booking.save();

      // Trigger correction email if transitioned backward or restored from mistaken Cancellation to Pending
      const isRevertedBackward = 
        (oldStatus === 'Completed' && (newStatus === 'Confirmed' || newStatus === 'Pending')) ||
        (oldStatus === 'Confirmed' && newStatus === 'Pending') ||
        (oldStatus === 'Cancelled' && newStatus === 'Pending');

      if (isRevertedBackward) {
        await sendCorrectionEmail(updatedBooking, oldStatus, newStatus);
      } else {
        // Send Confirmation email if transitioned to Confirmed
        if (newStatus === 'Confirmed' && oldStatus !== 'Confirmed') {
          await sendConfirmationEmail(updatedBooking);
        }

        // Send Cancellation email if transitioned to Cancelled
        if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
          await sendCancellationEmail(updatedBooking);
        }

        // Send Completion email if transitioned to Completed
        if (newStatus === 'Completed' && oldStatus !== 'Completed') {
          await sendCompletionEmail(updatedBooking);
        }
      }

      // Dynamically recalculate and update car availability based on all remaining active confirmed bookings
      await updateCarAvailability(updatedBooking.carId);

      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
