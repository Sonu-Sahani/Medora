import { useState } from "react";
import { X, Star } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button.jsx";
import { createReviewApi } from "../../api/review.api.js";

const ReviewModal = ({ appointment, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating");
    setLoading(true);
    try {
      await createReviewApi({
        appointmentId: appointment._id,
        rating,
        comment,
      });
      toast.success("Thank you for your feedback!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} className="text-slate-400" />
        </button>

        <h2 className="text-lg font-bold text-slate-800 mb-1">Rate Your Experience</h2>
        <p className="text-slate-500 text-sm mb-6">
          How was your consultation with Dr. {appointment.doctor?.name}?
        </p>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-200"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={4}
          className="input-field resize-none mb-5"
        />

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;