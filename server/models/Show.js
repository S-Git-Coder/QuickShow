import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
    {
        movie: { type: String, required: true, ref: 'Movie' },
        showDateTime: { type: Date, required: true },
        showPrice: { type: Number, default: 0 },
        occupiedSeats: { type: Object, default: {} },
        city: { type: String },
        theater: { type: String },
        screen: { type: String },
    }, { minimize: false }
)

const Show = mongoose.model("Show", showSchema);

export default Show;