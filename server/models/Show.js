import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
    {
        movie: { type: String, required: true, ref: 'Movie', index: true },
        showDateTime: { type: Date, required: true, index: true },
        showPrice: { type: Number, required: true },
        occupiedSeats: { type: Object, default: {} },
    }, { minimize: false }
)

// Create a compound index for common query patterns
showSchema.index({ movie: 1, showDateTime: 1 });

const Show = mongoose.model("Show", showSchema);

export default Show;