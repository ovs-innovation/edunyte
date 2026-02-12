import Booking from "../../models/bookingModel.js";

/**
 * Get all payments/bookings for admin
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Booking.find()
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .populate("courseId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ payments, count: payments.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Booking.findById(id)
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .populate("courseId", "name")
      .populate("languageId", "name code")
      .lean();

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

/**
 * Update payout status for a booking
 */
export const updatePayoutStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid payout status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.payout.status = status;
    await booking.save();

    res.json({ 
      message: "Payout status updated successfully",
      booking 
    });
  } catch (err) {
    next(err);
  }
};
